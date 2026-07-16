# Benchmark

Pokrenite test performansi u realnom vremenu za `simulateBuffer()` u vašem pregledaču. Meri propusnost za različite rezolucije i sva tri modela simulacije.

<script setup>
import Benchmark from '../../.vitepress/theme/components/Benchmark.vue'
</script>

<ClientOnly>
  <Benchmark />
</ClientOnly>

## Metodologija

Benchmark:

1. **Zagreva** JIT sa 50 iteracija na malom baferu
2. Za svaku kombinaciju rezolucije × model:
   - Kreira nasumični RGBA bafer piksela
   - Pokreće dovoljno iteracija da akumulira ~500ms podataka
   - Prijavjuje **medijanu** vremena (robusno protiv GC pauza)
3. Prikazuje **vreme po kadru** i **propusnost** u megapikselima u sekundi

## Šta utiče na performanse

| Faktor | Uticaj |
|---|---|
| **Model** | Brettel je ~1.2× sporiji od Viénot/Machado (XYZ projekcija po pikselu) |
| **Rezolucija** | Linearno skaliranje — 4K je ~4× sporiji od Full HD |
| **CPU** | V8 dobro optimizuje kritičnu petlju; Apple Silicon je tipično 2× brži od x86 |
| **Pregledač** | V8 (Chrome/Edge) i SpiderMonkey (Firefox) rade slično; JSC (Safari) varira |

## Tipični rezultati

*Jedna referentna tačka — Apple M1, Node 22, zagrejan JIT, medijana preko 40 iteracija. Vaši brojevi će zavisiti od hardvera, pregledača i toga koliko je JIT zagrejan. Pokrenite gore benchmark za brojeve na vašoj mašini.*

| Rezolucija | Pikseli | Viénot | Machado | Brettel |
|---|---|---|---|---|
| VGA (640×480) | 0.3M | ~80ms | ~85ms | ~100ms |
| Full HD (1920×1080) | 2.1M | ~590ms | ~560ms | ~660ms |
| 4K (3840×2160) | 8.3M | ~2.4s | ~2.2s | ~2.6s |

Propusnost je otprilike nezavisna od rezolucije i iznosi **~3.5 Mpix/s** za matrične modele (Viénot, Machado) i **~3.2 Mpix/s** za Brettel.

::: warning
Jedan poziv `simulateBuffer()` se **ne** uklapa u kadar od 60fps (16.7ms) pri bilo kojoj rezoluciji iznad nekoliko stotina hiljada piksela — JavaScript jednostavno ne može da obradi milione piksela toliko brzo. Za korišćenje u realnom vremenu:
- Prebacite obradu u [Web Worker](/sr/guide/recipes#pregledač-offscreencanvas-web-worker) kako ne bi blokirala glavnu nit
- Koristite [WebGL šejder](/sr/guide/recipes#webgl-šejder-uniform) za GPU-ubrzanu obradu (10–100× brže)
- Za jednokratne transformacije (npr. obrada otpremljene slike jednom), gore navedena vremena su u redu — korisnik ~260ms doživljava kao skoro trenutno
:::

## Kod

```ts
// Jednostavan benchmark
const pixels = new Uint8ClampedArray(1920 * 1080 * 4)
// ... popunite podacima slike ...

const start = performance.now()
simulateBuffer(pixels, 'protanopia', { model: 'machado' })
const elapsed = performance.now() - start

console.log(`${elapsed.toFixed(1)}ms`)
```
