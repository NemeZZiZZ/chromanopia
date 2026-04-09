# Recetas

Ejemplos prácticos de integración para entornos comunes.

## Navegador — Canvas

La forma más sencilla de simular una imagen en el navegador:

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

## Navegador — OffscreenCanvas (Web Worker)

Procesa imágenes fuera del hilo principal para una UI fluida:

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

## Node.js — Sharp (ruta de matriz)

Para modelos basados en matrices, usa el `recomb` nativo de Sharp para máximo rendimiento:

```ts
import sharp from 'sharp'
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia', { model: 'machado' })

const result = await sharp('photo.jpg')
  .gamma(2.2)             // linearización sRGB aproximada
  .recomb([
    [m[0], m[1], m[2]],
    [m[3], m[4], m[5]],
    [m[6], m[7], m[8]],
  ])
  .gamma(1 / 2.2)         // reaplicar gamma
  .toBuffer()
```

::: warning
El `gamma(2.2)` de Sharp es una aproximación de la linearización sRGB. Para resultados perfectos a nivel de píxel que coincidan con la salida de la biblioteca, usa la ruta de búfer crudo a continuación.
:::

## Node.js — Sharp (ruta de búfer crudo)

Para el modelo Brettel o cuando necesitas resultados exactos con mapeo de gama correcto:

```ts
import sharp from 'sharp'
import { simulateBuffer } from 'chromanopia'

const { data, info } = await sharp('photo.jpg')
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Buffer hereda de Uint8Array — funciona directamente
simulateBuffer(data, 'protanopia', { model: 'brettel' })

const result = await sharp(Buffer.from(data.buffer), {
  raw: { width: info.width, height: info.height, channels: 4 },
}).png().toBuffer()
```

## Node.js — Sharp (selección automática de ruta)

Usa `isMatrixModel()` para elegir la ruta óptima automáticamente:

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

## WebGL — Uniforme de shader

Pasa la matriz de simulación como uniforme a un fragment shader:

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('deuteranopia', { model: 'machado', severity: 0.8 })

// getMatrix() devuelve en orden de filas; WebGL espera orden de columnas por defecto.
// Pasa `true` como parámetro de transposición:
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

## Filtro CSS (aproximado)

Para prototipado rápido, puedes usar `filter` de CSS con un `feColorMatrix` SVG. Esto es menos preciso pero no requiere JavaScript:

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia', { model: 'vienot' })

// Crear filtro SVG
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

// Aplicar al elemento
element.style.filter = `url('data:image/svg+xml,${encodeURIComponent(svg)}#cvd')`
```

::: warning
Esto omite la linearización sRGB y el mapeo de gama — es una aproximación. Usa Viénot para mejores resultados ya que sus matrices son no negativas.
:::

## React — Vista dividida con use-split-view

Construye una comparación antes/después de DVC con [`use-split-view`](https://github.com/NemeZZiZZ/use-split-view) — un hook headless de React para UX de vista dividida con zoom, desplazamiento y soporte táctil.

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

  // Simular la imagen
  const simulated = useMemo(() => {
    const copy = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    )
    simulateBuffer(copy.data, type, { model })
    return copy
  }, [imageData, type, model])

  // Dibujar en los canvas
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
      {/* Simulado */}
      <div style={{ position: 'absolute', inset: 0, clipPath: endPane.clipPath }}>
        <canvas ref={simRef} style={endPane.contentStyle} />
      </div>
      {/* Control */}
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

`use-split-view` maneja toda la interacción (arrastre con puntero, táctil, zoom/desplazamiento con trackpad) mientras chromanopia se encarga de la ciencia del color. El hook es completamente headless — tú controlas todo el marcado y los estilos.
