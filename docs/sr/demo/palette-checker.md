# Provera palete

Proverite da li vaša paleta boja ostaje razlučiva pod svim tipovima poremećaja kolornog vida. Unesite svoje boje, izaberite predefinisani skup i pogledajte minimalni odnos kontrasta između bilo kog para.

<script setup>
import PaletteChecker from '../../.vitepress/theme/components/PaletteChecker.vue'
</script>

<ClientOnly>
  <PaletteChecker />
</ClientOnly>

## Kako čitati rezultate

Svaki red prikazuje vašu paletu transformisanu određenim tipom poremećaja:

- **Zelena oznaka (≥ 3:1)** — boje se lako razlikuju
- **Crvena oznaka (< 2:1)** — boje se mogu pomešati; razmislite o prilagođavanju palete

Odnos je **minimalni kontrast u paru** između bilo koje dve boje u redu. Odnos 1:1 znači da su dve boje identične.

## Saveti za dizajn

### Za grafikone i vizuelizaciju podataka

- Koristite **najmanje 3:1 kontrast** između susednih serija podataka
- Preferirajte **varijaciju svetlosti** (svetlo naspram tamnog) umesto čiste varijacije nijanse
- Dodajte **obrasce, oznake ili ikone** kao sekundarni način razlikovanja
- Testirajte paletu prvo na **deuteranomaliju** (najčešća, ~5% muškaraca)

### Za statusne boje korisničkog interfejsa

- Ne oslanjajte se samo na crvenu/zelenu za uspeh/grešku — dodajte ikone ili tekst
- Koristite **plavu + narandžastu** umesto **zelene + crvene** za bolji CVD kontrast
- Obezbedite da se sve statusne boje razlikuju po **svetlini**, ne samo po nijansi

### Bezbedne kombinacije boja

Ovi parovi ostaju razlučivi kod većine CVD tipova:

| Par | Zašto funkcioniše |
|---|---|
| Plava + Narandžasta | Visok kontrast svetlosti, različite linije konfuzije |
| Plava + Žuta | S-čepić naspram L+M, problematično samo za tritanopiju |
| Tamno plava + Svetlo roze | Razlika u svetlosti preživljava sve tipove |
| Crna + bilo koja svetla boja | Ahromatsko + hromatsko uvek funkcioniše |

## Kod

```ts
import { simulate } from 'chromanopia'

const palette = ['#e63946', '#f4a261', '#2a9d8f', '#264653']
const type = 'deuteranopia'

const simulated = palette.map(color => simulate(color, type))
// → ['#988940', '#cebc61', '#858890', '#384053']
// Provera: da li su neke od ovih previše slične?
```
