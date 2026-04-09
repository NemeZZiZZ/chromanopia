# Recepti

Praktični primeri integracije za uobičajena okruženja.

## Pregledač — Canvas

Najjednostavniji način za simulaciju slike u pregledaču:

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

## Pregledač — OffscreenCanvas (Web Worker)

Obradite slike van glavne niti za glatko korisničko iskustvo:

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

## Node.js — Sharp (matrični put)

Za modele zasnovane na matricama, koristite Sharp-ov nativni `recomb` za maksimalne performanse:

```ts
import sharp from 'sharp'
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia', { model: 'machado' })

const result = await sharp('photo.jpg')
  .gamma(2.2)             // aproksimativna sRGB linearizacija
  .recomb([
    [m[0], m[1], m[2]],
    [m[3], m[4], m[5]],
    [m[6], m[7], m[8]],
  ])
  .gamma(1 / 2.2)         // ponovna primena gama krive
  .toBuffer()
```

::: warning
Sharp-ov `gamma(2.2)` je aproksimacija sRGB linearizacije. Za rezultate identične izlazu biblioteke piksel-po-piksel, koristite put sirovog bafera ispod.
:::

## Node.js — Sharp (put sirovog bafera)

Za Brettel model ili kada su potrebni egzaktni rezultati sa pravilnim mapiranjem gamuta:

```ts
import sharp from 'sharp'
import { simulateBuffer } from 'chromanopia'

const { data, info } = await sharp('photo.jpg')
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Buffer nasleđuje Uint8Array — radi direktno
simulateBuffer(data, 'protanopia', { model: 'brettel' })

const result = await sharp(Buffer.from(data.buffer), {
  raw: { width: info.width, height: info.height, channels: 4 },
}).png().toBuffer()
```

## Node.js — Sharp (automatski izbor puta)

Koristite `isMatrixModel()` za automatski izbor optimalnog puta:

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

## WebGL — Šejder uniform

Prosledite matricu simulacije kao uniform fragment šejderu:

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('deuteranopia', { model: 'machado', severity: 0.8 })

// getMatrix() vraća row-major; WebGL podrazumevano očekuje column-major.
// Prosledite `true` kao parametar transponovanja:
gl.uniformMatrix3fv(location, true, new Float32Array(matrix))
```

Fragment šejder:

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

## CSS Filter (aproksimativno)

Za brzo prototipiranje, možete koristiti CSS `filter` sa SVG `feColorMatrix`. Ovo je manje precizno, ali ne zahteva JavaScript:

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia', { model: 'vienot' })

// Kreiranje SVG filtera
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

// Primena na element
element.style.filter = `url('data:image/svg+xml,${encodeURIComponent(svg)}#cvd')`
```

::: warning
Ovo preskače sRGB linearizaciju i mapiranje gamuta — to je aproksimacija. Koristite Viénot za najbolje rezultate jer su njegove matrice nenegativne.
:::

## React — Split View sa use-split-view

Napravite before/after CVD poređenje sa [`use-split-view`](https://github.com/NemeZZiZZ/use-split-view) — headless React hook za split-view korisničko iskustvo sa zumiranjem, pomeranjem i podrškom za dodir.

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

  // Simulacija slike
  const simulated = useMemo(() => {
    const copy = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    )
    simulateBuffer(copy.data, type, { model })
    return copy
  }, [imageData, type, model])

  // Crtanje na canvas elemente
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
      {/* Simulirano */}
      <div style={{ position: 'absolute', inset: 0, clipPath: endPane.clipPath }}>
        <canvas ref={simRef} style={endPane.contentStyle} />
      </div>
      {/* Ručica */}
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

`use-split-view` upravlja svom interakcijom (povlačenje pokazivačem, dodir, zumiranje/pomeranje tračpedom) dok chromanopia upravlja naukom o bojama. Hook je potpuno headless — vi kontrolišete sav markup i stilizovanje.
