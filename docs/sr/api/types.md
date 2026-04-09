# Tipovi i metapodaci

## Tipovi

### ColorblindType

Svi podržani tipovi poremećaja kolornog vida. `"none"` predstavlja normalan vid (identitet / bez operacije).

```ts
type ColorblindType =
  | "none"
  | "protanopia"
  | "protanomaly"
  | "deuteranopia"
  | "deuteranomaly"
  | "tritanopia"
  | "tritanomaly"
  | "achromatopsia"
  | "achromatomaly"
```

### ColorblindModel

Dostupni modeli simulacije.

```ts
type ColorblindModel = "vienot" | "machado" | "brettel"
```

### SimulateOptions

Opcije za `simulate()`, `simulateBuffer()` i `getMatrix()`.

```ts
interface SimulateOptions {
  /** Model simulacije. Podrazumevano: "machado". */
  model?: ColorblindModel
  /** Jačina poremećaja od 0 (bez poremećaja) do 1 (potpuni). Podrazumevano: 1. */
  severity?: number
}
```

### RGB

RGB boja kao objekat sa kanalima celobrojnih vrednosti 0–255.

```ts
interface RGB {
  r: number
  g: number
  b: number
}
```

### Matrix3x3

Matrica boja 3×3 kao ravan niz od 9 elemenata u row-major redosledu.

```ts
type Matrix3x3 = [
  number, number, number,
  number, number, number,
  number, number, number,
]
```

### DeficiencyInfo

Metapodaci za tip poremećaja.

```ts
interface DeficiencyInfo {
  label: string
  description: string
  /** Reprezentativni pregled boje (hex). */
  color: string
}
```

### ModelInfo

Metapodaci za model simulacije.

```ts
interface ModelInfo {
  label: string
  description: string
}
```

## Objekti metapodataka

### COLORBLIND_TYPES

`Record<ColorblindType, DeficiencyInfo>` — metapodaci za svih 9 tipova poremećaja (uključujući `"none"`).

```ts
import { COLORBLIND_TYPES } from 'chromanopia'

COLORBLIND_TYPES.protanopia
// {
//   label: "Protanopia",
//   description: "Red-blind, cannot perceive red light",
//   color: "#9b9a43"
// }
```

Korisno za pravljenje UI selektora, legendi i opisa alata.

| Tip | Oznaka | Opis | Pregled |
|---|---|---|---|
| `none` | Normal Vision | Bez poremećaja kolornog vida | `#e63946` |
| `protanopia` | Protanopia | Slep za crvenu, ne može percipirati crvenu svetlost | `#9b9a43` |
| `protanomaly` | Protanomaly | Slabost crvene, smanjena osetljivost na crvenu | `#c67344` |
| `deuteranopia` | Deuteranopia | Slep za zelenu, ne može percipirati zelenu svetlost | `#a5b242` |
| `deuteranomaly` | Deuteranomaly | Slabost zelene, smanjena osetljivost na zelenu | `#c36644` |
| `tritanopia` | Tritanopia | Slep za plavu, ne može percipirati plavu svetlost | `#dd4040` |
| `tritanomaly` | Tritanomaly | Slabost plave, smanjena osetljivost na plavu | `#e03c44` |
| `achromatopsia` | Achromatopsia | Potpuna sleplost za boje, vidi samo nijanse sive | `#6e6e6e` |
| `achromatomaly` | Achromatomaly | Parcijalna sleplost za boje, smanjena percepcija boja | `#a5565c` |

### COLORBLIND_MODELS

`Record<ColorblindModel, ModelInfo>` — metapodaci za sva 3 modela simulacije.

```ts
import { COLORBLIND_MODELS } from 'chromanopia'

COLORBLIND_MODELS.machado
// {
//   label: "Machado",
//   description: "Spectral-shift 3×3 matrix (2009), more accurate"
// }
```

| Model | Oznaka | Opis |
|---|---|---|
| `vienot` | Viénot | Pojednostavljena 3×3 matrica (1999), brza i široko korišćena |
| `machado` | Machado | 3×3 matrica spektralnog pomaka (2009), preciznija |
| `brettel` | Brettel | Projekcija tačke konfuzije u CIE xyY (1997), najpreciznija, sporija |

## Niskonivoski pomoćni alati

Ovi se izvoze za napredne slučajeve upotrebe (prilagođeni pipeline-ovi, šejderi, itd.).

### hexToRgb(hex)

```ts
function hexToRgb(hex: string): RGB
```

Parsira `#RGB`, `#RRGGBB`, `RGB`, ili `RRGGBB` u RGB objekat. Baca izuzetak na nevalidan ulaz.

### rgbToHex(rgb)

```ts
function rgbToHex(rgb: RGB): string
```

Konvertuje RGB objekat u `#rrggbb` string. Ograničava i zaokružuje vrednosti.

### srgbToLinear(v)

```ts
function srgbToLinear(v: number): number
```

Konvertuje jednu sRGB vrednost (0–255) u linearnu [0,1]. Koristi prethodno izračunatu LUT tabelu za brzinu.

### linearToSrgb(c)

```ts
function linearToSrgb(c: number): number
```

Konvertuje linearnu [0,1] vrednost u sRGB (0–255). Ograničava na validan opseg.

### gamutMap(r, g, b)

```ts
function gamutMap(r: number, g: number, b: number): [number, number, number]
```

Mapira linearni RGB triplet van gamuta u [0,1] putem desaturacije ka njegovoj Rec. 709 svetlosti. Vraća ulaz nepromenjen ako je već u gamut.
