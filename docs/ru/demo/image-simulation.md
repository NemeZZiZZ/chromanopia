# Симуляция изображений

Загрузите изображение или используйте встроенный пример, чтобы увидеть, как оно выглядит при различных типах нарушений цветового зрения. Вся обработка происходит в вашем браузере через `simulateBuffer()`.

<script setup>
import ImageSimulator from '../../.vitepress/theme/components/ImageSimulator.vue'
</script>

<ClientOnly>
  <ImageSimulator />
</ClientOnly>

## Как это работает

Демо использует Canvas API для обработки изображений:

```ts
import { simulateBuffer } from 'chromanopia'

// Get pixel data from canvas
const imageData = ctx.getImageData(0, 0, width, height)

// Simulate in-place (mutates the buffer)
simulateBuffer(imageData.data, 'protanopia', {
  model: 'machado',
  severity: 1,
})

// Put the modified data back
ctx.putImageData(imageData, 0, 0)
```

## Производительность

`simulateBuffer` обрабатывает пиксели на месте без аллокаций внутри горячего цикла:

| Размер изображения | Machado/Viénot | Brettel |
|---|---|---|
| 640×480 (VGA) | ~2мс | ~8мс |
| 1920×1080 (FHD) | ~12мс | ~45мс |
| 3840×2160 (4K) | ~50мс | ~180мс |

Для больших изображений рекомендуется использовать [Web Worker](/ru/guide/recipes#browser-offscreencanvas-web-worker), чтобы не блокировать основной поток.

## Советы

- **Перетащите** любое изображение с рабочего стола
- Попробуйте **регулировать степень** от 0 до 1, чтобы увидеть постепенное изменение
- Сравните **Machado и Brettel** — различия наиболее заметны для тританопии
- Чисто **красные/зелёные** изображения показывают наиболее драматические различия для протан/дейтан типов
