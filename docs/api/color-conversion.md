# Color Conversion

Color parsing and conversion utilities: hex parsing (3/4/6/8 digit), `rgb()`/`rgba()` CSS strings, HSL round-trips, and a universal `toRgb()` coercer.

These are exported both for direct use and because the higher-level APIs ([`simulate()`](./simulate), [`simulatePalette()`](./simulate-palette), the [accessibility helpers](./accessibility)) accept any color form by routing through `toRgb()`.

---

## toRgb()

Coerces a color in any accepted form into an RGB object. The universal entry point used by the rest of the API.

```ts
function toRgb(color: string | RGB | HSL): RGB
```

Accepts hex strings (`"#e63946"`, `"F00"`, `"#RRGGBBAA"`), CSS `rgb()`/`rgba()` strings, HSL objects, or RGB objects (returned as a fresh copy).

### Examples

```ts
import { toRgb } from 'chromanopia'

toRgb('#ff0000')                  // { r: 255, g: 0, b: 0 }
toRgb('rgb(230 57 70)')           // { r: 230, g: 57, b: 70 }
toRgb({ h: 120, s: 1, l: 0.5 })   // { r: 0, g: 255, b: 0 }
toRgb({ r: 10, g: 20, b: 30 })    // { r: 10, g: 20, b: 30 } (copy, not alias)
```

::: tip
RGB objects are returned as copies, never the same reference, so mutating the result is safe.
:::

---

## parseCssColor()

Parses a CSS color string into an RGB object. Lower-level than `toRgb()` — only accepts strings.

```ts
function parseCssColor(css: string): RGB
```

Supports hex (3/4/6/8 digits, with or without `#`) and `rgb()` / `rgba()` in both legacy comma syntax (`rgba(230, 57, 70, 0.5)`) and modern space syntax (`rgb(230 57 70 / 0.5)`). Percentage channels (`rgb(100%, 0%, 0%)`) are supported. The alpha component is parsed but not returned (`RGB` has no alpha).

### Examples

```ts
import { parseCssColor } from 'chromanopia'

parseCssColor('#e63946ff')              // { r: 230, g: 57, b: 70 } (8-digit, alpha dropped)
parseCssColor('rgb(230, 57, 70)')       // { r: 230, g: 57, b: 70 }
parseCssColor('rgba(230 57 70 / 0.5)')  // { r: 230, g: 57, b: 70 }
parseCssColor('rgb(100%, 0%, 0%)')      // { r: 255, g: 0, b: 0 }
```

Throws on unsupported formats (named colors like `"red"`, `hsl()` strings, etc. are not supported — convert via `hslToRgb()` first for HSL).

---

## hexToRgb()

Parses a hex color string into an RGB object.

```ts
function hexToRgb(hex: string): RGB
```

Accepts `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA` (with or without the leading `#`). The alpha component is parsed but dropped.

### Examples

```ts
import { hexToRgb } from 'chromanopia'

hexToRgb('#e63946')   // { r: 230, g: 57, b: 70 }
hexToRgb('e63946')    // { r: 230, g: 57, b: 70 } (# optional)
hexToRgb('#F00')      // { r: 255, g: 0, b: 0 }   (3-digit)
hexToRgb('#e63946ff') // { r: 230, g: 57, b: 70 } (8-digit, alpha dropped)
```

Throws `Error` on invalid input — the full string is validated, so partially-valid strings like `#12gggg` are rejected (no silent `parseInt` prefix parsing).

---

## rgbToHex()

Converts an RGB object to a 6-digit hex string with `#` prefix.

```ts
function rgbToHex(rgb: RGB): string
```

Channel values are clamped to [0, 255] and rounded.

### Examples

```ts
import { rgbToHex } from 'chromanopia'

rgbToHex({ r: 230, g: 57, b: 70 }) // '#e63946'
rgbToHex({ r: 0, g: 0, b: 0 })     // '#000000'
rgbToHex({ r: 300, g: -5, b: 0 })  // '#ff0000' (clamped)
rgbToHex({ r: 127.6, g: 0, b: 0 }) // '#800000' (rounded)
```

---

## rgbToHsl()

Converts an RGB color to HSL.

```ts
function rgbToHsl(rgb: RGB): HSL
```

Returns `{ h, s, l }` where `h` is hue in degrees [0, 360) and `s`/`l` are saturation and lightness as fractions in [0, 1].

### Examples

```ts
import { rgbToHsl } from 'chromanopia'

rgbToHsl({ r: 255, g: 0, b: 0 })   // { h: 0,   s: 1, l: 0.5 } (red)
rgbToHsl({ r: 0, g: 255, b: 0 })   // { h: 120, s: 1, l: 0.5 } (green)
rgbToHsl({ r: 0, g: 0, b: 255 })   // { h: 240, s: 1, l: 0.5 } (blue)
rgbToHsl({ r: 128, g: 128, b: 128 }) // { h: 0, s: 0, l: 0.5 } (gray → s: 0)
```

---

## hslToRgb()

Converts an HSL color to RGB.

```ts
function hslToRgb(hsl: HSL): RGB
```

Out-of-range `h` is normalized modulo 360; `s` and `l` are clamped to [0, 1].

### Examples

```ts
import { hslToRgb } from 'chromanopia'

hslToRgb({ h: 0,   s: 1, l: 0.5 }) // { r: 255, g: 0,   b: 0   } (red)
hslToRgb({ h: 120, s: 1, l: 0.5 }) // { r: 0,   g: 255, b: 0   } (green)
hslToRgb({ h: 480, s: 1, l: 0.5 }) // { r: 0,   g: 255, b: 0   } (480° ≡ 120°)
hslToRgb({ h: 0,   s: 0, l: 0.5 }) // { r: 128, g: 128, b: 128 } (gray)
```

`rgbToHsl` and `hslToRgb` round-trip exactly (worst-case channel error: 0 within 8-bit precision).
