# Konverzija boja

Alati za parsiranje i konverziju boja: parsiranje hex vrednosti (3/4/6/8 cifara), `rgb()`/`rgba()` CSS stringova, HSL round-trip konverzije i univerzalni `toRgb()` koercer.

Izveženi su kako za direktnu upotrebu, tako i zato što API-ji višeg nivoa ([`simulate()`](./simulate), [`simulatePalette()`](./simulate-palette), [pomoćne funkcije za pristupačnost](./accessibility)) prihvataju bilo koji oblik boje tako što prolaze kroz `toRgb()`.

---

## toRgb()

Svodi boju u bilo kom prihvaćenom obliku na RGB objekat. Univerzalna ulazna tačka koju koristi ostatak API-ja.

```ts
function toRgb(color: string | RGB | HSL): RGB
```

Prihvata hex stringove (`"#e63946"`, `"F00"`, `"#RRGGBBAA"`), CSS `rgb()`/`rgba()` stringove, HSL objekte ili RGB objekte (vraćaju se kao sveža kopija).

### Primeri

```ts
import { toRgb } from 'chromanopia'

toRgb('#ff0000')                  // { r: 255, g: 0, b: 0 }
toRgb('rgb(230 57 70)')           // { r: 230, g: 57, b: 70 }
toRgb({ h: 120, s: 1, l: 0.5 })   // { r: 0, g: 255, b: 0 }
toRgb({ r: 10, g: 20, b: 30 })    // { r: 10, g: 20, b: 30 } (copy, not alias)
```

::: tip
RGB objekti se vraćaju kao kopije, nikada kao ista referenca, tako da je menjanje rezultata bezbedno.
:::

---

## parseCssColor()

Parsira CSS string boje u RGB objekat. Nižeg nivoa od `toRgb()` — prihvata samo stringove.

```ts
function parseCssColor(css: string): RGB
```

Podržava hex (3/4/6/8 cifara, sa ili bez `#`) i `rgb()` / `rgba()` i u staroj sintaksi sa zapetom (`rgba(230, 57, 70, 0.5)`) i u modernoj sintaksi sa razmakom (`rgb(230 57 70 / 0.5)`). Kanali u procentima (`rgb(100%, 0%, 0%)`) su podržani. Alfa komponenta se parsira ali se ne vraća (`RGB` nema alfu).

### Primeri

```ts
import { parseCssColor } from 'chromanopia'

parseCssColor('#e63946ff')              // { r: 230, g: 57, b: 70 } (8-digit, alpha dropped)
parseCssColor('rgb(230, 57, 70)')       // { r: 230, g: 57, b: 70 }
parseCssColor('rgba(230 57 70 / 0.5)')  // { r: 230, g: 57, b: 70 }
parseCssColor('rgb(100%, 0%, 0%)')      // { r: 255, g: 0, b: 0 }
```

Baca grešku kod nepodržanih formata (imenovane boje poput `"red"`, `hsl()` stringovi itd. nisu podržani — za HSL prvo konvertujte putem `hslToRgb()`).

---

## hexToRgb()

Parsira hex string boje u RGB objekat.

```ts
function hexToRgb(hex: string): RGB
```

Prihvata `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA` (sa ili bez vodećeg `#`). Alfa komponenta se parsira ali se odbacuje.

### Primeri

```ts
import { hexToRgb } from 'chromanopia'

hexToRgb('#e63946')   // { r: 230, g: 57, b: 70 }
hexToRgb('e63946')    // { r: 230, g: 57, b: 70 } (# optional)
hexToRgb('#F00')      // { r: 255, g: 0, b: 0 }   (3-digit)
hexToRgb('#e63946ff') // { r: 230, g: 57, b: 70 } (8-digit, alpha dropped)
```

Baca `Error` pri nevažećem ulazu — validira se ceo string, tako da se delimično validni stringovi poput `#12gggg` odbacuju (nema tihog `parseInt` parsiranja prefiksa).

---

## rgbToHex()

Konvertuje RGB objekat u 6-cifreni hex string sa `#` prefiksom.

```ts
function rgbToHex(rgb: RGB): string
```

Vrednosti kanala se ograničavaju na [0, 255] i zaokružuju.

### Primeri

```ts
import { rgbToHex } from 'chromanopia'

rgbToHex({ r: 230, g: 57, b: 70 }) // '#e63946'
rgbToHex({ r: 0, g: 0, b: 0 })     // '#000000'
rgbToHex({ r: 300, g: -5, b: 0 })  // '#ff0000' (clamped)
rgbToHex({ r: 127.6, g: 0, b: 0 }) // '#800000' (rounded)
```

---

## rgbToHsl()

Konvertuje RGB boju u HSL.

```ts
function rgbToHsl(rgb: RGB): HSL
```

Vraća `{ h, s, l }` gde je `h` nijansa u stepenima [0, 360), a `s`/`l` zasićenje i svetlina kao razlomci u [0, 1].

### Primeri

```ts
import { rgbToHsl } from 'chromanopia'

rgbToHsl({ r: 255, g: 0, b: 0 })   // { h: 0,   s: 1, l: 0.5 } (red)
rgbToHsl({ r: 0, g: 255, b: 0 })   // { h: 120, s: 1, l: 0.5 } (green)
rgbToHsl({ r: 0, g: 0, b: 255 })   // { h: 240, s: 1, l: 0.5 } (blue)
rgbToHsl({ r: 128, g: 128, b: 128 }) // { h: 0, s: 0, l: 0.5 } (gray → s: 0)
```

---

## hslToRgb()

Konvertuje HSL boju u RGB.

```ts
function hslToRgb(hsl: HSL): RGB
```

`h` van opsega se normalizuje po modulu 360; `s` i `l` se ograničavaju na [0, 1].

### Primeri

```ts
import { hslToRgb } from 'chromanopia'

hslToRgb({ h: 0,   s: 1, l: 0.5 }) // { r: 255, g: 0,   b: 0   } (red)
hslToRgb({ h: 120, s: 1, l: 0.5 }) // { r: 0,   g: 255, b: 0   } (green)
hslToRgb({ h: 480, s: 1, l: 0.5 }) // { r: 0,   g: 255, b: 0   } (480° ≡ 120°)
hslToRgb({ h: 0,   s: 0, l: 0.5 }) // { r: 128, g: 128, b: 128 } (gray)
```

`rgbToHsl` i `hslToRgb` se round-tripuju tačno (najgora greška kanala: 0 unutar 8-bitne preciznosti).
