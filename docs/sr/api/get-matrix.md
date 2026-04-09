# getMatrix()

Vraća 3×3 matricu simulacije za dati tip poremećaja i jačinu. Samo za modele zasnovane na matricama (Viénot, Machado).

## Potpis

```ts
function getMatrix(
  type: ColorblindType,
  options?: SimulateOptions,
): Matrix3x3
```

## Parametri

| Parametar | Tip | Obavezno | Opis |
|---|---|---|---|
| `type` | `ColorblindType` | Da | Tip poremećaja |
| `options.model` | `"machado" \| "vienot"` | Ne | Podrazumevano: `"machado"` |
| `options.severity` | `number` | Ne | 0–1, podrazumevano `1`. Ograničava se na validan opseg. |

## Vraća

`Matrix3x3` — ravan niz od 9 elemenata `[m0, m1, m2, m3, m4, m5, m6, m7, m8]` u **row-major** redosledu:

```
| m0 m1 m2 |   | R |   | R' |
| m3 m4 m5 | × | G | = | G' |
| m6 m7 m8 |   | B |   | B' |
```

## Baca izuzetak

Baca `Error` ako je `model` jednako `"brettel"` — Brettel koristi projekciju po pikselu, a ne matricu. Koristite `isMatrixModel()` za proveru pre pozivanja.

## Primeri

### Osnovna upotreba

```ts
import { getMatrix } from 'chromanopia'

const m = getMatrix('protanopia')
// → [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998]
```

### Jedinična matrica (jačina 0)

```ts
getMatrix('protanopia', { severity: 0 })
// → [1, 0, 0, 0, 1, 0, 0, 0, 1]
```

### Interpolirana jačina

```ts
getMatrix('deuteranopia', { severity: 0.5 })
// Svaka vrednost je: full[i] * 0.5 + identity[i] * 0.5
```

### WebGL uniform

```ts
const m = getMatrix('deuteranopia', { model: 'machado' })

// Row-major → column-major: prosledite transpose=true
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

### Bezbedna provera pre pozivanja

```ts
import { getMatrix, isMatrixModel } from 'chromanopia'

const model = getUserSelectedModel() // može biti 'brettel'

if (isMatrixModel(model)) {
  const m = getMatrix(type, { model })
  // koristite matricu...
} else {
  // prelazak na simulateBuffer
}
```

---

# isMatrixModel()

Vraća `true` ako dati model koristi 3×3 matricu.

## Potpis

```ts
function isMatrixModel(
  model: ColorblindModel
): model is "vienot" | "machado"
```

## Primeri

```ts
isMatrixModel('machado') // true
isMatrixModel('vienot')  // true
isMatrixModel('brettel') // false
```

Ovo je čuvar tipa — nakon pozivanja, TypeScript sužava tip modela:

```ts
if (isMatrixModel(model)) {
  // model je "vienot" | "machado" ovde
  const m = getMatrix(type, { model })
}
```
