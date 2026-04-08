# chromanopia

Physically accurate colorblindness simulation for JavaScript/TypeScript. Zero dependencies.

Three models, sRGB linearization, gamut mapping — works in Node.js, browsers, and edge runtimes.

## Features

- **Three models** — Viénot (1999), Machado (2009), Brettel (1997)
- **All 8 deficiency types** — protanopia, protanomaly, deuteranopia, deuteranomaly, tritanopia, tritanomaly, achromatopsia, achromatomaly
- **Severity slider** — smooth 0–1 interpolation
- **sRGB linearization** — correct color space handling with LUT optimization
- **Gamut mapping** — desaturation toward luminance (no hard clamp)
- **Rec. 709 luminance** — correct coefficients for sRGB displays
- **Three APIs** — single color, pixel buffer, raw matrix
- **TypeScript native** — full type definitions with `Matrix3x3` tuple type
- **Zero dependencies** — no `onecolor`, no `sharp`, nothing
- **ESM + CJS** — dual build, tree-shakeable

## Install

```bash
npm install chromanopia
```

## Quick Start

```ts
import { simulate, simulateBuffer, getMatrix } from 'chromanopia'

// Single color (hex string)
simulate('#e63946', 'protanopia')
// → '#8b8b2b'

// Single color (RGB object)
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 139, g: 139, b: 43 }

// With options
simulate('#e63946', 'protanopia', { model: 'brettel', severity: 0.7 })

// Pixel buffer (mutates in-place)
simulateBuffer(imageData.data, 'deuteranopia', { model: 'machado' })

// Raw 3×3 matrix (for WebGL, Sharp recomb, etc.)
getMatrix('tritanopia', { model: 'vienot', severity: 0.5 })
// → [0.975, 0.025, 0, 0, 0.71667, 0.28333, 0, 0.2375, 0.7625]
```

## API

### `simulate(color, type, options?)`

Simulates a single color.

| Param | Type | Description |
|---|---|---|
| `color` | `string \| RGB` | Hex string (`"#e63946"`, `"F00"`) or `{ r, g, b }` (0–255) |
| `type` | `ColorblindType` | Deficiency type |
| `options.model` | `ColorblindModel` | `"machado"` (default), `"vienot"`, or `"brettel"` |
| `options.severity` | `number` | 0–1, default `1`. Values outside range are clamped. |

Returns the same type as input (hex string or RGB object).

### `simulateBuffer(pixels, type, options?)`

Applies simulation to an RGBA pixel buffer **in-place**.

| Param | Type | Description |
|---|---|---|
| `pixels` | `Uint8Array \| Uint8ClampedArray` | RGBA buffer (e.g. `ImageData.data`, Sharp raw output, Node.js `Buffer`) |
| `type` | `ColorblindType` | Deficiency type |
| `options` | `SimulateOptions` | Model and severity |

### `getMatrix(type, options?)`

Returns a `Matrix3x3` — a flat 9-element tuple in row-major order. For matrix-based models only (Viénot, Machado).

> **Note:** Throws if `model` is `"brettel"` — Brettel uses per-pixel projection, not a matrix. Use `isMatrixModel()` to check.

### `isMatrixModel(model)`

Returns `true` if the model uses a 3×3 matrix (useful to decide whether to use Sharp `recomb` or raw buffer).

## Types

```ts
type ColorblindType =
  | "none" | "protanopia" | "protanomaly"
  | "deuteranopia" | "deuteranomaly"
  | "tritanopia" | "tritanomaly"
  | "achromatopsia" | "achromatomaly"

type ColorblindModel = "vienot" | "machado" | "brettel"

type Matrix3x3 = [number, number, number, number, number, number, number, number, number]

interface RGB { r: number; g: number; b: number }

interface SimulateOptions {
  model?: ColorblindModel  // default: "machado"
  severity?: number        // 0–1, default: 1
}
```

## Models

| Model | Year | Method | Speed | Accuracy |
|---|---|---|---|---|
| **Viénot** | 1999 | 3×3 matrix, non-negative | Fastest | Good |
| **Machado** | 2009 | 3×3 spectral-shift matrix | Fast | Better |
| **Brettel** | 1997 | Per-pixel CIE xyY projection | ~3-5× slower | Best |

All models apply proper sRGB linearization (gamma removal before simulation, re-application after) and gamut mapping (desaturation toward luminance for matrix models, D65 neutral shift for Brettel).

## Recipes

### Browser — Canvas

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

### Browser — OffscreenCanvas (Web Worker)

```ts
import { simulateBuffer } from 'chromanopia'

const bmp = await createImageBitmap(file)
const canvas = new OffscreenCanvas(bmp.width, bmp.height)
const ctx = canvas.getContext('2d')
ctx.drawImage(bmp, 0, 0)
const imageData = ctx.getImageData(0, 0, bmp.width, bmp.height)

simulateBuffer(imageData.data, 'deuteranopia', { model: 'brettel' })
ctx.putImageData(imageData, 0, 0)
```

### Node.js — Sharp

```ts
import sharp from 'sharp'
import { simulateBuffer, getMatrix, isMatrixModel } from 'chromanopia'

const type = 'protanopia'
const model = 'machado'

if (isMatrixModel(model)) {
  // Fast path: Sharp native recomb
  const m = getMatrix(type, { model })
  const result = await sharp('photo.jpg')
    .gamma(2.2)
    .recomb([
      [m[0], m[1], m[2]],
      [m[3], m[4], m[5]],
      [m[6], m[7], m[8]],
    ])
    .gamma(1 / 2.2)
    .toBuffer()
} else {
  // Brettel: raw buffer
  const { data, info } = await sharp('photo.jpg')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  simulateBuffer(data, type, { model })

  const result = await sharp(Buffer.from(data.buffer), {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer()
}
```

### WebGL — Shader Uniform

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('deuteranopia', { model: 'machado', severity: 0.8 })

// getMatrix() returns row-major order; WebGL uniformMatrix3fv expects
// column-major by default, so pass `true` to transpose:
gl.uniformMatrix3fv(location, true, new Float32Array(matrix))
```

## Metadata

```ts
import { COLORBLIND_TYPES, COLORBLIND_MODELS } from 'chromanopia'

COLORBLIND_TYPES.protanopia.label       // "Protanopia"
COLORBLIND_TYPES.protanopia.description // "Red-blind, cannot perceive red light"
COLORBLIND_TYPES.protanopia.color       // "#9b9a43" (preview swatch)

COLORBLIND_MODELS.machado.label       // "Machado"
COLORBLIND_MODELS.machado.description // "Spectral-shift 3×3 matrix (2009), more accurate"
```

## References

- Viénot, F., Brettel, H., & Mollon, J.D. (1999). *Digital video colourmaps for checking the legibility of displays by dichromats.* Color Research & Application, 24(4), 243–252.
- Machado, G.M., Oliveira, M.M., & Fernandes, L.A.F. (2009). *A physiologically-based model for simulation of color vision deficiency.* IEEE TVCG, 15(6), 1291–1298.
- Brettel, H., Viénot, F., & Mollon, J.D. (1997). *Computerized simulation of color appearance for dichromats.* JOSA A, 14(10), 2647–2655.

## License

MIT
