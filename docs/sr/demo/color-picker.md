# Birač boja

Izaberite bilo koju boju i pogledajte kako izgleda pod svih 8 tipova poremećaja kolornog vida. Promenite model i jačinu da istražite razlike.

<script setup>
import ColorPicker from '../../.vitepress/theme/components/ColorPicker.vue'
</script>

<ClientOnly>
  <ColorPicker />
</ClientOnly>

## Šta vidite

Svaka paleta prikazuje rezultat `simulate(color, type, { model, severity })`:

- **Normalan vid** — originalna boja, nepromenjena
- **Protanopija / Protanomalija** — smanjen ili odsutan odgovor L-čepića (crveni)
- **Deuteranopija / Deuteranomalija** — smanjen ili odsutan odgovor M-čepića (zeleni)
- **Tritanopija / Tritanomalija** — smanjen ili odsutan odgovor S-čepića (plavi)
- **Ahromatopsija / Ahromatomalija** — potpuni ili parcijalni gubitak funkcije svih čepića

## Isprobajte ove boje

| Boja | Zašto je interesantna |
|---|---|
| `#e63946` (crvena) | Dramatično se pomera za protan/deutan tipove |
| `#2a9d8f` (tirkizna) | Teško se razlikuje od sive u deuteranopiji |
| `#f4a261` (narandžasta) | Meša se sa žutom kod protan poremećaja |
| `#6a4c93` (ljubičasta) | Meša se sa plavom kod deutan/protan tipova |
| `#00ff00` (čista zelena) | Skoro nevidljiva u deuteranopiji |

## Kod

```ts
import { simulate } from 'chromanopia'

// Kod iza svake palete:
const result = simulate('#e63946', 'protanopia', {
  model: 'machado',
  severity: 1,
})
// → '#6c6545'
```
