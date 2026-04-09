# Modeli simulacije

chromanopia implementira tri recenzirana modela simulacije. Svaki na različit način balansira preciznost i brzinu.

## Pregled

| Model | Godina | Metod | Brzina | Preciznost | Slučaj upotrebe |
|---|---|---|---|---|---|
| **Viénot** | 1999 | 3×3 matrica, nenegativna | Najbrži | Dobra | UI u realnom vremenu, brzi pregled |
| **Machado** | 2009 | 3×3 matrica spektralnog pomaka | Brz | Bolja | Podrazumevani izbor, najbolji balans |
| **Brettel** | 1997 | CIE xyY projekcija po pikselu | ~3-5× sporiji | Najbolja | Istraživanje, validacija, referenca |

## Viénot (1999)

**Rad:** Viénot, Brettel & Mollon — *Digital video colourmaps for checking the legibility of displays by dichromats*

- Sve vrednosti matrice su nenegativne (≥ 0)
- Zbir redova jednak je 1.0 — svetlost je savršeno očuvana
- Najbrže izračunavanje: jedno množenje matricom po pikselu
- Nešto manja preciznost za granične slučajeve i parcijalne poremećaje
- Najbolje za: aplikacije u realnom vremenu, šejder pipeline-ove sa ograničenim budžetom

```ts
simulate('#e63946', 'protanopia', { model: 'vienot' })
```

## Machado (2009)

**Rad:** Machado, Oliveira & Fernandes — *A physiologically-based model for simulation of color vision deficiency*

- Koristi spektralni pomak za modelovanje promena u odgovoru čepića
- Vrednosti matrice mogu biti negativne i > 1 (ekstrapolacija)
- Fizički precizniji od Viénot-a
- Podrazumevani model u chromanopia-i
- Najbolje za: većinu slučajeva upotrebe, testiranje pristupačnosti, alate za dizajn

```ts
simulate('#e63946', 'protanopia', { model: 'machado' })
// Ovo je podrazumevano — ekvivalentno sa:
simulate('#e63946', 'protanopia')
```

## Brettel (1997)

**Rad:** Brettel, Viénot & Mollon — *Computerized simulation of color appearance for dichromats*

- Projektuje svaki piksel na liniju konfuzije u CIE xyY prostoru boja
- Nije jedna matrica — svaki piksel zahteva XYZ konverziju, projekciju i inverziju
- Najprecizniji model, posebno za tritanopiju
- ~3-5× sporiji od matričnih modela
- Prelazi na Machado matrice za štapićastu monohromatopsiju (ahromatopsija / ahromatomalija)
- Najbolje za: istraživanje, referentni izlaz, validaciju sa drugim implementacijama

```ts
simulate('#e63946', 'protanopia', { model: 'brettel' })
```

::: tip
Koristite `isMatrixModel(model)` da proverite da li model vraća 3×3 matricu. Ovo je korisno pri odlučivanju između Sharp `recomb` (matrični put) i obrade sirovog bafera (Brettel).
:::

## Varijante anomalija

Svaki poremećaj čepića ima parcijalnu varijantu (anomaliju):

| Potpuni poremećaj | Parcijalna varijanta | Pogođeni čepić |
|---|---|---|
| Protanopija | Protanomalija | L (crveni) |
| Deuteranopija | Deuteranomalija | M (zeleni) |
| Tritanopija | Tritanomalija | S (plavi) |
| Ahromatopsija | Ahromatomalija | Svi čepići (samo štapići) |

Za matrične modele, simulacija anomalije koristi interpolaciju između jedinične matrice i matrice potpunog poremećaja.

Za Brettel, anomalije koriste ponderisanu mešavinu (faktor 1.75/2.75) između originalne boje i simulirane dihromat boje.

## Štapićasta monohromatopsija

Ahromatopsija (potpuna sleplost za boje) i ahromatomalija (parcijalna) nisu poremećaji specifični za čepiće — nastaju usled potpuno odsutne ili smanjene funkcije čepića. Koriste Rec. 709 koeficijente svetlosti:

```
R' = 0.2126·R + 0.7152·G + 0.0722·B
G' = 0.2126·R + 0.7152·G + 0.0722·B
B' = 0.2126·R + 0.7152·G + 0.0722·B
```

Ova matrica je zajednička za sva tri modela jer nije specifična za model.

<script setup>
import ModelComparison from '../../.vitepress/theme/components/ModelComparison.vue'
</script>

## Interaktivno poređenje

Isprobajte različite boje i tipove da vidite kako se svaki model razlikuje:

<ClientOnly>
  <ModelComparison />
</ClientOnly>
