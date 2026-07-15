# simulatePalette()

Simulira celu paletu boja u jednom pozivu. Svaki ulaz se simulira nezavisno, a tipovi izlaza se čuvaju po elementu (hex string ulaz daje hex string izlaz; RGB objekat daje RGB objekat). Mešovite palete su podržane.

Ovo izbegava režijski trošak alokacije po boji koji nastaje pozivanjem [`simulate()`](./simulate) u petlji i preporučena je ulazna tačka za grupne provere pristupačnosti.

## Potpis

```ts
function simulatePalette<T extends string | RGB>(
  colors: readonly T[],
  type: ColorblindType,
  options?: SimulateOptions,
): T[]
```

## Parametri

| Parametar | Tip | Obavezno | Opis |
|---|---|---|---|
| `colors` | `readonly (string \| RGB)[]` | Da | Niz boja. Svaka može biti hex string ili RGB objekat. |
| `type` | `ColorblindType` | Da | Tip poremećaja za simulaciju |
| `options.model` | `ColorblindModel` | Ne | `"machado"` (podrazumevano), `"vienot"`, ili `"brettel"` |
| `options.severity` | `number` | Ne | 0–1, podrazumevano `1`. Ograničava se na validan opseg. |

## Povratna vrednost

**Novi niz** iste dužine kao ulaz. Ulazni niz se nikada ne menja. Svaki element zadržava tip odgovarajućeg ulaznog elementa.

## Primeri

### Simulacija palete dizajn-sistema

```ts
import { simulatePalette } from 'chromanopia'

const brand = ['#e63946', '#457b9d', '#1d3557']
const simulated = simulatePalette(brand, 'protanopia')
// → ['#6c6545', '#6b7a9f', '#263758']
```

### Mešoviti tipovi se čuvaju

```ts
const mixed = simulatePalette(
  ['#ff0000', { r: 0, g: 0, b: 255 }],
  'deuteranopia',
)
// → [ '#a29000', { r: 0, g: 66, b: 133 } ]
typeof mixed[0] // 'string'
typeof mixed[1] // 'object'
```

### Sa modelom i jačinom

```ts
simulatePalette(brand, 'protanomaly', { model: 'brettel', severity: 0.6 })
```

### Prazna paleta

```ts
simulatePalette([], 'protanopia') // → []
```

## Ponašanje

- Kada je `type` jednako `"none"`, vraća kopije ulaza (nikada iste reference — videti [`simulate()`](./simulate)).
- Ekvivalentno sa `colors.map(c => simulate(c, type, options))`, ali izbegava kreiranje bafera od 4 bajta po boji koji se odmah odbacuje.
- Za `"none"` putanju i RGB ulaze, svaki izlaz je sveža kopija, tako da menjanje rezultata nikada ne utiče na ulaz pozivaoca.
