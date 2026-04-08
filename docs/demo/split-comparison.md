# Split Comparison

Compare original and simulated images side by side with a draggable split view. This is the most intuitive way to see how color vision deficiency affects perception.

<script setup>
import SplitComparison from '../.vitepress/theme/components/SplitComparison.vue'
</script>

<ClientOnly>
  <SplitComparison />
</ClientOnly>

## What to look for

Drag the handle to reveal the original (left) and simulated (right) image. Notice how:

- **Protanopia / Deuteranopia** — reds and greens become indistinguishable, collapsing into yellows and browns
- **Tritanopia** — blues and yellows merge, while reds and greens remain visible
- **Achromatopsia** — all color information is lost, only luminance remains
- **Partial variants** (anomaly) — colors shift but remain partially distinguishable

## Tips

- **Upload your own image** — test your app screenshots, charts, or UI designs
- **Adjust severity** — slide from 0 to 1 to see the gradual progression
- **Try deuteranomaly first** — it's the most common CVD type (~5% of males)

## Building this in React

For React applications, the [`use-split-view`](https://github.com/NemeZZiZZ/use-split-view) headless hook provides the same split-view UX with zoom, pan, and touch support:

```tsx
import { useSplitView } from 'use-split-view'
import { simulateBuffer } from 'chromanopia'

function CVDCompare({ imageData }: { imageData: ImageData }) {
  const { containerRef, handleProps, split, getPaneState } = useSplitView({
    direction: 'horizontal',
    initialSplit: 50,
  })

  const simulated = useMemo(() => {
    const copy = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    )
    simulateBuffer(copy.data, 'protanopia')
    return copy
  }, [imageData])

  const startPane = getPaneState('start')
  const endPane = getPaneState('end')

  return (
    <div ref={containerRef} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ clipPath: startPane.clipPath }}>
        <CanvasRenderer data={imageData} />
      </div>
      <div style={{ position: 'absolute', inset: 0, clipPath: endPane.clipPath }}>
        <CanvasRenderer data={simulated} />
      </div>
      <div {...handleProps} className="handle" />
    </div>
  )
}
```

See the full recipe in [Recipes → React Split View](/guide/recipes#react-split-view-with-use-split-view).
