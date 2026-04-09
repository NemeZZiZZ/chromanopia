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

*Medido en Apple M1, Chrome 125:*

| Resolución | Viénot | Machado | Brettel |
|---|---|---|---|
| VGA (640×480) | ~1ms | ~1.5ms | ~6ms |
| Full HD (1920×1080) | ~8ms | ~10ms | ~40ms |
| 4K (3840×2160) | ~35ms | ~42ms | ~165ms |

Para aplicaciones en tiempo real (60fps = presupuesto de 16.7ms), Viénot y Machado manejan hasta Full HD cómodamente. Para 4K, considera usar un [Web Worker](/es/guide/recipes#navegador-offscreencanvas-web-worker) o un [shader WebGL](/es/guide/recipes#webgl-uniforme-de-shader).

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
