# Pomoćne funkcije za pristupačnost

Alati za pristupačnost izgrađeni na jezgru za simulaciju: WCAG odnos kontrasta, perceptualni razmak boja, relativna luminanca i provera „da li se dve boje razlikuju pod poremećajem".

Ovo je ujedno i glavni razlog zbog kojeg se uopšte poseže za bibliotekom za poremećaje kolornog vida — pored pukog *prikazivanja* onoga što vidi osoba sa daltonizmom, možete i da *testirate* da li je vaša paleta upotrebljiva.

---

## contrastRatio()

WCAG 2.x odnos kontrasta između dve boje.

```ts
function contrastRatio(
  a: string | RGB,
  b: string | RGB,
): number
```

Vraća vrednost u **[1, 21]**, gde je 1 za identične boje, a 21 za crnu naspram bele. Prihvata bilo koji oblik boje koji razume [`toRgb()`](./color-conversion): hex stringove, `rgb()`/`rgba()`, RGB ili HSL objekte.

### Parametri

| Parametar | Tip | Obavezno | Opis |
|---|---|---|---|
| `a` | `string \| RGB` | Da | Prva boja (hex, `rgb()`, RGB ili HSL objekat) |
| `b` | `string \| RGB` | Da | Druga boja (isti oblici kao za `a`) |

### Primeri

```ts
import { contrastRatio } from 'chromanopia'

contrastRatio('#ffffff', '#000000') // 21
contrastRatio('#ffffff', '#767676') // ≈ 4.54 (zadovoljava WCAG AA za tekst tela)
contrastRatio('#777777', '#ffffff') // ≈ 4.48 (redosled nije bitan)
contrastRatio('#e63946', '#e63946') // 1 (identične)
```

### WCAG pragovi

| Odnos | Nivo | Slučaj upotrebe |
|---|---|---|
| ≥ 7 | AAA | Tekst tela < 18pt |
| ≥ 4.5 | AA | Tekst tela < 18pt |
| ≥ 3 | AA | Veliki tekst ≥ 18pt, ili UI komponente |

---

## colorDistance()

Euklidsko rastojanje u sRGB [0,255]³ između dve boje. Jeftino i monotono u odnosu na perceptualnu razliku; koristite ga za brzo uređivanje, a ne za perceptualno ujednačen ΔE.

```ts
function colorDistance(
  a: string | RGB,
  b: string | RGB,
): number
```

### Primeri

```ts
import { colorDistance } from 'chromanopia'

colorDistance('#ff0000', '#00ff00') // ≈ 360.6 (crvena naspram zelene)
colorDistance('#e63946', '#e63946') // 0 (identične)
colorDistance('#000000', '#010101') // ≈ 1.73
```

---

## isDistinguishable()

Vraća `true` ako dve boje ostaju razlučive nakon simulacije datog poremećaja — tj. ako njihovo sRGB rastojanje nakon simulacije dostiže `threshold`.

```ts
function isDistinguishable(
  a: string | RGB,
  b: string | RGB,
  type: ColorblindType,
  options?: SimulateOptions,
  threshold?: number, // default 30
): boolean
```

### Parametri

| Parametar | Tip | Obavezno | Opis |
|---|---|---|---|
| `a` | `string \| RGB` | Da | Prva boja |
| `b` | `string \| RGB` | Da | Druga boja |
| `type` | `ColorblindType` | Da | Poremećaj za simulaciju. Koristite `"none"` za rastojanje pri normalnom vidu. |
| `options` | `SimulateOptions` | Ne | Model/jačina simulacije (podrazumevano Machado, jačina 1) |
| `threshold` | `number` | Ne | Minimalno euklidsko sRGB rastojanje koje se računa kao razlučivo. Podrazumevano `30`. |

### Primeri

```ts
import { isDistinguishable } from 'chromanopia'

// Narandžasta #f77f00 i zelena #1d9c1d izgledaju jasno različito normalnom vidu...
isDistinguishable('#f77f00', '#1d9c1d', 'none')       // true
// ...ali se skupe u istu nijansu za protanopa:
isDistinguishable('#f77f00', '#1d9c1d', 'protanopia') // false

// Podesite prag za svoj slučaj upotrebe (niže = strože):
isDistinguishable('#aabbcc', '#112233', 'deuteranopia', {}, 50) // strože
```

### Izbor praga

Podrazumevanih `30` odgovara jasno vidljivoj razlici na sRGB ekranu. Za kritične UI elemente (statusne indikatore, serije na grafikonima koje ne smeju biti pomešane), koristite viši prag (50–80). Za detekciju „približno ista boja", snizite ga.

---

## relativeLuminance()

Relativna luminanca sRGB boje, prema WCAG 2.x / Rec. 709. Vraća vrednost u [0, 1] gde je 0 crna, a 1 bela. Koristi istu sRGB linearizaciju kao i ostatak biblioteke.

```ts
function relativeLuminance(
  r: number,
  g: number,
  b: number,
): number
```

### Parametri

| Parametar | Tip | Obavezno | Opis |
|---|---|---|---|
| `r` | `number` | Da | Crveni kanal, 0–255 |
| `g` | `number` | Da | Zeleni kanal, 0–255 |
| `b` | `number` | Da | Plavi kanal, 0–255 |

### Primeri

```ts
import { relativeLuminance } from 'chromanopia'

relativeLuminance(0, 0, 0)       // 0
relativeLuminance(255, 255, 255) // 1
relativeLuminance(255, 0, 0)     // 0.2126 (crvena)
relativeLuminance(0, 255, 0)     // 0.7152 (zelena — najveća težina)
relativeLuminance(0, 0, 255)     // 0.0722 (plava)
```

Funkcija `contrastRatio()` je implementirana pomoću ove funkcije.
