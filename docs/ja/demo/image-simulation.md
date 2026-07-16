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

`simulateBuffer` はホットループ内でアロケーションなしにピクセルをインプレースで処理します。ウォーム状態のJavaScriptエンジンでのスループットはおおよそ以下の通りです：

| Image size | Machado | Brettel |
|---|---|---|
| 640×480 (VGA) | ~85ms | ~100ms |
| 1920×1080 (FHD) | ~560ms | ~660ms |
| 3840×2160 (4K) | ~2.2s | ~2.6s |

*1つの参考値 — Apple M1、Node 22。ブラウザでの結果は環境により異なります。一般的な写真（数メガピクセル）の処理はほぼ瞬時に感じられます。大きな画像やリアルタイム用途では、[Web Worker](/ja/guide/recipes#browser-offscreencanvas-web-worker)または[WebGL shader](/ja/guide/recipes#webgl-shader-uniform)の使用を検討してください。*

## ヒント

- デスクトップから任意の画像を**ドラッグ&ドロップ**できます
- **重症度を調整**して0から1への段階的な進行を確認してみてください
- **Machado対Brettel**を比較 — 違いは3型色覚異常（トリタノピア）で最も顕著です
- 純粋な**赤/緑**の画像は1型/2型色覚異常で最も劇的な違いを示します
