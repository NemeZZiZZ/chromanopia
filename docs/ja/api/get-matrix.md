# getMatrix()

指定された色覚異常タイプと重症度に対する3×3シミュレーション行列を返します。行列ベースのモデル（Viénot、Machado）専用です。

## シグネチャ

```ts
function getMatrix(
  type: ColorblindType,
  options?: SimulateOptions,
): Matrix3x3
```

## パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `type` | `ColorblindType` | はい | 色覚異常タイプ |
| `options.model` | `"machado" \| "vienot"` | いいえ | デフォルト：`"machado"` |
| `options.severity` | `number` | いいえ | 0〜1、デフォルト `1`。有効範囲にクランプされます。 |

## 戻り値

`Matrix3x3` — **行優先**順の9要素フラットタプル `[m0, m1, m2, m3, m4, m5, m6, m7, m8]`：

```
| m0 m1 m2 |   | R |   | R' |
| m3 m4 m5 | × | G | = | G' |
| m6 m7 m8 |   | B |   | B' |
```

## 例外

`model` が `"brettel"` の場合、`Error` をスローします — Brettelはピクセルごとの射影を使用し、行列ではありません。呼び出す前に `isMatrixModel()` で確認してください。

## 使用例

### 基本的な使い方

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia')
// → [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998]
```

### 単位行列（severity 0）

```ts
getMatrix('protanopia', { severity: 0 })
// → [1, 0, 0, 0, 1, 0, 0, 0, 1]
```

### 補間された重症度

```ts
getMatrix('deuteranopia', { severity: 0.5 })
// 各値は：full[i] * 0.5 + identity[i] * 0.5
```

### WebGLユニフォーム

```ts
const m = getMatrix('deuteranopia', { model: 'machado' })

// 行優先 → 列優先：transpose=trueを渡す
gl.uniformMatrix3fv(location, true, new Float32Array(m))
```

### Sharp recomb

```ts
const m = getMatrix('protanopia', { model: 'vienot' })

await sharp('photo.jpg')
  .gamma(2.2)
  .recomb([[m[0], m[1], m[2]], [m[3], m[4], m[5]], [m[6], m[7], m[8]]])
  .gamma(1 / 2.2)
  .toBuffer()
```

### 呼び出し前の安全な確認

```ts
import { getMatrix, isMatrixModel } from 'chromanopia'

const model = getUserSelectedModel() // 'brettel'の可能性あり

if (isMatrixModel(model)) {
  const m = getMatrix(type, { model })
  // 行列を使用...
} else {
  // simulateBufferにフォールバック
}
```

---

# isMatrixModel()

指定されたモデルが3×3行列を使用するかどうかを返します。

## シグネチャ

```ts
function isMatrixModel(
  model: ColorblindModel
): model is "vienot" | "machado"
```

## 使用例

```ts
isMatrixModel('machado') // true
isMatrixModel('vienot')  // true
isMatrixModel('brettel') // false
```

これは型ガードです — 呼び出し後、TypeScriptがモデルの型を絞り込みます：

```ts
if (isMatrixModel(model)) {
  // ここでmodelは "vienot" | "machado" 型
  const m = getMatrix(type, { model })
}
```
