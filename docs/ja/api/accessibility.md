# アクセシビリティヘルパー

シミュレーションコアの上に構築されたアクセシビリティユーティリティ：WCAGコントラスト比、知覚的な色距離、相対輝度、そして「特定の色覚異常の下で2色が区別できるか」を判定するチェック。

これらは、色覚異常ライブラリを利用する本来の典型的な理由です — 色覚異常の人が見るものを単に*表示*するだけでなく、パレットが使いやすいかどうかを*テスト*できます。

---

## contrastRatio()

2色間のWCAG 2.xコントラスト比です。

```ts
function contrastRatio(
  a: string | RGB,
  b: string | RGB,
): number
```

**[1, 21]** の範囲の値を返します。1は同一、21は黒対白です。[`toRgb()`](./color-conversion) が理解する任意の色形式を受け付けます：16進数文字列、`rgb()`/`rgba()`、RGB、またはHSLオブジェクト。

### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `a` | `string \| RGB` | はい | 1つ目の色（16進数、`rgb()`、RGB、またはHSLオブジェクト） |
| `b` | `string \| RGB` | はい | 2つ目の色（`a` と同じ形式） |

### 使用例

```ts
import { contrastRatio } from 'chromanopia'

contrastRatio('#ffffff', '#000000') // 21
contrastRatio('#ffffff', '#767676') // ≈ 4.54（本文テキストのWCAG AAに合格）
contrastRatio('#777777', '#ffffff') // ≈ 4.48（順序は問わない）
contrastRatio('#e63946', '#e63946') // 1（同一）
```

### WCAGのしきい値

| 比率 | レベル | ユースケース |
|---|---|---|
| ≥ 7 | AAA | 18pt未満の本文テキスト |
| ≥ 4.5 | AA | 18pt未満の本文テキスト |
| ≥ 3 | AA | 18pt以上の大きなテキスト、またはUIコンポーネント |

---

## colorDistance()

2色間のsRGB [0,255]³空間におけるユークリッド距離です。計算コストが低く、知覚的な差異に対して単調です。知覚的に一様なΔEではなく、手軽な並べ替えに使用してください。

```ts
function colorDistance(
  a: string | RGB,
  b: string | RGB,
): number
```

### 使用例

```ts
import { colorDistance } from 'chromanopia'

colorDistance('#ff0000', '#00ff00') // ≈ 360.6（赤対緑）
colorDistance('#e63946', '#e63946') // 0（同一）
colorDistance('#000000', '#010101') // ≈ 1.73
```

---

## isDistinguishable()

指定された色覚異常をシミュレートした後でも2色が区別できる場合、すなわちシミュレーション後のsRGB距離が `threshold` を満たす場合に `true` を返します。

```ts
function isDistinguishable(
  a: string | RGB,
  b: string | RGB,
  type: ColorblindType,
  options?: SimulateOptions,
  threshold?: number, // デフォルト 30
): boolean
```

### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `a` | `string \| RGB` | はい | 1つ目の色 |
| `b` | `string \| RGB` | はい | 2つ目の色 |
| `type` | `ColorblindType` | はい | シミュレートする色覚異常。正常視力の距離には `"none"` を使用します。 |
| `options` | `SimulateOptions` | いいえ | シミュレーションモデル/重症度（デフォルト：Machado、重症度1） |
| `threshold` | `number` | いいえ | 区別できるとみなす最小のsRGBユークリッド距離。デフォルト `30`。 |

### 使用例

```ts
import { isDistinguishable } from 'chromanopia'

// オレンジ #f77f00 と緑 #1d9c1d は正常視力には明らかに違って見えますが...
isDistinguishable('#f77f00', '#1d9c1d', 'none')       // true
// ...protanope（赤色盲）には同じ色相に崩壊します：
isDistinguishable('#f77f00', '#1d9c1d', 'protanopia') // false

// ユースケースに合わせてしきい値を調整（低い = より厳格）：
isDistinguishable('#aabbcc', '#112233', 'deuteranopia', {}, 50) // より厳格
```

### しきい値の選び方

デフォルトの `30` は、sRGBディスプレイ上ではっきりと見える差異に相当します。重要なUI（ステータスインジケーター、混同されてはいけないチャートのデータ系列）には、より高いしきい値（50〜80）を使用してください。「ほぼ同じ色」の検出には、しきい値を下げます。

---

## relativeLuminance()

WCAG 2.x / Rec. 709に基づくsRGB色の相対輝度です。[0, 1] の範囲の値を返します（0は黒、1は白）。ライブラリの他の部分と同じsRGBリニア化を使用します。

```ts
function relativeLuminance(
  r: number,
  g: number,
  b: number,
): number
```

### パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `r` | `number` | はい | 赤チャンネル、0〜255 |
| `g` | `number` | はい | 緑チャンネル、0〜255 |
| `b` | `number` | はい | 青チャンネル、0〜255 |

### 使用例

```ts
import { relativeLuminance } from 'chromanopia'

relativeLuminance(0, 0, 0)       // 0
relativeLuminance(255, 255, 255) // 1
relativeLuminance(255, 0, 0)     // 0.2126（赤）
relativeLuminance(0, 255, 0)     // 0.7152（緑 — 最も重みが大きい）
relativeLuminance(0, 0, 255)     // 0.0722（青）
```

`contrastRatio()` はこの関数を使って実装されています。
