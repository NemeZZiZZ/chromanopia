# カラーピッカー

任意の色を選択して、8種類すべての色覚異常でどのように見えるかを確認できます。モデルと重症度を変更して違いを探索してください。

<script setup>
import ColorPicker from '../../.vitepress/theme/components/ColorPicker.vue'
</script>

<ClientOnly>
  <ColorPicker />
</ClientOnly>

## 表示内容

各スウォッチは `simulate(color, type, { model, severity })` の結果を表示しています：

- **正常視覚** — 元の色、変更なし
- **Protanopia / Protanomaly** — L錐体（赤）の応答が低下または欠如
- **Deuteranopia / Deuteranomaly** — M錐体（緑）の応答が低下または欠如
- **Tritanopia / Tritanomaly** — S錐体（青）の応答が低下または欠如
- **Achromatopsia / Achromatomaly** — すべての錐体機能の完全または部分的な喪失

## 試してみる色

| 色 | 注目ポイント |
|---|---|
| `#e63946`（赤） | 1型/2型色覚異常で劇的に変化 |
| `#2a9d8f`（ティール） | 2型色覚異常ではグレーと区別しにくい |
| `#f4a261`（オレンジ） | 1型色覚異常では黄色と混同される |
| `#6a4c93`（紫） | 2型/1型色覚異常では青と混同される |
| `#00ff00`（純粋な緑） | 2型色覚異常ではほぼ見えなくなる |

## コード

```ts
import { simulate } from 'chromanopia'

// 各スウォッチの背後にあるコード：
const result = simulate('#e63946', 'protanopia', {
  model: 'machado',
  severity: 1,
})
// → '#6c6545'
```
