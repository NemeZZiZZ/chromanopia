# getMatrix()

Devuelve la matriz de simulación 3×3 para un tipo de deficiencia y severidad dados. Solo para modelos basados en matrices (Viénot, Machado).

## Firma

```ts
function getMatrix(
  type: ColorblindType,
  options?: SimulateOptions,
): Matrix3x3
```

## Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `type` | `ColorblindType` | Sí | Tipo de deficiencia |
| `options.model` | `"machado" \| "vienot"` | No | Por defecto: `"machado"` |
| `options.severity` | `number` | No | 0–1, por defecto `1`. Se ajusta al rango válido. |

## Devuelve

`Matrix3x3` — una tupla plana de 9 elementos `[m0, m1, m2, m3, m4, m5, m6, m7, m8]` en orden **por filas** (row-major):

```
| m0 m1 m2 |   | R |   | R' |
| m3 m4 m5 | × | G | = | G' |
| m6 m7 m8 |   | B |   | B' |
```

## Lanza

Lanza `Error` si `model` es `"brettel"` — Brettel usa proyección por píxel, no una matriz. Usa `isMatrixModel()` para verificar antes de llamar.

## Ejemplos

### Uso básico

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia')
// → [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998]
```

### Matriz identidad (severidad 0)

```ts
getMatrix('protanopia', { severity: 0 })
// → [1, 0, 0, 0, 1, 0, 0, 0, 1]
```

### Severidad interpolada

```ts
getMatrix('deuteranopia', { severity: 0.5 })
// Cada valor es: full[i] * 0.5 + identity[i] * 0.5
```

### Uniforme WebGL

```ts
const m = getMatrix('deuteranopia', { model: 'machado' })

// Row-major → column-major: pasa transpose=true
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

### Verificación segura antes de llamar

```ts
import { getMatrix, isMatrixModel } from 'chromanopia'

const model = getUserSelectedModel() // podría ser 'brettel'

if (isMatrixModel(model)) {
  const m = getMatrix(type, { model })
  // usar matriz...
} else {
  // recurrir a simulateBuffer
}
```

---

# isMatrixModel()

Devuelve `true` si el modelo dado usa una matriz 3×3.

## Firma

```ts
function isMatrixModel(
  model: ColorblindModel
): model is "vienot" | "machado"
```

## Ejemplos

```ts
isMatrixModel('machado') // true
isMatrixModel('vienot')  // true
isMatrixModel('brettel') // false
```

Esto es un type guard — después de llamarlo, TypeScript reduce el tipo del modelo:

```ts
if (isMatrixModel(model)) {
  // model es "vienot" | "machado" aquí
  const m = getMatrix(type, { model })
}
```
