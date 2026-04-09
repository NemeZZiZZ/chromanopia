# Poređenje modela

Uporedite tri modela simulacije jedan pored drugog. Svaki model transformiše istu ulaznu boju na različit način — pogledajte izlaz, osnovnu matricu i matematički pristup.

<script setup>
import ModelComparison from '../../.vitepress/theme/components/ModelComparison.vue'
import MatrixInspector from '../../.vitepress/theme/components/MatrixInspector.vue'
</script>

<ClientOnly>
  <ModelComparison />
</ClientOnly>

## Inspektor matrice

Pregledajte sirovu 3×3 matricu za modele zasnovane na matricama (Viénot i Machado). Pratite kako se matrica menja dok podešavate jačinu — linearno se interpolira između jedinične matrice i matrice potpunog poremećaja.

<ClientOnly>
  <MatrixInspector />
</ClientOnly>

## Ključne razlike

### Zašto modeli daju različite rezultate?

Svaki model koristi različit matematički pristup za simulaciju gubitka čepića:

- **Viénot** projektuje na redukovan prostor boja koristeći jednu prethodno izračunatu matricu. Vrednosti su uvek nenegativne, tako da je rezultat uvek unutar gamuta, ali preciznost trpi.

- **Machado** modeluje spektralni pomak pogođenog tipa čepića. Vrednosti matrice mogu biti negativne (boja može trebati da "pozajmi" iz drugog kanala), što je preciznije ali može proizvesti međuvrednosti van gamuta.

- **Brettel** uopšte ne koristi jednu matricu — projektuje svaki piksel pojedinačno u CIE xyY hromatičnom prostoru duž linije konfuzije ka tački konfuzije. Ovo je najpreciznije ali ~3-5× sporije.

### Kada razlike imaju značaj?

Za većinu rada na pristupačnosti korisničkog interfejsa, razlike su zanemarljive. Postaju vidljive za:

- **Zasićene boje** (čista crvena, čista zelena) — Machado i Brettel daju primetno drugačije rezultate od Viénot-a
- **Tritanopija** — Brettel je značajno precizniji ovde zbog projekcije po pikselu
- **Parcijalni poremećaji** (anomalije sa jačinom < 1) — metode interpolacije se razlikuju između modela

## Kod

```ts
import { simulate, getMatrix, isMatrixModel } from 'chromanopia'

// Poređenje sva tri modela za jednu boju
const models = ['vienot', 'machado', 'brettel'] as const

for (const model of models) {
  const result = simulate('#e63946', 'protanopia', { model })
  console.log(`${model}: ${result}`)

  if (isMatrixModel(model)) {
    const matrix = getMatrix('protanopia', { model })
    console.log('  matrix:', matrix)
  }
}
```
