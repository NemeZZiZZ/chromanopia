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
| **Model** | Brettel je ~3-5× sporiji od Viénot/Machado (XYZ projekcija po pikselu) |
| **Rezolucija** | Linearno skaliranje — 4K je ~4× sporiji od Full HD |
| **CPU** | V8 dobro optimizuje kritičnu petlju; Apple Silicon je tipično 2× brži od x86 |
| **Pregledač** | V8 (Chrome/Edge) i SpiderMonkey (Firefox) rade slično; JSC (Safari) varira |

## Tipični rezultati

*Mereno na Apple M1, Chrome 125:*

| Rezolucija | Viénot | Machado | Brettel |
|---|---|---|---|
| VGA (640×480) | ~1ms | ~1.5ms | ~6ms |
| Full HD (1920×1080) | ~8ms | ~10ms | ~40ms |
| 4K (3840×2160) | ~35ms | ~42ms | ~165ms |

Za aplikacije u realnom vremenu (60fps = 16.7ms budžet), Viénot i Machado obrađuju do Full HD bez problema. Za 4K, razmislite o korišćenju [Web Worker-a](/sr/guide/recipes#pregledač-offscreencanvas-web-worker) ili [WebGL šejdera](/sr/guide/recipes#webgl-šejder-uniform).

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
