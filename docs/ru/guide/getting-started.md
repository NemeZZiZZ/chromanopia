# Начало работы

## Установка

::: code-group
```bash [npm]
npm install chromanopia
```
```bash [pnpm]
pnpm add chromanopia
```
```bash [yarn]
yarn add chromanopia
```
:::

## Быстрый старт

### Симуляция одного цвета

```ts
import { simulate } from 'chromanopia'

// Hex-строка на входе → hex-строка на выходе
simulate('#e63946', 'protanopia')
// → '#8b8b2b'

// RGB-объект на входе → RGB-объект на выходе
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 139, g: 139, b: 43 }
```

### Выбор модели и степени

```ts
simulate('#e63946', 'protanopia', {
  model: 'brettel',   // 'machado' (по умолчанию), 'vienot' или 'brettel'
  severity: 0.7,       // 0 (нормальное зрение) до 1 (полное нарушение)
})
```

### Обработка изображения (Canvas)

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'deuteranopia')
ctx.putImageData(imageData, 0, 0)
```

### Получение матрицы (для WebGL / Sharp)

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('tritanopia', { model: 'machado', severity: 0.5 })
// → [0.975, 0.025, 0, 0, 0.71667, 0.28333, 0, 0.2375, 0.7625]
```

## Как это работает

Конвейер симуляции:

1. **Вход** — hex-строка или RGB-объект (0–255 на канал)
2. **sRGB → Линейное** — удаление гамма-кривой с помощью предвычисленной LUT на 256 записей
3. **Симуляция** — применение трансформации выбранной модели в линейном свете
4. **Гамут-маппинг** — десатурация цветов за пределами гамута к их яркости (Rec. 709)
5. **Линейное → sRGB** — повторное применение гамма-кривой
6. **Выход** — тот же формат, что и на входе

Это обеспечивает физически корректные результаты. Многие другие библиотеки пропускают шаги 2, 4 и 5, что приводит к визуально некорректным результатам, особенно для насыщенных цветов.

## Что дальше?

- Попробуйте [интерактивные демо](/ru/demo/color-picker), чтобы увидеть всё в действии
- Узнайте о [трёх моделях](/ru/guide/models) и когда использовать каждую
- Посмотрите [рецепты](/ru/guide/recipes) для интеграции с Canvas, Sharp и WebGL
- Изучите полный [справочник API](/ru/api/simulate)
