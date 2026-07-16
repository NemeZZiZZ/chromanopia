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

`simulateBuffer` обрабатывает пиксели на месте без аллокаций внутри горячего цикла. В прогретом JavaScript-движке пропускная способность примерно такая:

| Размер изображения | Machado | Brettel |
|---|---|---|
| 640×480 (VGA) | ~85ms | ~100ms |
| 1920×1080 (FHD) | ~560ms | ~660ms |
| 3840×2160 (4K) | ~2.2s | ~2.6s |

*Одна контрольная точка — Apple M1, Node 22. Результаты в вашем браузере будут отличаться. Обработка типичной фотографии (несколько мегапикселей) ощущается почти мгновенно; для больших изображений или использования в реальном времени рассмотрите [Web Worker](/ru/guide/recipes#browser-offscreencanvas-web-worker) или [WebGL shader](/ru/guide/recipes#webgl-uniform-шейдера).*

## Советы

- **Перетащите** любое изображение с рабочего стола
- Попробуйте **регулировать степень** от 0 до 1, чтобы увидеть постепенное изменение
- Сравните **Machado и Brettel** — различия наиболее заметны для тританопии
- Чисто **красные/зелёные** изображения показывают наиболее драматические различия для протан/дейтан типов
