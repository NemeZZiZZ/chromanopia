# レシピ

一般的な環境での実用的な統合例。

## ブラウザ — Canvas

ブラウザで画像をシミュレートする最もシンプルな方法：

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

## ブラウザ — OffscreenCanvas（Web Worker）

メインスレッドをブロックせずに画像を処理し、スムーズなUIを実現：

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

## Node.js — Sharp（行列パス）

行列ベースのモデルでは、最大パフォーマンスのためにSharpのネイティブ `recomb` を使用：

```ts
import sharp from 'sharp'
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia', { model: 'machado' })

const result = await sharp('photo.jpg')
  .gamma(2.2)             // sRGB線形化の近似
  .recomb([
    [m[0], m[1], m[2]],
    [m[3], m[4], m[5]],
    [m[6], m[7], m[8]],
  ])
  .gamma(1 / 2.2)         // ガンマを再適用
  .toBuffer()
```

::: warning
Sharpの `gamma(2.2)` はsRGB線形化の近似です。ライブラリの出力と完全に一致するピクセルパーフェクトな結果が必要な場合は、以下の生バッファパスを使用してください。
:::

## Node.js — Sharp（生バッファパス）

Brettelモデルを使用する場合、または適切なガマットマッピングによる正確な結果が必要な場合：

```ts
import sharp from 'sharp'
import { simulateBuffer } from 'chromanopia'

const { data, info } = await sharp('photo.jpg')
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// BufferはUint8Arrayを継承 — 直接使用可能
simulateBuffer(data, 'protanopia', { model: 'brettel' })

const result = await sharp(Buffer.from(data.buffer), {
  raw: { width: info.width, height: info.height, channels: 4 },
}).png().toBuffer()
```

## Node.js — Sharp（自動選択パス）

`isMatrixModel()` を使用して最適なパスを自動的に選択：

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

## WebGL — シェーダーユニフォーム

シミュレーション行列をユニフォームとしてフラグメントシェーダーに渡す：

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('deuteranopia', { model: 'machado', severity: 0.8 })

// getMatrix() は行優先で返す。WebGLはデフォルトで列優先を期待する。
// transposeパラメータに `true` を渡す：
gl.uniformMatrix3fv(location, true, new Float32Array(matrix))
```

フラグメントシェーダー：

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

## CSSフィルター（近似）

クイックプロトタイピング用に、SVGの `feColorMatrix` を使用したCSS `filter` を利用できます。精度は低くなりますが、JavaScriptは不要です：

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia', { model: 'vienot' })

// SVGフィルターを作成
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

// 要素に適用
element.style.filter = `url('data:image/svg+xml,${encodeURIComponent(svg)}#cvd')`
```

::: warning
これはsRGB線形化とガマットマッピングをスキップするため、近似値です。行列が非負であるViénotを使用すると最良の結果が得られます。
:::

## React — use-split-viewによる分割ビュー

[`use-split-view`](https://github.com/NemeZZiZZ/use-split-view) を使用して、CVDの前後比較を構築します。ズーム、パン、タッチ対応の分割ビューUXを提供するヘッドレスReactフックです。

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

  // 画像をシミュレート
  const simulated = useMemo(() => {
    const copy = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    )
    simulateBuffer(copy.data, type, { model })
    return copy
  }, [imageData, type, model])

  // Canvasに描画
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
      {/* オリジナル */}
      <div style={{ clipPath: startPane.clipPath }}>
        <canvas ref={origRef} style={startPane.contentStyle} />
      </div>
      {/* シミュレート済み */}
      <div style={{ position: 'absolute', inset: 0, clipPath: endPane.clipPath }}>
        <canvas ref={simRef} style={endPane.contentStyle} />
      </div>
      {/* ハンドル */}
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

`use-split-view` はすべてのインタラクション（ポインタードラッグ、タッチ、トラックパッドのズーム/パン）を処理し、chromanopiaは色彩科学を処理します。フックは完全にヘッドレスで、すべてのマークアップとスタイリングはユーザーが制御します。
