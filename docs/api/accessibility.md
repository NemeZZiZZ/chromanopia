# Accessibility Helpers

Accessibility utilities built on top of the simulation core: WCAG contrast ratio, perceptual color distance, relative luminance, and a "are these two colors distinguishable under a deficiency" check.

These are the typical reason you reach for a color-vision-deficiency library in the first place — beyond just *showing* what a colorblind person sees, you can *test* whether your palette is usable.

---

## contrastRatio()

WCAG 2.x contrast ratio between two colors.

```ts
function contrastRatio(
  a: string | RGB,
  b: string | RGB,
): number
```

Returns a value in **[1, 21]**, where 1 is identical and 21 is black-vs-white. Accepts any color form [`toRgb()`](./color-conversion) understands: hex strings, `rgb()`/`rgba()`, RGB, or HSL objects.

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `a` | `string \| RGB` | Yes | First color (hex, `rgb()`, RGB, or HSL object) |
| `b` | `string \| RGB` | Yes | Second color (same forms as `a`) |

### Examples

```ts
import { contrastRatio } from 'chromanopia'

contrastRatio('#ffffff', '#000000') // 21
contrastRatio('#ffffff', '#767676') // ≈ 4.54 (passes WCAG AA for body text)
contrastRatio('#777777', '#ffffff') // ≈ 4.48 (order doesn't matter)
contrastRatio('#e63946', '#e63946') // 1 (identical)
```

### WCAG thresholds

| Ratio | Level | Use case |
|---|---|---|
| ≥ 7 | AAA | Body text < 18pt |
| ≥ 4.5 | AA | Body text < 18pt |
| ≥ 3 | AA | Large text ≥ 18pt, or UI components |

---

## colorDistance()

Euclidean distance in sRGB [0,255]³ between two colors. Cheap and monotonic with perceptual difference; use it for quick ordering, not for perceptually uniform ΔE.

```ts
function colorDistance(
  a: string | RGB,
  b: string | RGB,
): number
```

### Examples

```ts
import { colorDistance } from 'chromanopia'

colorDistance('#ff0000', '#00ff00') // ≈ 360.6 (red vs green)
colorDistance('#e63946', '#e63946') // 0 (identical)
colorDistance('#000000', '#010101') // ≈ 1.73
```

---

## isDistinguishable()

Returns `true` if two colors remain distinguishable after simulating a given deficiency — i.e. their post-simulation sRGB distance meets a `threshold`.

```ts
function isDistinguishable(
  a: string | RGB,
  b: string | RGB,
  type: ColorblindType,
  options?: SimulateOptions,
  threshold?: number, // default 30
): boolean
```

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `a` | `string \| RGB` | Yes | First color |
| `b` | `string \| RGB` | Yes | Second color |
| `type` | `ColorblindType` | Yes | Deficiency to simulate. Use `"none"` for normal-vision distance. |
| `options` | `SimulateOptions` | No | Simulation model/severity (default Machado, severity 1) |
| `threshold` | `number` | No | Minimum sRGB Euclidean distance to count as distinguishable. Default `30`. |

### Examples

```ts
import { isDistinguishable } from 'chromanopia'

// Orange #f77f00 and green #1d9c1d look clearly different to normal vision...
isDistinguishable('#f77f00', '#1d9c1d', 'none')       // true
// ...but collapse to the same hue for a protanope:
isDistinguishable('#f77f00', '#1d9c1d', 'protanopia') // false

// Tune the threshold for your use case (lower = stricter):
isDistinguishable('#aabbcc', '#112233', 'deuteranopia', {}, 50) // stricter
```

### Choosing a threshold

The default `30` corresponds to a clearly visible difference on an sRGB display. For critical UI (status indicators, chart series that must not be confused), use a higher threshold (50–80). For "roughly the same color" detection, lower it.

---

## relativeLuminance()

Relative luminance of an sRGB color, per WCAG 2.x / Rec. 709. Returns a value in [0, 1] where 0 is black and 1 is white. Uses the same sRGB linearization as the rest of the library.

```ts
function relativeLuminance(
  r: number,
  g: number,
  b: number,
): number
```

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `r` | `number` | Yes | Red channel, 0–255 |
| `g` | `number` | Yes | Green channel, 0–255 |
| `b` | `number` | Yes | Blue channel, 0–255 |

### Examples

```ts
import { relativeLuminance } from 'chromanopia'

relativeLuminance(0, 0, 0)       // 0
relativeLuminance(255, 255, 255) // 1
relativeLuminance(255, 0, 0)     // 0.2126 (red)
relativeLuminance(0, 255, 0)     // 0.7152 (green — highest weight)
relativeLuminance(0, 0, 255)     // 0.0722 (blue)
```

`contrastRatio()` is implemented in terms of this function.
