# 型とメタデータ

## 型

### ColorblindType

サポートされているすべての色覚異常タイプ。`"none"` は正常視覚（単位行列/ノーオペレーション）を表します。

```ts
type ColorblindType =
  | "none"
  | "protanopia"
  | "protanomaly"
  | "deuteranopia"
  | "deuteranomaly"
  | "tritanopia"
  | "tritanomaly"
  | "achromatopsia"
  | "achromatomaly"
```

### ColorblindModel

利用可能なシミュレーションモデル。

```ts
type ColorblindModel = "vienot" | "machado" | "brettel"
```

### SimulateOptions

`simulate()`、`simulateBuffer()`、`getMatrix()` のオプション。

```ts
interface SimulateOptions {
  /** シミュレーションモデル。デフォルト: "machado"。 */
  model?: ColorblindModel
  /** 色覚異常の重症度。0（なし）から1（完全）。デフォルト: 1。 */
  severity?: number
}
```

### RGB

0〜255の整数チャンネルを持つオブジェクトとしてのRGBカラー。

```ts
interface RGB {
  r: number
  g: number
  b: number
}
```

### Matrix3x3

行優先順の9要素フラットタプルとしての3×3カラー行列。

```ts
type Matrix3x3 = [
  number, number, number,
  number, number, number,
  number, number, number,
]
```

### DeficiencyInfo

色覚異常タイプのメタデータ。

```ts
interface DeficiencyInfo {
  label: string
  description: string
  /** 代表的なカラープレビュー（16進数）。 */
  color: string
}
```

### ModelInfo

シミュレーションモデルのメタデータ。

```ts
interface ModelInfo {
  label: string
  description: string
}
```

## メタデータオブジェクト

### COLORBLIND_TYPES

`Record<ColorblindType, DeficiencyInfo>` — 全9種類の色覚異常タイプ（`"none"` を含む）のメタデータ。

```ts
import { COLORBLIND_TYPES } from 'chromanopia'

COLORBLIND_TYPES.protanopia
// {
//   label: "Protanopia",
//   description: "Red-blind, cannot perceive red light",
//   color: "#9b9a43"
// }
```

UIセレクター、凡例、ツールチップの構築に便利です。

| タイプ | ラベル | 説明 | プレビュー |
|---|---|---|---|
| `none` | Normal Vision | 色覚異常なし | `#e63946` |
| `protanopia` | Protanopia | 赤色盲、赤い光を知覚できない | `#9b9a43` |
| `protanomaly` | Protanomaly | 赤色弱、赤への感度が低下 | `#c67344` |
| `deuteranopia` | Deuteranopia | 緑色盲、緑の光を知覚できない | `#a5b242` |
| `deuteranomaly` | Deuteranomaly | 緑色弱、緑への感度が低下 | `#c36644` |
| `tritanopia` | Tritanopia | 青色盲、青い光を知覚できない | `#dd4040` |
| `tritanomaly` | Tritanomaly | 青色弱、青への感度が低下 | `#e03c44` |
| `achromatopsia` | Achromatopsia | 全色盲、グレースケールのみ | `#6e6e6e` |
| `achromatomaly` | Achromatomaly | 不全色盲、色知覚が低下 | `#a5565c` |

### COLORBLIND_MODELS

`Record<ColorblindModel, ModelInfo>` — 全3種類のシミュレーションモデルのメタデータ。

```ts
import { COLORBLIND_MODELS } from 'chromanopia'

COLORBLIND_MODELS.machado
// {
//   label: "Machado",
//   description: "Spectral-shift 3×3 matrix (2009), more accurate"
// }
```

| モデル | ラベル | 説明 |
|---|---|---|
| `vienot` | Viénot | 簡略化された3×3行列（1999）、高速で広く使用されている |
| `machado` | Machado | スペクトルシフト3×3行列（2009）、より正確 |
| `brettel` | Brettel | CIE xyYでの混同点射影（1997）、最も正確、低速 |

## 低レベルユーティリティ

高度なユースケース（カスタムパイプライン、シェーダーなど）向けにエクスポートされています。

### hexToRgb(hex)

```ts
function hexToRgb(hex: string): RGB
```

`#RGB`、`#RRGGBB`、`RGB`、または `RRGGBB` をRGBオブジェクトに解析します。無効な入力に対してはエラーをスローします。

### rgbToHex(rgb)

```ts
function rgbToHex(rgb: RGB): string
```

RGBオブジェクトを `#rrggbb` 文字列に変換します。値をクランプして丸めます。

### srgbToLinear(v)

```ts
function srgbToLinear(v: number): number
```

単一のsRGB値（0〜255）をリニア[0,1]に変換します。高速化のために事前計算済みLUTを使用します。

### linearToSrgb(c)

```ts
function linearToSrgb(c: number): number
```

リニア[0,1]の値をsRGB（0〜255）に変換します。有効範囲にクランプします。

### gamutMap(r, g, b)

```ts
function gamutMap(r: number, g: number, b: number): [number, number, number]
```

ガマット外のリニアRGBトリプレットをRec. 709輝度に向かってデサチュレーションすることで[0,1]にマッピングします。既にガマット内であれば入力をそのまま返します。
