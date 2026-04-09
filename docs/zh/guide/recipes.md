# 实用示例

常见环境下的实际集成示例。

## 浏览器 — Canvas

在浏览器中模拟图像的最简单方式：

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

## 浏览器 — OffscreenCanvas (Web Worker)

在主线程之外处理图像，保持 UI 流畅：

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

## Node.js — Sharp（矩阵路径）

对于基于矩阵的模型，使用 Sharp 原生的 `recomb` 以获得最佳性能：

```ts
import sharp from 'sharp'
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia', { model: 'machado' })

const result = await sharp('photo.jpg')
  .gamma(2.2)             // 近似 sRGB 线性化
  .recomb([
    [m[0], m[1], m[2]],
    [m[3], m[4], m[5]],
    [m[6], m[7], m[8]],
  ])
  .gamma(1 / 2.2)         // 重新应用 gamma
  .toBuffer()
```

::: warning
Sharp 的 `gamma(2.2)` 是 sRGB 线性化的近似值。要获得与库输出完全匹配的像素级精确结果，请使用下面的原始缓冲区路径。
:::

## Node.js — Sharp（原始缓冲区路径）

对于 Brettel 模型或需要精确结果和正确色域映射时：

```ts
import sharp from 'sharp'
import { simulateBuffer } from 'chromanopia'

const { data, info } = await sharp('photo.jpg')
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Buffer 继承自 Uint8Array — 可直接使用
simulateBuffer(data, 'protanopia', { model: 'brettel' })

const result = await sharp(Buffer.from(data.buffer), {
  raw: { width: info.width, height: info.height, channels: 4 },
}).png().toBuffer()
```

## Node.js — Sharp（自动选择路径）

使用 `isMatrixModel()` 自动选择最优路径：

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

## WebGL — 着色器 Uniform

将模拟矩阵作为 uniform 传递给片段着色器：

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('deuteranopia', { model: 'machado', severity: 0.8 })

// getMatrix() 返回行优先顺序；WebGL 默认使用列优先。
// 将 transpose 参数传为 `true`：
gl.uniformMatrix3fv(location, true, new Float32Array(matrix))
```

片段着色器：

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

## CSS 滤镜（近似）

用于快速原型设计，可以使用 CSS `filter` 配合 SVG `feColorMatrix`。精度较低，但无需 JavaScript：

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia', { model: 'vienot' })

// 创建 SVG 滤镜
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

// 应用到元素
element.style.filter = `url('data:image/svg+xml,${encodeURIComponent(svg)}#cvd')`
```

::: warning
此方法跳过了 sRGB 线性化和色域映射 — 这只是一个近似值。使用 Viénot 效果最佳，因为其矩阵值为非负。
:::

## React — 使用 use-split-view 的分屏视图

使用 [`use-split-view`](https://github.com/NemeZZiZZ/use-split-view) 构建色觉缺陷前后对比 — 一个无头 React Hook，支持分屏 UX、缩放、平移和触控。

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

  // 模拟图像
  const simulated = useMemo(() => {
    const copy = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    )
    simulateBuffer(copy.data, type, { model })
    return copy
  }, [imageData, type, model])

  // 绘制到画布
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
      {/* 原始图像 */}
      <div style={{ clipPath: startPane.clipPath }}>
        <canvas ref={origRef} style={startPane.contentStyle} />
      </div>
      {/* 模拟图像 */}
      <div style={{ position: 'absolute', inset: 0, clipPath: endPane.clipPath }}>
        <canvas ref={simRef} style={endPane.contentStyle} />
      </div>
      {/* 拖动手柄 */}
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

`use-split-view` 处理所有交互（指针拖动、触控、触控板缩放/平移），而 chromanopia 处理色彩科学。该 Hook 完全无头 — 您完全掌控所有标记和样式。
