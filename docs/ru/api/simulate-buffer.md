# simulateBuffer()

Применяет симуляцию дальтонизма к RGBA-буферу пикселей **на месте (in-place)**. Это основная функция для обработки изображений.

## Сигнатура

```ts
function simulateBuffer(
  pixels: Uint8Array | Uint8ClampedArray,
  type: ColorblindType,
  options?: SimulateOptions,
): void
```

**Мутирует входной буфер.** Если нужно сохранить оригинал, сначала клонируйте его.

## Параметры

| Параметр | Тип | Обязателен | Описание |
|---|---|---|---|
| `pixels` | `Uint8Array \| Uint8ClampedArray` | Да | RGBA-буфер пикселей. Длина должна быть кратна 4. |
| `type` | `ColorblindType` | Да | Тип нарушения для симуляции |
| `options.model` | `ColorblindModel` | Нет | `"machado"` (по умолчанию), `"vienot"` или `"brettel"` |
| `options.severity` | `number` | Нет | 0–1, по умолчанию `1`. Обрезается до допустимого диапазона. |

## Примеры

### Canvas ImageData

```ts
import { simulateBuffer } from 'chromanopia'

const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

### Сохранение оригинала

```ts
const original = ctx.getImageData(0, 0, canvas.width, canvas.height)
const copy = new ImageData(
  new Uint8ClampedArray(original.data),
  original.width,
  original.height,
)

simulateBuffer(copy.data, 'deuteranopia')
ctx.putImageData(copy, 0, 0)
```

### Node.js Buffer (Sharp)

```ts
const { data, info } = await sharp('photo.jpg')
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Buffer extends Uint8Array — works directly
simulateBuffer(data, 'tritanopia', { model: 'brettel' })
```

### Со степенью

```ts
simulateBuffer(pixels, 'protanomaly', { severity: 0.5 })
```

## Поведение

- **Альфа-канал сохраняется** — модифицируются только байты R, G, B (каждый 4-й байт пропускается)
- Когда `type` равен `"none"` или `severity` равен `0`, возвращается немедленно (без обработки)
- Для матричных моделей (Viénot, Machado): sRGB → линейное → умножение на матрицу → гамут-маппинг → sRGB
- Для Brettel: sRGB → линейное → XYZ → проекция xyY → XYZ → линейное → sRGB
- Для Brettel с ахроматопсией/ахроматомалией: откат на матрицу Machado

## Производительность

Функция обрабатывает по 4 байта за раз без аллокаций внутри горячего цикла. Производительность масштабируется линейно с количеством пикселей. В прогретом JavaScript-движке ожидается примерно:

| Разрешение | Пиксели | Viénot | Machado | Brettel |
|---|---|---|---|---|
| 640×480 | 0.3M | ~60ms | ~40ms | ~80ms |
| 1920×1080 | 2.1M | ~420ms | ~260ms | ~520ms |
| 3840×2160 | 8.3M | ~1.7s | ~1.0s | ~2.1s |

*Одна контрольная точка — Apple M1, Node 22, прогретый JIT. Brettel в ~1.5–2× медленнее Machado из-за попиксельной XYZ-проекции; Viénot и Machado используют один и тот же путь умножения на матрицу, но меньшие матрицы Viénot слегка медленнее в диспетчеризации, чем инлайнящийся в JIT путь Machado на этом оборудовании.*

::: tip
Это процессорные/JavaScript-тайминги. Для обработки изображений в реальном времени [WebGL shader](/ru/guide/recipes#webgl-uniform-шейдера) выполняет ту же матрицу на GPU с пропускной способностью в 10–100× выше. Указанные выше числа нормальны для одноразовых преобразований (например, однократная обработка загруженного изображения).
:::
