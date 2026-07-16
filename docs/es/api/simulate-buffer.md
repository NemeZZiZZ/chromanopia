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

La función procesa 4 bytes a la vez sin asignaciones dentro del bucle principal. El rendimiento escala linealmente con la cantidad de píxeles. En un motor de JavaScript caliente, espera aproximadamente:

| Resolución | Píxeles | Viénot | Machado | Brettel |
|---|---|---|---|---|
| 640×480 | 0.3M | ~80ms | ~85ms | ~100ms |
| 1920×1080 | 2.1M | ~590ms | ~560ms | ~660ms |
| 3840×2160 | 8.3M | ~2.4s | ~2.2s | ~2.6s |

*Un punto de referencia — Apple M1, Node 22, JIT caliente. Los tres modelos corren a aproximadamente ~3.5 Mpix/s; la proyección CIE xyY por píxel de Brettel es solo ~15–20% más lenta que la ruta de matriz, no la brecha de varios× que uno esperaría por su ventaja de precisión.*

::: tip
Estos son tiempos de CPU/JavaScript. Para el procesamiento de imágenes en tiempo real, un [shader WebGL](../guide/recipes#webgl-uniforme-de-shader) ejecuta la misma matriz en la GPU a 10–100× el rendimiento. Los números de arriba están bien para transformaciones de una sola vez (p. ej. procesar una imagen subida una vez).
:::
