# Бенчмарк

Запустите тест производительности `simulateBuffer()` в реальном времени в вашем браузере. Измеряет пропускную способность при разных разрешениях и для всех трёх моделей симуляции.

<script setup>
import Benchmark from '../../.vitepress/theme/components/Benchmark.vue'
</script>

<ClientOnly>
  <Benchmark />
</ClientOnly>

## Методология

Бенчмарк:

1. **Прогревает** JIT 50 итерациями на маленьком буфере
2. Для каждой комбинации разрешение × модель:
   - Создаёт случайный RGBA-буфер пикселей
   - Выполняет достаточно итераций для накопления ~500мс данных
   - Выводит **медианное** время (устойчиво к паузам сборщика мусора)
3. Показывает **время на кадр** и **пропускную способность** в мегапикселях в секунду

## Что влияет на производительность

| Фактор | Влияние |
|---|---|
| **Модель** | Brettel ~3-5× медленнее Viénot/Machado (попиксельная проекция XYZ) |
| **Разрешение** | Линейное масштабирование — 4K ~4× медленнее Full HD |
| **CPU** | V8 хорошо оптимизирует горячий цикл; Apple Silicon обычно ~2× быстрее x86 |
| **Браузер** | V8 (Chrome/Edge) и SpiderMonkey (Firefox) показывают схожие результаты; JSC (Safari) варьируется |

## Типичные результаты

*Измерено на Apple M1, Chrome 125:*

| Разрешение | Viénot | Machado | Brettel |
|---|---|---|---|
| VGA (640×480) | ~1мс | ~1.5мс | ~6мс |
| Full HD (1920×1080) | ~8мс | ~10мс | ~40мс |
| 4K (3840×2160) | ~35мс | ~42мс | ~165мс |

Для приложений реального времени (60fps = бюджет 16.7мс) Viénot и Machado справляются с Full HD без проблем. Для 4K рекомендуется использовать [Web Worker](/ru/guide/recipes#browser-offscreencanvas-web-worker) или [WebGL-шейдер](/ru/guide/recipes#webgl-uniform-шейдера).

## Код

```ts
// Simple benchmark
const pixels = new Uint8ClampedArray(1920 * 1080 * 4)
// ... fill with image data ...

const start = performance.now()
simulateBuffer(pixels, 'protanopia', { model: 'machado' })
const elapsed = performance.now() - start

console.log(`${elapsed.toFixed(1)}ms`)
```
