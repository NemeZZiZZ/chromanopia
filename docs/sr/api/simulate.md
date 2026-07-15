# simulate()

Simulira jednu boju onako kako je vidi osoba sa specifičnim poremećajem kolornog vida.

## Potpis

```ts
function simulate<T extends string | RGB>(
  color: T,
  type: ColorblindType,
  options?: SimulateOptions,
): T
```

**Vraća isti tip kao ulaz**: hex string ulaz → hex string izlaz, RGB objekat ulaz → RGB objekat izlaz.

## Parametri

| Parametar | Tip | Obavezno | Opis |
|---|---|---|---|
| `color` | `string \| RGB` | Da | Hex string (`"#e63946"`, `"e63946"`, `"#F00"`) ili RGB objekat `{ r, g, b }` (0–255) |
| `type` | `ColorblindType` | Da | Tip poremećaja za simulaciju |
| `options.model` | `ColorblindModel` | Ne | `"machado"` (podrazumevano), `"vienot"`, ili `"brettel"` |
| `options.severity` | `number` | Ne | 0 (normalan vid) do 1 (potpuni poremećaj). Podrazumevano: `1`. Vrednosti van opsega se ograničavaju. |

## Primeri

### Hex string

```ts
import { simulate } from 'chromanopia'

simulate('#e63946', 'protanopia')
// → '#6c6545'

simulate('#F00', 'deuteranopia')
// → '#a29000'

simulate('e63946', 'tritanopia')  // # je opcionalan
// → '#f60046'
```

### RGB objekat

```ts
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 108, g: 101, b: 69 }
```

### Sa modelom i jačinom

```ts
simulate('#e63946', 'protanopia', { model: 'brettel', severity: 0.7 })
// → '#aa6d56'

simulate('#e63946', 'protanopia', { severity: 0 })
// → '#e63946' (nepromenjeno — jačina 0 = normalan vid)
```

### Tip `"none"` (bez operacije)

```ts
simulate('#e63946', 'none')
// → '#e63946' (uvek vraća ulaz nepromenjen)
```

## Ponašanje

- Kada je `type` jednako `"none"`, vraća ulaz nepromenjen (bez obrade)
- Kada je `severity` jednako `0`, vraća ulaz nepromenjen
- Interno kreira 4-pikselni `Uint8ClampedArray` i delegira na `simulateBuffer`
- Za hex ulaz, parsira putem `hexToRgb`, konvertuje nazad putem `rgbToHex`
