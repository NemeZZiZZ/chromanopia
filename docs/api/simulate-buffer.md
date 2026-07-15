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

The function processes 4 bytes at a time with no allocations inside the hot loop. Performance scales linearly with pixel count. In a warm JavaScript engine, expect roughly:

| Resolution | Pixels | Viénot | Machado | Brettel |
|---|---|---|---|---|
| 640×480 | 0.3M | ~60ms | ~40ms | ~80ms |
| 1920×1080 | 2.1M | ~420ms | ~260ms | ~520ms |
| 3840×2160 | 8.3M | ~1.7s | ~1.0s | ~2.1s |

*One reference point — Apple M1, Node 22, warm JIT. Brettel is ~1.5–2× slower than Machado due to per-pixel XYZ projection; Viénot and Machado use the same matrix-multiply path but Viénot's smaller matrices are slightly slower to dispatch than the JIT-inlined Machado path on this hardware.*

::: tip
These are CPU/JavaScript timings. For real-time image processing, a [WebGL shader](../guide/recipes#webgl-shader-uniform) runs the same matrix on the GPU at 10–100× the throughput. The numbers above are fine for one-shot transforms (e.g. processing an uploaded image once).
:::
