# getMatrix()

返回给定缺陷类型和严重程度的 3×3 模拟矩阵。仅适用于基于矩阵的模型（Viénot、Machado）。

## 签名

```ts
function getMatrix(
  type: ColorblindType,
  options?: SimulateOptions,
): Matrix3x3
```

## 参数

| 参数 | 类型 | 必需 | 描述 |
|---|---|---|---|
| `type` | `ColorblindType` | 是 | 缺陷类型 |
| `options.model` | `"machado" \| "vienot"` | 否 | 默认值：`"machado"` |
| `options.severity` | `number` | 否 | 0–1，默认 `1`。会钳制到有效范围。 |

## 返回值

`Matrix3x3` — 一个扁平的 9 元素元组 `[m0, m1, m2, m3, m4, m5, m6, m7, m8]`，**行优先**顺序：

```
| m0 m1 m2 |   | R |   | R' |
| m3 m4 m5 | × | G | = | G' |
| m6 m7 m8 |   | B |   | B' |
```

## 抛出异常

当 `model` 为 `"brettel"` 时抛出 `Error` — Brettel 使用逐像素投影，不是矩阵。调用前请使用 `isMatrixModel()` 检查。

## 示例

### 基本用法

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia')
// → [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998]
```

### 单位矩阵（severity 0）

```ts
getMatrix('protanopia', { severity: 0 })
// → [1, 0, 0, 0, 1, 0, 0, 0, 1]
```

### 插值的严重程度

```ts
getMatrix('deuteranopia', { severity: 0.5 })
// 每个值为：full[i] * 0.5 + identity[i] * 0.5
```

### WebGL uniform

```ts
const m = getMatrix('deuteranopia', { model: 'machado' })

// 行优先 → 列优先：传入 transpose=true
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

### 调用前安全检查

```ts
import { getMatrix, isMatrixModel } from 'chromanopia'

const model = getUserSelectedModel() // 可能是 'brettel'

if (isMatrixModel(model)) {
  const m = getMatrix(type, { model })
  // 使用矩阵...
} else {
  // 回退到 simulateBuffer
}
```

---

# isMatrixModel()

如果给定模型使用 3×3 矩阵，则返回 `true`。

## 签名

```ts
function isMatrixModel(
  model: ColorblindModel
): model is "vienot" | "machado"
```

## 示例

```ts
isMatrixModel('machado') // true
isMatrixModel('vienot')  // true
isMatrixModel('brettel') // false
```

这是一个类型守卫 — 调用后，TypeScript 会缩窄模型类型：

```ts
if (isMatrixModel(model)) {
  // 此处 model 类型为 "vienot" | "machado"
  const m = getMatrix(type, { model })
}
```
