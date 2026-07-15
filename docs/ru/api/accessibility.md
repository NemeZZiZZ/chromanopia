# Вспомогательные функции доступности

Утилиты доступности, построенные поверх ядра симуляции: контрастное соотношение WCAG, перцептивное цветовое расстояние, относительная яркость и проверка «различимы ли два цвета при определённом нарушении».

Как правило, именно ради этого и обращаются к библиотеке симуляции нарушений цветового зрения: не только *показать*, что видит человек с дальтонизмом, но и *проверить*, пригодна ли ваша палитра к использованию.

---

## contrastRatio()

Контрастное соотношение WCAG 2.x между двумя цветами.

```ts
function contrastRatio(
  a: string | RGB,
  b: string | RGB,
): number
```

Возвращает значение в диапазоне **[1, 21]**, где 1 — идентичные цвета, а 21 — чёрный против белого. Принимает любой формат цвета, который понимает [`toRgb()`](./color-conversion): hex-строки, `rgb()`/`rgba()`, RGB или HSL-объекты.

### Параметры

| Параметр | Тип | Обязателен | Описание |
|---|---|---|---|
| `a` | `string \| RGB` | Да | Первый цвет (hex, `rgb()`, RGB или HSL-объект) |
| `b` | `string \| RGB` | Да | Второй цвет (те же форматы, что и для `a`) |

### Примеры

```ts
import { contrastRatio } from 'chromanopia'

contrastRatio('#ffffff', '#000000') // 21
contrastRatio('#ffffff', '#767676') // ≈ 4.54 (passes WCAG AA for body text)
contrastRatio('#777777', '#ffffff') // ≈ 4.48 (order doesn't matter)
contrastRatio('#e63946', '#e63946') // 1 (identical)
```

### Пороговые значения WCAG

| Соотношение | Уровень | Сценарий использования |
|---|---|---|
| ≥ 7 | AAA | Основной текст < 18 пт |
| ≥ 4.5 | AA | Основной текст < 18 пт |
| ≥ 3 | AA | Крупный текст ≥ 18 пт или компоненты UI |

---

## colorDistance()

Евклидово расстояние в sRGB [0,255]³ между двумя цветами. Вычисляется быстро и монотонно зависит от перцептивной разницы; используйте для быстрой сортировки, а не для перцептивно однородного ΔE.

```ts
function colorDistance(
  a: string | RGB,
  b: string | RGB,
): number
```

### Примеры

```ts
import { colorDistance } from 'chromanopia'

colorDistance('#ff0000', '#00ff00') // ≈ 360.6 (red vs green)
colorDistance('#e63946', '#e63946') // 0 (identical)
colorDistance('#000000', '#010101') // ≈ 1.73
```

---

## isDistinguishable()

Возвращает `true`, если два цвета остаются различимыми после симуляции определённого нарушения — т.е. их sRGB-расстояние после симуляции достигает `threshold` (порога).

```ts
function isDistinguishable(
  a: string | RGB,
  b: string | RGB,
  type: ColorblindType,
  options?: SimulateOptions,
  threshold?: number, // default 30
): boolean
```

### Параметры

| Параметр | Тип | Обязателен | Описание |
|---|---|---|---|
| `a` | `string \| RGB` | Да | Первый цвет |
| `b` | `string \| RGB` | Да | Второй цвет |
| `type` | `ColorblindType` | Да | Нарушение для симуляции. Используйте `"none"` для расстояния при нормальном зрении. |
| `options` | `SimulateOptions` | Нет | Модель/степень симуляции (по умолчанию Machado, степень 1) |
| `threshold` | `number` | Нет | Минимальное евклидово sRGB-расстояние, при котором цвета считаются различимыми. По умолчанию `30`. |

### Примеры

```ts
import { isDistinguishable } from 'chromanopia'

// Orange #f77f00 and green #1d9c1d look clearly different to normal vision...
isDistinguishable('#f77f00', '#1d9c1d', 'none')       // true
// ...but collapse to the same hue for a protanope:
isDistinguishable('#f77f00', '#1d9c1d', 'protanopia') // false

// Tune the threshold for your use case (lower = stricter):
isDistinguishable('#aabbcc', '#112233', 'deuteranopia', {}, 50) // stricter
```

### Выбор порога

Значение по умолчанию `30` соответствует чётко видимой разнице на sRGB-дисплее. Для критичных элементов UI (индикаторы статуса, ряды диаграмм, которые нельзя путать) используйте более высокий порог (50–80). Для определения «примерно одного цвета» — снизьте порог.

---

## relativeLuminance()

Относительная яркость sRGB-цвета согласно WCAG 2.x / Rec. 709. Возвращает значение в диапазоне [0, 1], где 0 — чёрный, а 1 — белый. Использует ту же линеаризацию sRGB, что и остальная часть библиотеки.

```ts
function relativeLuminance(
  r: number,
  g: number,
  b: number,
): number
```

### Параметры

| Параметр | Тип | Обязателен | Описание |
|---|---|---|---|
| `r` | `number` | Да | Красный канал, 0–255 |
| `g` | `number` | Да | Зелёный канал, 0–255 |
| `b` | `number` | Да | Синий канал, 0–255 |

### Примеры

```ts
import { relativeLuminance } from 'chromanopia'

relativeLuminance(0, 0, 0)       // 0
relativeLuminance(255, 255, 255) // 1
relativeLuminance(255, 0, 0)     // 0.2126 (red)
relativeLuminance(0, 255, 0)     // 0.7152 (green — highest weight)
relativeLuminance(0, 0, 255)     // 0.0722 (blue)
```

`contrastRatio()` реализована на основе этой функции.
