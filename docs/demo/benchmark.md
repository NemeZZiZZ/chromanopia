# Benchmark

Run a real-time performance test of `simulateBuffer()` in your browser. Measures throughput across different resolutions and all three simulation models.

<script setup>
import Benchmark from '../.vitepress/theme/components/Benchmark.vue'
</script>

<ClientOnly>
  <Benchmark />
</ClientOnly>

## Methodology

The benchmark:

1. **Warms up** the JIT with 50 iterations on a small buffer
2. For each resolution × model combination:
   - Creates a random RGBA pixel buffer
   - Runs enough iterations to accumulate ~500ms of data
   - Reports the **median** time (robust against GC pauses)
3. Shows **time per frame** and **throughput** in megapixels per second

## What affects performance

| Factor | Impact |
|---|---|
| **Model** | Brettel is ~3-5× slower than Viénot/Machado (per-pixel XYZ projection) |
| **Resolution** | Linear scaling — 4K is ~4× slower than Full HD |
| **CPU** | V8 optimizes the hot loop well; Apple Silicon is typically 2× faster than x86 |
| **Browser** | V8 (Chrome/Edge) and SpiderMonkey (Firefox) perform similarly; JSC (Safari) varies |

## Typical results

*Measured on Apple M1, Chrome 125:*

| Resolution | Viénot | Machado | Brettel |
|---|---|---|---|
| VGA (640×480) | ~1ms | ~1.5ms | ~6ms |
| Full HD (1920×1080) | ~8ms | ~10ms | ~40ms |
| 4K (3840×2160) | ~35ms | ~42ms | ~165ms |

For real-time applications (60fps = 16.7ms budget), Viénot and Machado handle up to Full HD comfortably. For 4K, consider using a [Web Worker](/guide/recipes#browser-offscreencanvas-web-worker) or [WebGL shader](/guide/recipes#webgl-shader-uniform).

## Code

```ts
// Simple benchmark
const pixels = new Uint8ClampedArray(1920 * 1080 * 4)
// ... fill with image data ...

const start = performance.now()
simulateBuffer(pixels, 'protanopia', { model: 'machado' })
const elapsed = performance.now() - start

console.log(`${elapsed.toFixed(1)}ms`)
```
