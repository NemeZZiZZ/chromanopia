# simulate()

Симулирует отдельный цвет так, как его видит человек с определённым нарушением цветового зрения.

## Сигнатура

```ts
function simulate<T extends string | RGB>(
  color: T,
  type: ColorblindType,
  options?: SimulateOptions,
): T
```

**Возвращает тот же тип, что и на входе**: hex-строка на входе — hex-строка на выходе, RGB-объект на входе — RGB-объект на выходе.

## Параметры

| Параметр | Тип | Обязателен | Описание |
|---|---|---|---|
| `color` | `string \| RGB` | Да | Hex-строка (`"#e63946"`, `"e63946"`, `"#F00"`) или RGB-объект `{ r, g, b }` (0–255) |
| `type` | `ColorblindType` | Да | Тип нарушения для симуляции |
| `options.model` | `ColorblindModel` | Нет | `"machado"` (по умолчанию), `"vienot"` или `"brettel"` |
| `options.severity` | `number` | Нет | 0 (нормальное зрение) до 1 (полное нарушение). По умолчанию: `1`. Значения за пределами диапазона обрезаются. |

## Примеры

### Hex-строка

```ts
import { simulate } from 'chromanopia'

simulate('#e63946', 'protanopia')
// → '#886b1f'

simulate('#F00', 'deuteranopia')
// → '#a29100'

simulate('e63946', 'tritanopia')  // # is optional
// → '#eb3636'
```

### RGB-объект

```ts
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 136, g: 107, b: 31 }
```

### С моделью и степенью

```ts
simulate('#e63946', 'protanopia', { model: 'brettel', severity: 0.7 })
// → '#b36234'

simulate('#e63946', 'protanopia', { severity: 0 })
// → '#e63946' (без изменений — severity 0 = нормальное зрение)
```

### Тип `"none"` (без операции)

```ts
simulate('#e63946', 'none')
// → '#e63946' (всегда возвращает входное значение без изменений)
```

## Поведение

- Когда `type` равен `"none"`, возвращает входное значение без изменений (без обработки)
- Когда `severity` равен `0`, возвращает входное значение без изменений
- Внутренне создаёт `Uint8ClampedArray` на 4 пикселя и делегирует обработку `simulateBuffer`
- Для hex-входа парсит через `hexToRgb`, конвертирует обратно через `rgbToHex`
