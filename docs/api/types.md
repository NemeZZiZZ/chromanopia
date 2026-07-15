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
  /** Deficiency severity from 0 (none) to 1 (full). Default: 1. Values outside [0,1] are clamped. */
  severity?: number
}
```

> **Behavior notes for `severity`:**
> - For matrix models (Viénot, Machado) the matrix is linearly interpolated toward the identity matrix.
> - For the Brettel model and **anomaly** types (protanomaly, deuteranomaly, tritanomaly) the effective strength is scaled by a fixed factor (`1.75 / 2.75 ≈ 0.636`) to match the partial-deficiency convention from Brettel et al. (1997) / Wickline.
> - Achromatopsia/achromatomaly always fall back to the Rec. 709 luminance matrix regardless of `model`.

### RGB

RGB color as an object with 0–255 integer channels.

```ts
interface RGB {
  r: number
  g: number
  b: number
}
```

### HSL

HSL color.

```ts
interface HSL {
  /** Hue in degrees [0, 360). */
  h: number
  /** Saturation as a fraction [0, 1]. */
  s: number
  /** Lightness as a fraction [0, 1]. */
  l: number
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

Parses `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA` (with or without leading `#`) into an RGB object. The alpha component is parsed but dropped (`RGB` has no alpha). Throws on invalid input.

### rgbToHex(rgb)

```ts
function rgbToHex(rgb: RGB): string
```

Converts an RGB object to `#rrggbb` string. Clamps and rounds values.

### rgbToHsl(rgb)

```ts
function rgbToHsl(rgb: RGB): HSL
```

Converts an RGB color to HSL (`h` in degrees [0, 360), `s`/`l` in [0, 1]).

### hslToRgb(hsl)

```ts
function hslToRgb(hsl: HSL): RGB
```

Converts an HSL color to RGB. Out-of-range `h` is normalized modulo 360; `s`/`l` are clamped to [0, 1].

### toRgb(color)

```ts
function toRgb(color: string | RGB | HSL): RGB
```

Coerces any accepted color form into an RGB object: hex strings, CSS `rgb()`/`rgba()`, HSL objects, or RGB objects (returned as a copy).

### parseCssColor(css)

```ts
function parseCssColor(css: string): RGB
```

Parses a CSS color string (hex or `rgb()`/`rgba()` in legacy comma or modern space syntax, with `%` channels) into an RGB object. Throws on unsupported formats.

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

### relativeLuminance(r, g, b)

```ts
function relativeLuminance(r: number, g: number, b: number): number
```

WCAG 2.x / Rec. 709 relative luminance of an sRGB color, in [0, 1].

### gamutMap(r, g, b)

```ts
function gamutMap(r: number, g: number, b: number): [number, number, number]
```

Maps an out-of-gamut linear RGB triplet into [0,1] by desaturating toward its Rec. 709 luminance. Returns the input unchanged if already in gamut. **Guarantees** every output channel lies in [0,1], including degenerate cases where the luminance itself is out of gamut.

### contrastRatio(a, b)

```ts
function contrastRatio(a: string | RGB, b: string | RGB): number
```

WCAG 2.x contrast ratio between two colors, in [1, 21]. Accepts any color form `toRgb` understands.

### colorDistance(a, b)

```ts
function colorDistance(a: string | RGB, b: string | RGB): number
```

Euclidean distance in sRGB [0,255]³ between two colors.

### isDistinguishable(a, b, type, options?, threshold?)

```ts
function isDistinguishable(
  a: string | RGB,
  b: string | RGB,
  type: ColorblindType,
  options?: SimulateOptions,
  threshold?: number, // default 30
): boolean
```

Returns `true` if two colors remain distinguishable after simulating a given deficiency (their post-simulation sRGB distance ≥ `threshold`). Use `"none"` for normal-vision distance.
