# はじめに

## インストール

::: code-group
```bash [npm]
npm install chromanopia
```
```bash [pnpm]
pnpm add chromanopia
```
```bash [yarn]
yarn add chromanopia
```
:::

## クイックスタート

### 単一色のシミュレーション

```ts
import { simulate } from 'chromanopia'

// 16進数文字列入力 → 16進数文字列出力
simulate('#e63946', 'protanopia')
// → '#8b8b2b'

// RGBオブジェクト入力 → RGBオブジェクト出力
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 139, g: 139, b: 43 }
```

### モデルと重症度の選択

```ts
simulate('#e63946', 'protanopia', {
  model: 'brettel',   // 'machado'（デフォルト）、'vienot'、または 'brettel'
  severity: 0.7,       // 0（正常）から 1（完全な色覚異常）
})
```

### 画像の処理（Canvas）

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'deuteranopia')
ctx.putImageData(imageData, 0, 0)
```

### 生の行列を取得（WebGL / Sharp向け）

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('tritanopia', { model: 'machado', severity: 0.5 })
// → [0.975, 0.025, 0, 0, 0.71667, 0.28333, 0, 0.2375, 0.7625]
```

## 仕組み

シミュレーションパイプライン：

1. **入力** — 16進数文字列またはRGBオブジェクト（チャンネルあたり0〜255）
2. **sRGB → リニア** — 事前計算された256エントリのLUTを使用してガンマカーブを除去
3. **シミュレーション** — リニアライト空間で選択されたモデルの変換を適用
4. **ガマットマッピング** — ガマット外の色をその輝度に向かってデサチュレーション（Rec. 709）
5. **リニア → sRGB** — ガンマカーブを再適用
6. **出力** — 入力と同じ形式

これにより物理的に正確な結果が保証されます。他の多くのライブラリはステップ2、4、5をスキップしており、特に彩度の高い色で視覚的に不正確な出力を生成します。

## 次のステップ

- [インタラクティブデモ](/ja/demo/color-picker)で実際の動作を確認
- [3つのモデル](/ja/guide/models)とそれぞれの使い分けについて読む
- Canvas、Sharp、WebGL統合の[レシピ](/ja/guide/recipes)を確認
- 完全な[APIリファレンス](/ja/api/simulate)を参照
