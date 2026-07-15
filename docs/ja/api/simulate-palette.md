# simulatePalette()

1回の呼び出しでパレット全体の色をシミュレートします。各入力は個別にシミュレートされ、要素ごとに出力型が保持されます（16進数文字列入力 → 16進数文字列出力、RGBオブジェクト入力 → RGBオブジェクト出力）。混在パレットもサポートされています。

これにより、ループ内で [`simulate()`](./simulate) を呼び出す際の色ごとのアロケーションオーバーヘッドを回避でき、バッチアクセシビリティチェックに推奨されるエントリポイントです。

## シグネチャ

```ts
function simulatePalette<T extends string | RGB>(
  colors: readonly T[],
  type: ColorblindType,
  options?: SimulateOptions,
): T[]
```

## パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `colors` | `readonly (string \| RGB)[]` | はい | 色の配列。各要素は16進数文字列またはRGBオブジェクトのいずれかです。 |
| `type` | `ColorblindType` | はい | シミュレートする色覚異常タイプ |
| `options.model` | `ColorblindModel` | いいえ | `"machado"`（デフォルト）、`"vienot"`、または `"brettel"` |
| `options.severity` | `number` | いいえ | 0〜1、デフォルト `1`。有効範囲にクランプされます。 |

## 戻り値

入力と同じ長さの**新しい配列**。入力配列が変更されることはありません。各要素は対応する入力要素の型を保持します。

## 使用例

### デザインシステムのパレットをシミュレート

```ts
import { simulatePalette } from 'chromanopia'

const brand = ['#e63946', '#457b9d', '#1d3557']
const simulated = simulatePalette(brand, 'protanopia')
// → ['#6c6545', '#6b7a9f', '#263758']
```

### 型の混在が保持される

```ts
const mixed = simulatePalette(
  ['#ff0000', { r: 0, g: 0, b: 255 }],
  'deuteranopia',
)
// → [ '#a29000', { r: 0, g: 66, b: 133 } ]
typeof mixed[0] // 'string'
typeof mixed[1] // 'object'
```

### モデルと重症度の指定

```ts
simulatePalette(brand, 'protanomaly', { model: 'brettel', severity: 0.6 })
```

### 空のパレット

```ts
simulatePalette([], 'protanopia') // → []
```

## 動作

- `type` が `"none"` の場合、入力のコピーを返します（同じ参照になることはありません — [`simulate()`](./simulate) を参照）。
- `colors.map(c => simulate(c, type, options))` と同等ですが、色ごとに使い捨ての4バイトピクセルバッファを作成しません。
- `"none"` パスおよびRGB入力の場合、各出力は新しいコピーであるため、結果を変更しても呼び出し元の入力に影響を与えることはありません。
