# Types & Metadata

## Types

### ColorblindType

All supported color vision deficiency types. `"none"` represents normal vision (identity / no-op).

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

Available simulation models.

```ts
type ColorblindModel = "vienot" | "machado" | "brettel"
```

### SimulateOptions

Options for `simulate()`, `simulateBuffer()`, and `getMatrix()`.

```ts
interface SimulateOptions {
  /** Simulation model. Default: "machado". */
  model?: ColorblindModel
  /** Deficiency severity from 0 (none) to 1 (full). Default: 1. */
  severity?: number
}
```

### RGB

RGB color as an object with 0–255 integer channels.

```ts
interface RGB {
  r: number
  g: number
  b: number
}
```

### Matrix3x3

A 3×3 color matrix as a flat 9-element tuple in row-major order.

```ts
type Matrix3x3 = [
  number, number, number,
  number, number, number,
  number, number, number,
]
```

### DeficiencyInfo

Metadata for a deficiency type.

```ts
interface DeficiencyInfo {
  label: string
  description: string
  /** Representative color preview (hex). */
  color: string
}
```

### ModelInfo

Metadata for a simulation model.

```ts
interface ModelInfo {
  label: string
  description: string
}
```

## Metadata Objects

### COLORBLIND_TYPES

`Record<ColorblindType, DeficiencyInfo>` — metadata for all 9 deficiency types (including `"none"`).

```ts
import { COLORBLIND_TYPES } from 'chromanopia'

COLORBLIND_TYPES.protanopia
// {
//   label: "Protanopia",
//   description: "Red-blind, cannot perceive red light",
//   color: "#9b9a43"
// }
```

Useful for building UI selectors, legends, and tooltips.

| Type | Label | Description | Preview |
|---|---|---|---|
| `none` | Normal Vision | No color vision deficiency | `#e63946` |
| `protanopia` | Protanopia | Red-blind, cannot perceive red light | `#9b9a43` |
| `protanomaly` | Protanomaly | Red-weak, reduced sensitivity to red | `#c67344` |
| `deuteranopia` | Deuteranopia | Green-blind, cannot perceive green light | `#a5b242` |
| `deuteranomaly` | Deuteranomaly | Green-weak, reduced sensitivity to green | `#c36644` |
| `tritanopia` | Tritanopia | Blue-blind, cannot perceive blue light | `#dd4040` |
| `tritanomaly` | Tritanomaly | Blue-weak, reduced sensitivity to blue | `#e03c44` |
| `achromatopsia` | Achromatopsia | Total color blindness, sees only grayscale | `#6e6e6e` |
| `achromatomaly` | Achromatomaly | Partial color blindness, reduced color perception | `#a5565c` |

### COLORBLIND_MODELS

`Record<ColorblindModel, ModelInfo>` — metadata for all 3 simulation models.

```ts
import { COLORBLIND_MODELS } from 'chromanopia'

COLORBLIND_MODELS.machado
// {
//   label: "Machado",
//   description: "Spectral-shift 3×3 matrix (2009), more accurate"
// }
```

| Model | Label | Description |
|---|---|---|
| `vienot` | Viénot | Simplified 3×3 matrix (1999), fast and widely used |
| `machado` | Machado | Spectral-shift 3×3 matrix (2009), more accurate |
| `brettel` | Brettel | Confusion-point projection in CIE xyY (1997), most accurate, slower |

## Low-level Utilities

These are exported for advanced use cases (custom pipelines, shaders, etc.).

### hexToRgb(hex)

```ts
function hexToRgb(hex: string): RGB
```

Parses `#RGB`, `#RRGGBB`, `RGB`, or `RRGGBB` into an RGB object. Throws on invalid input.

### rgbToHex(rgb)

```ts
function rgbToHex(rgb: RGB): string
```

Converts an RGB object to `#rrggbb` string. Clamps and rounds values.

### srgbToLinear(v)

```ts
function srgbToLinear(v: number): number
```

Converts a single sRGB value (0–255) to linear [0,1]. Uses a pre-computed LUT for speed.

### linearToSrgb(c)

```ts
function linearToSrgb(c: number): number
```

Converts a linear [0,1] value to sRGB (0–255). Clamps to valid range.

### gamutMap(r, g, b)

```ts
function gamutMap(r: number, g: number, b: number): [number, number, number]
```

Maps an out-of-gamut linear RGB triplet into [0,1] by desaturating toward its Rec. 709 luminance. Returns the input unchanged if already in gamut.
