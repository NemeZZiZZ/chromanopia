# getMatrix()

Returns the 3×3 simulation matrix for a given deficiency type and severity. For matrix-based models only (Viénot, Machado).

## Signature

```ts
function getMatrix(
  type: ColorblindType,
  options?: SimulateOptions,
): Matrix3x3
```

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | `ColorblindType` | Yes | Deficiency type |
| `options.model` | `"machado" \| "vienot"` | No | Default: `"machado"` |
| `options.severity` | `number` | No | 0–1, default `1`. Clamped to valid range. |

## Returns

`Matrix3x3` — a flat 9-element tuple `[m0, m1, m2, m3, m4, m5, m6, m7, m8]` in **row-major** order:

```
| m0 m1 m2 |   | R |   | R' |
| m3 m4 m5 | × | G | = | G' |
| m6 m7 m8 |   | B |   | B' |
```

## Throws

Throws `Error` if `model` is `"brettel"` — Brettel uses per-pixel projection, not a matrix. Use `isMatrixModel()` to check before calling.

## Examples

### Basic usage

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia')
// → [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998]
```

### Identity matrix (severity 0)

```ts
getMatrix('protanopia', { severity: 0 })
// → [1, 0, 0, 0, 1, 0, 0, 0, 1]
```

### Interpolated severity

```ts
getMatrix('deuteranopia', { severity: 0.5 })
// Each value is: full[i] * 0.5 + identity[i] * 0.5
```

### WebGL uniform

```ts
const m = getMatrix('deuteranopia', { model: 'machado' })

// Row-major → column-major: pass transpose=true
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

### Safe check before calling

```ts
import { getMatrix, isMatrixModel } from 'chromanopia'

const model = getUserSelectedModel() // could be 'brettel'

if (isMatrixModel(model)) {
  const m = getMatrix(type, { model })
  // use matrix...
} else {
  // fall back to simulateBuffer
}
```

---

# isMatrixModel()

Returns `true` if the given model uses a 3×3 matrix.

## Signature

```ts
function isMatrixModel(
  model: ColorblindModel
): model is "vienot" | "machado"
```

## Examples

```ts
isMatrixModel('machado') // true
isMatrixModel('vienot')  // true
isMatrixModel('brettel') // false
```

This is a type guard — after calling it, TypeScript narrows the model type:

```ts
if (isMatrixModel(model)) {
  // model is "vienot" | "machado" here
  const m = getMatrix(type, { model })
}
```
