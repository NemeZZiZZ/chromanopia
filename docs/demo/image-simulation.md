# Image Simulation

Upload an image or use the built-in sample to see how it appears under different types of color vision deficiency. All processing happens in your browser via `simulateBuffer()`.

<script setup>
import ImageSimulator from '../.vitepress/theme/components/ImageSimulator.vue'
</script>

<ClientOnly>
  <ImageSimulator />
</ClientOnly>

## How it works

The demo uses the Canvas API to process images:

```ts
import { simulateBuffer } from 'chromanopia'

// Get pixel data from canvas
const imageData = ctx.getImageData(0, 0, width, height)

// Simulate in-place (mutates the buffer)
simulateBuffer(imageData.data, 'protanopia', {
  model: 'machado',
  severity: 1,
})

// Put the modified data back
ctx.putImageData(imageData, 0, 0)
```

## Performance

`simulateBuffer` processes pixels in-place with no allocations inside the hot loop. On a warm JavaScript engine, throughput is roughly:

| Image size | Machado | Brettel |
|---|---|---|
| 640×480 (VGA) | ~85ms | ~100ms |
| 1920×1080 (FHD) | ~560ms | ~660ms |
| 3840×2160 (4K) | ~2.2s | ~2.6s |

*One reference point — Apple M1, Node 22. Your browser results will vary. Processing a typical photo (a few megapixels) takes a fraction of a second; for large images or real-time use, consider a [Web Worker](/guide/recipes#browser-offscreencanvas-web-worker) or a [WebGL shader](/guide/recipes#webgl-shader-uniform).*

## Tips

- **Drag & drop** any image from your desktop
- Try **adjusting severity** from 0 to 1 to see the gradual progression
- Compare **Machado vs Brettel** — the differences are most visible for tritanopia
- Pure **red/green** images show the most dramatic differences for protan/deutan types
