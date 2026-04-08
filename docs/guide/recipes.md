# Recipes

Practical integration examples for common environments.

## Browser — Canvas

The simplest way to simulate an image in the browser:

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

## Browser — OffscreenCanvas (Web Worker)

Process images off the main thread for smooth UI:

```ts
// worker.ts
import { simulateBuffer } from 'chromanopia'

self.onmessage = async (e) => {
  const { bitmap, type, model } = e.data
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height)

  simulateBuffer(imageData.data, type, { model })
  ctx.putImageData(imageData, 0, 0)

  const result = canvas.transferToImageBitmap()
  self.postMessage({ result }, [result])
}
```

```ts
// main.ts
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
const bitmap = await createImageBitmap(file)
worker.postMessage({ bitmap, type: 'deuteranopia', model: 'machado' }, [bitmap])
```

## Node.js — Sharp (matrix path)

For matrix-based models, use Sharp's native `recomb` for maximum performance:

```ts
import sharp from 'sharp'
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia', { model: 'machado' })

const result = await sharp('photo.jpg')
  .gamma(2.2)             // approximate sRGB linearization
  .recomb([
    [m[0], m[1], m[2]],
    [m[3], m[4], m[5]],
    [m[6], m[7], m[8]],
  ])
  .gamma(1 / 2.2)         // re-apply gamma
  .toBuffer()
```

::: warning
Sharp's `gamma(2.2)` is an approximation of sRGB linearization. For pixel-perfect results matching the library's output, use the raw buffer path below.
:::

## Node.js — Sharp (raw buffer path)

For Brettel model or when you need exact results with proper gamut mapping:

```ts
import sharp from 'sharp'
import { simulateBuffer } from 'chromanopia'

const { data, info } = await sharp('photo.jpg')
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Buffer inherits from Uint8Array — works directly
simulateBuffer(data, 'protanopia', { model: 'brettel' })

const result = await sharp(Buffer.from(data.buffer), {
  raw: { width: info.width, height: info.height, channels: 4 },
}).png().toBuffer()
```

## Node.js — Sharp (auto-select path)

Use `isMatrixModel()` to pick the optimal path automatically:

```ts
import sharp from 'sharp'
import { simulateBuffer, getMatrix, isMatrixModel } from 'chromanopia'
import type { ColorblindType, ColorblindModel } from 'chromanopia'

async function simulateImage(
  input: string,
  type: ColorblindType,
  model: ColorblindModel = 'machado',
) {
  if (isMatrixModel(model)) {
    const m = getMatrix(type, { model })
    return sharp(input)
      .gamma(2.2)
      .recomb([[m[0], m[1], m[2]], [m[3], m[4], m[5]], [m[6], m[7], m[8]]])
      .gamma(1 / 2.2)
      .toBuffer()
  }

  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  simulateBuffer(data, type, { model })

  return sharp(Buffer.from(data.buffer), {
    raw: { width: info.width, height: info.height, channels: 4 },
  }).png().toBuffer()
}
```

## WebGL — Shader Uniform

Pass the simulation matrix as a uniform to a fragment shader:

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('deuteranopia', { model: 'machado', severity: 0.8 })

// getMatrix() returns row-major; WebGL expects column-major by default.
// Pass `true` as the transpose parameter:
gl.uniformMatrix3fv(location, true, new Float32Array(matrix))
```

Fragment shader:

```glsl
uniform mat3 u_cvdMatrix;

vec3 linearize(vec3 srgb) {
  return mix(srgb / 12.92, pow((srgb + 0.055) / 1.055, vec3(2.4)), step(0.04045, srgb));
}

vec3 toSrgb(vec3 linear) {
  return mix(linear * 12.92, 1.055 * pow(linear, vec3(1.0/2.4)) - 0.055, step(0.0031308, linear));
}

void main() {
  vec3 color = texture2D(u_texture, v_texCoord).rgb;
  vec3 linear = linearize(color);
  vec3 simulated = u_cvdMatrix * linear;
  gl_FragColor = vec4(toSrgb(clamp(simulated, 0.0, 1.0)), 1.0);
}
```

## CSS Filter (approximate)

For quick prototyping, you can use CSS `filter` with an SVG `feColorMatrix`. This is less accurate but requires no JavaScript:

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia', { model: 'vienot' })

// Create SVG filter
const svg = `
<svg xmlns="http://www.w3.org/2000/svg">
  <filter id="cvd">
    <feColorMatrix type="matrix" values="
      ${m[0]} ${m[1]} ${m[2]} 0 0
      ${m[3]} ${m[4]} ${m[5]} 0 0
      ${m[6]} ${m[7]} ${m[8]} 0 0
      0 0 0 1 0
    "/>
  </filter>
</svg>`

// Apply to element
element.style.filter = `url('data:image/svg+xml,${encodeURIComponent(svg)}#cvd')`
```

::: warning
This skips sRGB linearization and gamut mapping — it's an approximation. Use Viénot for best results since its matrices are non-negative.
:::

## React — Split View with use-split-view

Build a before/after CVD comparison with [`use-split-view`](https://github.com/NemeZZiZZ/use-split-view) — a headless React hook for split-view UX with zoom, pan, and touch support.

```bash
npm install chromanopia use-split-view
```

```tsx
import { useRef, useEffect, useMemo } from 'react'
import { useSplitView } from 'use-split-view'
import { simulateBuffer } from 'chromanopia'
import type { ColorblindType, ColorblindModel } from 'chromanopia'

function CVDSplitView({
  imageData,
  type = 'protanopia',
  model = 'machado',
}: {
  imageData: ImageData
  type?: ColorblindType
  model?: ColorblindModel
}) {
  const origRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<HTMLCanvasElement>(null)

  const { containerRef, handleProps, getPaneState, setNaturalSize } = useSplitView({
    direction: 'horizontal',
    initialSplit: 50,
  })

  // Simulate the image
  const simulated = useMemo(() => {
    const copy = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    )
    simulateBuffer(copy.data, type, { model })
    return copy
  }, [imageData, type, model])

  // Draw to canvases
  useEffect(() => {
    for (const [ref, data] of [
      [origRef, imageData],
      [simRef, simulated],
    ] as const) {
      const canvas = ref.current
      if (!canvas) continue
      canvas.width = data.width
      canvas.height = data.height
      canvas.getContext('2d')!.putImageData(data, 0, 0)
    }
    setNaturalSize(imageData.width, imageData.height)
  }, [imageData, simulated])

  const startPane = getPaneState('start')
  const endPane = getPaneState('end')

  return (
    <div ref={containerRef} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Original */}
      <div style={{ clipPath: startPane.clipPath }}>
        <canvas ref={origRef} style={startPane.contentStyle} />
      </div>
      {/* Simulated */}
      <div style={{ position: 'absolute', inset: 0, clipPath: endPane.clipPath }}>
        <canvas ref={simRef} style={endPane.contentStyle} />
      </div>
      {/* Handle */}
      <div
        {...handleProps}
        style={{
          position: 'absolute', top: 0, bottom: 0,
          width: 32, cursor: 'col-resize', zIndex: 10,
        }}
      >
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0,
          width: 2, background: '#fff', transform: 'translateX(-50%)',
          boxShadow: '0 0 4px rgba(0,0,0,0.4)',
        }} />
      </div>
    </div>
  )
}
```

`use-split-view` handles all interaction (pointer drag, touch, trackpad zoom/pan) while chromanopia handles the color science. The hook is fully headless — you own all the markup and styling.
