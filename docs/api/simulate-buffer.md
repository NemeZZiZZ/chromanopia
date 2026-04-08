# simulateBuffer()

Applies colorblindness simulation to an RGBA pixel buffer **in-place**. This is the core function for image processing.

## Signature

```ts
function simulateBuffer(
  pixels: Uint8Array | Uint8ClampedArray,
  type: ColorblindType,
  options?: SimulateOptions,
): void
```

**Mutates the input buffer.** If you need to preserve the original, clone it first.

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `pixels` | `Uint8Array \| Uint8ClampedArray` | Yes | RGBA pixel buffer. Length must be a multiple of 4. |
| `type` | `ColorblindType` | Yes | Deficiency type to simulate |
| `options.model` | `ColorblindModel` | No | `"machado"` (default), `"vienot"`, or `"brettel"` |
| `options.severity` | `number` | No | 0–1, default `1`. Clamped to valid range. |

## Examples

### Canvas ImageData

```ts
import { simulateBuffer } from 'chromanopia'

const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

### Preserving original

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

// Buffer extends Uint8Array — works directly
simulateBuffer(data, 'tritanopia', { model: 'brettel' })
```

### With severity

```ts
simulateBuffer(pixels, 'protanomaly', { severity: 0.5 })
```

## Behavior

- **Alpha channel is preserved** — only R, G, B bytes are modified (every 4th byte is skipped)
- When `type` is `"none"` or `severity` is `0`, returns immediately (no processing)
- For matrix models (Viénot, Machado): sRGB → linear → matrix multiply → gamut map → sRGB
- For Brettel: sRGB → linear → XYZ → xyY projection → XYZ → linear → sRGB
- For Brettel with achromatopsia/achromatomaly: falls back to Machado matrix

## Performance

The function processes 4 bytes at a time with no allocations inside the hot loop. Performance scales linearly with pixel count:

| Resolution | Pixels | Machado | Brettel |
|---|---|---|---|
| 640×480 | 307K | ~2ms | ~8ms |
| 1920×1080 | 2.1M | ~12ms | ~45ms |
| 3840×2160 | 8.3M | ~50ms | ~180ms |

*Measured on Apple M1, single-threaded. Your results may vary.*
