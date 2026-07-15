# Benchmark

Ejecuta una prueba de rendimiento en tiempo real de `simulateBuffer()` en tu navegador. Mide el rendimiento a través de diferentes resoluciones y los tres modelos de simulación.

<script setup>
import Benchmark from '../../.vitepress/theme/components/Benchmark.vue'
</script>

<ClientOnly>
  <Benchmark />
</ClientOnly>

## Metodología

El benchmark:

1. **Calienta** el JIT con 50 iteraciones en un búfer pequeño
2. Para cada combinación de resolución × modelo:
   - Crea un búfer de píxeles RGBA aleatorio
   - Ejecuta suficientes iteraciones para acumular ~500ms de datos
   - Reporta el tiempo **mediano** (robusto contra pausas del GC)
3. Muestra **tiempo por frame** y **rendimiento** en megapíxeles por segundo

## Qué afecta el rendimiento

| Factor | Impacto |
|---|---|
| **Modelo** | Brettel es ~3-5× más lento que Viénot/Machado (proyección XYZ por píxel) |
| **Resolución** | Escalado lineal — 4K es ~4× más lento que Full HD |
| **CPU** | V8 optimiza bien el bucle principal; Apple Silicon es típicamente 2× más rápido que x86 |
| **Navegador** | V8 (Chrome/Edge) y SpiderMonkey (Firefox) rinden de forma similar; JSC (Safari) varía |

## Resultados típicos

*Un punto de referencia — Apple M1, Node 22, JIT caliente, mediana sobre 40 iteraciones. Tus números variarán según el hardware, el navegador y lo caliente que esté el JIT. Ejecuta el benchmark de arriba para obtener los números en tu propia máquina.*

| Resolución | Píxeles | Viénot | Machado | Brettel |
|---|---|---|---|---|
| VGA (640×480) | 0.3M | ~60ms | ~40ms | ~80ms |
| Full HD (1920×1080) | 2.1M | ~420ms | ~260ms | ~520ms |
| 4K (3840×2160) | 8.3M | ~1.7s | ~1.0s | ~2.1s |

El rendimiento es aproximadamente independiente de la resolución: **Machado ≈ 8 Mpix/s**, **Viénot ≈ 5 Mpix/s**, **Brettel ≈ 4 Mpix/s** en estado estable.

::: warning
Una sola llamada a `simulateBuffer()` **no** cabe en un frame de 60fps (16.7ms) a ninguna resolución por encima de unos cientos de miles de píxeles — JavaScript simplemente no puede procesar millones de píxeles tan rápido. Para uso en tiempo real:
- Mueve el trabajo a un [Web Worker](/es/guide/recipes#navegador-offscreencanvas-web-worker) para que no bloquee el hilo principal
- Usa un [shader WebGL](/es/guide/recipes#webgl-uniforme-de-shader) para procesamiento acelerado por GPU (10–100× más rápido)
- Para transformaciones de una sola vez (p. ej. procesar una imagen subida una vez), los tiempos de arriba están bien — el usuario percibe ~260ms como casi instantáneo
:::

## Código

```ts
// Benchmark simple
const pixels = new Uint8ClampedArray(1920 * 1080 * 4)
// ... llenar con datos de imagen ...

const start = performance.now()
simulateBuffer(pixels, 'protanopia', { model: 'machado' })
const elapsed = performance.now() - start

console.log(`${elapsed.toFixed(1)}ms`)
```
