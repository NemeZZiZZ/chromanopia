# simulateBuffer()

Aplica simulación de daltonismo a un búfer de píxeles RGBA **in situ**. Esta es la función principal para el procesamiento de imágenes.

## Firma

```ts
function simulateBuffer(
  pixels: Uint8Array | Uint8ClampedArray,
  type: ColorblindType,
  options?: SimulateOptions,
): void
```

**Modifica el búfer de entrada.** Si necesitas preservar el original, clónalo primero.

## Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `pixels` | `Uint8Array \| Uint8ClampedArray` | Sí | Búfer de píxeles RGBA. La longitud debe ser múltiplo de 4. |
| `type` | `ColorblindType` | Sí | Tipo de deficiencia a simular |
| `options.model` | `ColorblindModel` | No | `"machado"` (por defecto), `"vienot"`, o `"brettel"` |
| `options.severity` | `number` | No | 0–1, por defecto `1`. Se ajusta al rango válido. |

## Ejemplos

### Canvas ImageData

```ts
import { simulateBuffer } from 'chromanopia'

const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

### Preservar el original

```ts
const original = ctx.getImageData(0, 0, canvas.width, canvas.height)
const copy = new ImageData(
  new Uint8ClampedArray(original.data),
  original.width,
  original.height,
)

simulateBuffer(copy.data, 'deuteranopia')
ctx.putImageData(copy, 0, 0)
```

### Node.js Buffer (Sharp)

```ts
const { data, info } = await sharp('photo.jpg')
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Buffer extiende Uint8Array — funciona directamente
simulateBuffer(data, 'tritanopia', { model: 'brettel' })
```

### Con severidad

```ts
simulateBuffer(pixels, 'protanomaly', { severity: 0.5 })
```

## Comportamiento

- **El canal alfa se preserva** — solo se modifican los bytes R, G, B (cada 4to byte se omite)
- Cuando `type` es `"none"` o `severity` es `0`, retorna inmediatamente (sin procesamiento)
- Para modelos de matriz (Viénot, Machado): sRGB → lineal → multiplicación de matriz → mapeo de gama → sRGB
- Para Brettel: sRGB → lineal → XYZ → proyección xyY → XYZ → lineal → sRGB
- Para Brettel con acromatopsia/acromatoamalía: recurre a la matriz de Machado

## Rendimiento

La función procesa 4 bytes a la vez sin asignaciones dentro del bucle principal. El rendimiento escala linealmente con la cantidad de píxeles:

| Resolución | Píxeles | Machado | Brettel |
|---|---|---|---|
| 640×480 | 307K | ~2ms | ~8ms |
| 1920×1080 | 2.1M | ~12ms | ~45ms |
| 3840×2160 | 8.3M | ~50ms | ~180ms |

*Medido en Apple M1, hilo único. Tus resultados pueden variar.*
