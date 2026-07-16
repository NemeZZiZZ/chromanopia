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
| **Model** | Brettel is ~1.2× slower than Viénot/Machado (per-pixel XYZ projection) |
| **Resolution** | Linear scaling — 4K is ~4× slower than Full HD |
| **CPU** | V8 optimizes the hot loop well; Apple Silicon is typically 2× faster than x86 |
| **Browser** | V8 (Chrome/Edge) and SpiderMonkey (Firefox) perform similarly; JSC (Safari) varies |

## Typical results

*One reference point — Apple M1, Node 22, warm JIT, median over 40 iterations. Your numbers will vary by hardware, browser, and how warm the JIT is. Run the benchmark above for numbers on your own machine.*

| Resolution | Pixels | Viénot | Machado | Brettel |
|---|---|---|---|---|
| VGA (640×480) | 0.3M | ~80ms | ~85ms | ~100ms |
| Full HD (1920×1080) | 2.1M | ~590ms | ~560ms | ~660ms |
| 4K (3840×2160) | 8.3M | ~2.4s | ~2.2s | ~2.6s |

Throughput is roughly resolution-independent at **~3.5 Mpix/s** for the matrix models (Viénot, Machado) and **~3.2 Mpix/s** for Brettel.

::: warning
A single `simulateBuffer()` call does **not** fit in a 60fps frame (16.7ms) at any resolution above a few hundred thousand pixels — JavaScript simply cannot process millions of pixels that fast. For real-time use:
- Move the work to a [Web Worker](/guide/recipes#browser-offscreencanvas-web-worker) so it doesn't block the main thread
- Use a [WebGL shader](/guide/recipes#webgl-shader-uniform) for GPU-accelerated processing (10–100× faster)
- For one-shot transforms (e.g. processing an uploaded image once), the times above are fine — the user perceives ~260ms as near-instant
:::

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
