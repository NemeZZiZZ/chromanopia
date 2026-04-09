# Tipos y metadatos

## Tipos

### ColorblindType

Todos los tipos de deficiencia visual cromática soportados. `"none"` representa visión normal (identidad / sin operación).

```ts
type ColorblindType =
  | "none"
  | "protanopia"
  | "protanomaly"
  | "deuteranopia"
  | "deuteranomaly"
  | "tritanopia"
  | "tritanomaly"
  | "achromatopsia"
  | "achromatomaly"
```

### ColorblindModel

Modelos de simulación disponibles.

```ts
type ColorblindModel = "vienot" | "machado" | "brettel"
```

### SimulateOptions

Opciones para `simulate()`, `simulateBuffer()` y `getMatrix()`.

```ts
interface SimulateOptions {
  /** Simulation model. Default: "machado". */
  model?: ColorblindModel
  /** Deficiency severity from 0 (none) to 1 (full). Default: 1. */
  severity?: number
}
```

### RGB

Color RGB como un objeto con canales enteros de 0–255.

```ts
interface RGB {
  r: number
  g: number
  b: number
}
```

### Matrix3x3

Una matriz de color 3×3 como una tupla plana de 9 elementos en orden por filas (row-major).

```ts
type Matrix3x3 = [
  number, number, number,
  number, number, number,
  number, number, number,
]
```

### DeficiencyInfo

Metadatos para un tipo de deficiencia.

```ts
interface DeficiencyInfo {
  label: string
  description: string
  /** Representative color preview (hex). */
  color: string
}
```

### ModelInfo

Metadatos para un modelo de simulación.

```ts
interface ModelInfo {
  label: string
  description: string
}
```

## Objetos de metadatos

### COLORBLIND_TYPES

`Record<ColorblindType, DeficiencyInfo>` — metadatos para los 9 tipos de deficiencia (incluyendo `"none"`).

```ts
import { COLORBLIND_TYPES } from 'chromanopia'

COLORBLIND_TYPES.protanopia
// {
//   label: "Protanopia",
//   description: "Red-blind, cannot perceive red light",
//   color: "#9b9a43"
// }
```

Útil para construir selectores de UI, leyendas y tooltips.

| Tipo | Etiqueta | Descripción | Vista previa |
|---|---|---|---|
| `none` | Normal Vision | Sin deficiencia visual cromática | `#e63946` |
| `protanopia` | Protanopia | Ciego al rojo, no puede percibir la luz roja | `#9b9a43` |
| `protanomaly` | Protanomaly | Débil al rojo, sensibilidad reducida al rojo | `#c67344` |
| `deuteranopia` | Deuteranopia | Ciego al verde, no puede percibir la luz verde | `#a5b242` |
| `deuteranomaly` | Deuteranomaly | Débil al verde, sensibilidad reducida al verde | `#c36644` |
| `tritanopia` | Tritanopia | Ciego al azul, no puede percibir la luz azul | `#dd4040` |
| `tritanomaly` | Tritanomaly | Débil al azul, sensibilidad reducida al azul | `#e03c44` |
| `achromatopsia` | Achromatopsia | Daltonismo total, solo ve en escala de grises | `#6e6e6e` |
| `achromatomaly` | Achromatomaly | Daltonismo parcial, percepción de color reducida | `#a5565c` |

### COLORBLIND_MODELS

`Record<ColorblindModel, ModelInfo>` — metadatos para los 3 modelos de simulación.

```ts
import { COLORBLIND_MODELS } from 'chromanopia'

COLORBLIND_MODELS.machado
// {
//   label: "Machado",
//   description: "Spectral-shift 3×3 matrix (2009), more accurate"
// }
```

| Modelo | Etiqueta | Descripción |
|---|---|---|
| `vienot` | Viénot | Matriz 3×3 simplificada (1999), rápida y ampliamente utilizada |
| `machado` | Machado | Matriz 3×3 de desplazamiento espectral (2009), más precisa |
| `brettel` | Brettel | Proyección de punto de confusión en CIE xyY (1997), la más precisa, más lenta |

## Utilidades de bajo nivel

Estas se exportan para casos de uso avanzados (pipelines personalizados, shaders, etc.).

### hexToRgb(hex)

```ts
function hexToRgb(hex: string): RGB
```

Parsea `#RGB`, `#RRGGBB`, `RGB` o `RRGGBB` en un objeto RGB. Lanza error en entrada inválida.

### rgbToHex(rgb)

```ts
function rgbToHex(rgb: RGB): string
```

Convierte un objeto RGB a cadena `#rrggbb`. Ajusta y redondea los valores.

### srgbToLinear(v)

```ts
function srgbToLinear(v: number): number
```

Convierte un valor sRGB individual (0–255) a lineal [0,1]. Usa una LUT precalculada para velocidad.

### linearToSrgb(c)

```ts
function linearToSrgb(c: number): number
```

Convierte un valor lineal [0,1] a sRGB (0–255). Ajusta al rango válido.

### gamutMap(r, g, b)

```ts
function gamutMap(r: number, g: number, b: number): [number, number, number]
```

Mapea un triplete RGB lineal fuera de gama al rango [0,1] desaturando hacia su luminancia Rec. 709. Devuelve la entrada sin cambios si ya está dentro de la gama.
