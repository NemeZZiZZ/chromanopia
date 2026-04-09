# getMatrix()

Возвращает матрицу симуляции 3×3 для заданного типа нарушения и степени. Только для моделей на основе матриц (Viénot, Machado).

## Сигнатура

```ts
function getMatrix(
  type: ColorblindType,
  options?: SimulateOptions,
): Matrix3x3
```

## Параметры

| Параметр | Тип | Обязателен | Описание |
|---|---|---|---|
| `type` | `ColorblindType` | Да | Тип нарушения |
| `options.model` | `"machado" \| "vienot"` | Нет | По умолчанию: `"machado"` |
| `options.severity` | `number` | Нет | 0–1, по умолчанию `1`. Обрезается до допустимого диапазона. |

## Возвращаемое значение

`Matrix3x3` — плоский кортеж из 9 элементов `[m0, m1, m2, m3, m4, m5, m6, m7, m8]` в порядке **row-major**:

```
| m0 m1 m2 |   | R |   | R' |
| m3 m4 m5 | × | G | = | G' |
| m6 m7 m8 |   | B |   | B' |
```

## Исключения

Бросает `Error`, если `model` равен `"brettel"` — Brettel использует попиксельную проекцию, а не матрицу. Используйте `isMatrixModel()` для проверки перед вызовом.

## Примеры

### Базовое использование

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia')
// → [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998]
```

### Единичная матрица (severity 0)

```ts
getMatrix('protanopia', { severity: 0 })
// → [1, 0, 0, 0, 1, 0, 0, 0, 1]
```

### Интерполированная степень

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

### Безопасная проверка перед вызовом

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

Возвращает `true`, если данная модель использует матрицу 3×3.

## Сигнатура

```ts
function isMatrixModel(
  model: ColorblindModel
): model is "vienot" | "machado"
```

## Примеры

```ts
isMatrixModel('machado') // true
isMatrixModel('vienot')  // true
isMatrixModel('brettel') // false
```

Это type guard — после вызова TypeScript сужает тип модели:

```ts
if (isMatrixModel(model)) {
  // model is "vienot" | "machado" here
  const m = getMatrix(type, { model })
}
```
