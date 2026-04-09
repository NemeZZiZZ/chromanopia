# 分割比較

ドラッグ可能な分割ビューでオリジナルとシミュレート画像を並べて比較します。色覚異常が知覚に与える影響を確認する最も直感的な方法です。

<script setup>
import SplitComparison from '../../.vitepress/theme/components/SplitComparison.vue'
</script>

<ClientOnly>
  <SplitComparison />
</ClientOnly>

## 注目ポイント

ハンドルをドラッグしてオリジナル（左）とシミュレート（右）の画像を表示します。以下に注目してください：

- **Protanopia / Deuteranopia** — 赤と緑が区別できなくなり、黄色と茶色に変化
- **Tritanopia** — 青と黄色が融合し、赤と緑は見える状態を維持
- **Achromatopsia** — すべての色情報が失われ、輝度のみが残る
- **部分的変異型**（anomaly） — 色がシフトするが部分的に識別可能

## ヒント

- **独自の画像をアップロード** — アプリのスクリーンショット、チャート、UIデザインをテスト
- **重症度を調整** — 0から1にスライドして段階的な進行を確認
- **まずdeuteranomalyを試す** — 最も一般的なCVDタイプ（男性の約5%）

## Reactでの構築

Reactアプリケーションでは、[`use-split-view`](https://github.com/NemeZZiZZ/use-split-view)ヘッドレスフックがズーム、パン、タッチ対応の同じ分割ビューUXを提供します：

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

完全なレシピは[レシピ → React分割ビュー](/ja/guide/recipes#react-split-view-with-use-split-view)を参照してください。
