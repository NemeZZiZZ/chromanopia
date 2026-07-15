# simulate()

特定の色覚異常を持つ人が見る単一色をシミュレートします。

## シグネチャ

```ts
function simulate<T extends string | RGB>(
  color: T,
  type: ColorblindType,
  options?: SimulateOptions,
): T
```

**入力と同じ型を返します**：16進数文字列入力 → 16進数文字列出力、RGBオブジェクト入力 → RGBオブジェクト出力。

## パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `color` | `string \| RGB` | はい | 16進数文字列（`"#e63946"`、`"e63946"`、`"#F00"`）またはRGBオブジェクト `{ r, g, b }`（0〜255） |
| `type` | `ColorblindType` | はい | シミュレートする色覚異常タイプ |
| `options.model` | `ColorblindModel` | いいえ | `"machado"`（デフォルト）、`"vienot"`、または `"brettel"` |
| `options.severity` | `number` | いいえ | 0（正常視覚）から1（完全な色覚異常）。デフォルト：`1`。範囲外の値はクランプされます。 |

## 使用例

### 16進数文字列

```ts
import { simulate } from 'chromanopia'

simulate('#e63946', 'protanopia')
// → '#6c6545'

simulate('#F00', 'deuteranopia')
// → '#a29000'

simulate('e63946', 'tritanopia')  // #はオプション
// → '#f60046'
```

### RGBオブジェクト

```ts
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 108, g: 101, b: 69 }
```

### モデルと重症度の指定

```ts
simulate('#e63946', 'protanopia', { model: 'brettel', severity: 0.7 })
// → '#aa6d56'

simulate('#e63946', 'protanopia', { severity: 0 })
// → '#e63946'（変更なし — severity 0 = 正常視覚）
```

### タイプ `"none"`（ノーオペレーション）

```ts
simulate('#e63946', 'none')
// → '#e63946'（常に入力をそのまま返す）
```

## 動作

- `type` が `"none"` の場合、入力をそのまま返します（処理なし）
- `severity` が `0` の場合、入力をそのまま返します
- 内部的に4ピクセルの `Uint8ClampedArray` を作成し、`simulateBuffer` に委譲します
- 16進数入力の場合、`hexToRgb` で解析し、`rgbToHex` で変換して返します
