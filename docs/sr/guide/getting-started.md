# Početak rada

## Instalacija

::: code-group
```bash [npm]
npm install chromanopia
```
```bash [pnpm]
pnpm add chromanopia
```
```bash [yarn]
yarn add chromanopia
```
:::

## Brzi početak

### Simulacija jedne boje

```ts
import { simulate } from 'chromanopia'

// Hex string ulaz → hex string izlaz
simulate('#e63946', 'protanopia')
// → '#6c6545'

// RGB objekat ulaz → RGB objekat izlaz
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 108, g: 101, b: 69 }
```

### Izbor modela i jačine

```ts
simulate('#e63946', 'protanopia', {
  model: 'brettel',   // 'machado' (podrazumevano), 'vienot', ili 'brettel'
  severity: 0.7,       // 0 (normalan vid) do 1 (potpuni poremećaj)
})
```

### Obrada slike (Canvas)

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'deuteranopia')
ctx.putImageData(imageData, 0, 0)
```

### Dobijanje sirove matrice (za WebGL / Sharp)

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('tritanopia', { model: 'machado', severity: 0.5 })
// → [1.127764, -0.0383745, -0.0893895, -0.0392055, 0.9654045, 0.073801, 0.0023665, 0.3456835, 0.65195]
```

## Kako funkcioniše

Tok simulacije:

1. **Ulaz** — hex string ili RGB objekat (0–255 po kanalu)
2. **sRGB → Linearno** — uklanja gama krivu koristeći prethodno izračunatu LUT tabelu od 256 unosa
3. **Simulacija** — primenjuje transformaciju izabranog modela u linearnom svetlu
4. **Mapiranje gamuta** — desaturiše boje van opsega ka njihovoj svetlosti (Rec. 709)
5. **Linearno → sRGB** — ponovo primenjuje gama krivu
6. **Izlaz** — isti format kao ulaz

Ovo obezbeđuje fizički korektne rezultate. Mnoge druge biblioteke preskaču korake 2, 4 i 5, što proizvodi vidljivo netačan izlaz, posebno za zasićene boje.

## Šta dalje?

- Isprobajte [interaktivne demo-e](/sr/demo/color-picker) da vidite kako funkcioniše
- Pročitajte o [tri modela](/sr/guide/models) i kada koristiti koji
- Pogledajte [recepte](/sr/guide/recipes) za integraciju sa Canvas, Sharp i WebGL
- Pregledajte kompletnu [API referencu](/sr/api/simulate)
