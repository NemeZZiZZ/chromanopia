# 画像シミュレーション

画像をアップロードするか、組み込みサンプルを使用して、さまざまな色覚異常の下でどのように見えるかを確認できます。すべての処理は `simulateBuffer()` を使用してブラウザ内で行われます。

<script setup>
import ImageSimulator from '../../.vitepress/theme/components/ImageSimulator.vue'
</script>

<ClientOnly>
  <ImageSimulator />
</ClientOnly>

## 仕組み

このデモはCanvas APIを使用して画像を処理します：

```ts
import { simulateBuffer } from 'chromanopia'

// Canvasからピクセルデータを取得
const imageData = ctx.getImageData(0, 0, width, height)

// インプレースでシミュレート（バッファを変更）
simulateBuffer(imageData.data, 'protanopia', {
  model: 'machado',
  severity: 1,
})

// 変更されたデータを戻す
ctx.putImageData(imageData, 0, 0)
```

## パフォーマンス

`simulateBuffer` はホットループ内でアロケーションなしにピクセルをインプレースで処理します：

| 画像サイズ | Machado/Viénot | Brettel |
|---|---|---|
| 640×480（VGA） | 約2ms | 約8ms |
| 1920×1080（FHD） | 約12ms | 約45ms |
| 3840×2160（4K） | 約50ms | 約180ms |

大きな画像の場合は、メインスレッドのブロックを避けるために[Web Worker](/ja/guide/recipes#browser-offscreencanvas-web-worker)の使用を検討してください。

## ヒント

- デスクトップから任意の画像を**ドラッグ&ドロップ**できます
- **重症度を調整**して0から1への段階的な進行を確認してみてください
- **Machado対Brettel**を比較 — 違いは3型色覚異常（トリタノピア）で最も顕著です
- 純粋な**赤/緑**の画像は1型/2型色覚異常で最も劇的な違いを示します
