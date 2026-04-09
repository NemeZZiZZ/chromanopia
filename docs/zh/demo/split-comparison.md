# 分屏对比

通过可拖动的分屏视图并排对比原始图像和模拟图像。这是查看色觉缺陷如何影响感知的最直观方式。

<script setup>
import SplitComparison from '../../.vitepress/theme/components/SplitComparison.vue'
</script>

<ClientOnly>
  <SplitComparison />
</ClientOnly>

## 观察要点

拖动手柄以显示原始图像（左侧）和模拟图像（右侧）。注意：

- **Protanopia / Deuteranopia** — 红色和绿色变得无法区分，塌缩为黄色和棕色
- **Tritanopia** — 蓝色和黄色合并，而红色和绿色仍然可见
- **Achromatopsia** — 所有颜色信息丢失，仅保留亮度
- **部分变体**（异常）— 颜色偏移但仍可部分区分

## 提示

- **上传您自己的图像** — 测试您的应用截图、图表或 UI 设计
- **调整严重程度** — 从 0 滑动到 1，观察渐变过程
- **先试试 deuteranomaly** — 它是最常见的色觉缺陷类型（约 5% 的男性）

## 在 React 中构建

对于 React 应用，[`use-split-view`](https://github.com/NemeZZiZZ/use-split-view) 无头 Hook 提供相同的分屏 UX，支持缩放、平移和触控：

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

完整示例请参阅[实用示例 → React 分屏视图](/zh/guide/recipes#react-split-view-with-use-split-view)。
