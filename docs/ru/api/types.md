# Типы и метаданные

## Типы

### ColorblindType

Все поддерживаемые типы нарушений цветового зрения. `"none"` обозначает нормальное зрение (единичное преобразование / без операции).

```ts
type ColorblindType =
  | "none"
  | "protanopia"
  | "protanomaly"
  | "deuteranopia"
  | "deuteranomaly"
  | "tritanopia"
  | "tritanomaly"
  | "achromatopsia"
  | "achromatomaly"
```

### ColorblindModel

Доступные модели симуляции.

```ts
type ColorblindModel = "vienot" | "machado" | "brettel"
```

### SimulateOptions

Опции для `simulate()`, `simulateBuffer()` и `getMatrix()`.

```ts
interface SimulateOptions {
  /** Simulation model. Default: "machado". */
  model?: ColorblindModel
  /** Deficiency severity from 0 (none) to 1 (full). Default: 1. */
  severity?: number
}
```

### RGB

RGB-цвет как объект с целочисленными каналами 0–255.

```ts
interface RGB {
  r: number
  g: number
  b: number
}
```

### Matrix3x3

Цветовая матрица 3×3 как плоский кортеж из 9 элементов в порядке row-major.

```ts
type Matrix3x3 = [
  number, number, number,
  number, number, number,
  number, number, number,
]
```

### DeficiencyInfo

Метаданные типа нарушения.

```ts
interface DeficiencyInfo {
  label: string
  description: string
  /** Representative color preview (hex). */
  color: string
}
```

### ModelInfo

Метаданные модели симуляции.

```ts
interface ModelInfo {
  label: string
  description: string
}
```

## Объекты метаданных

### COLORBLIND_TYPES

`Record<ColorblindType, DeficiencyInfo>` — метаданные для всех 9 типов нарушений (включая `"none"`).

```ts
import { COLORBLIND_TYPES } from 'chromanopia'

COLORBLIND_TYPES.protanopia
// {
//   label: "Protanopia",
//   description: "Red-blind, cannot perceive red light",
//   color: "#9b9a43"
// }
```

Полезно для создания UI-селекторов, легенд и подсказок.

| Тип | Название | Описание | Превью |
|---|---|---|---|
| `none` | Normal Vision | Нет нарушений цветового зрения | `#e63946` |
| `protanopia` | Protanopia | Слепота к красному, не воспринимает красный свет | `#9b9a43` |
| `protanomaly` | Protanomaly | Ослабленное восприятие красного | `#c67344` |
| `deuteranopia` | Deuteranopia | Слепота к зелёному, не воспринимает зелёный свет | `#a5b242` |
| `deuteranomaly` | Deuteranomaly | Ослабленное восприятие зелёного | `#c36644` |
| `tritanopia` | Tritanopia | Слепота к синему, не воспринимает синий свет | `#dd4040` |
| `tritanomaly` | Tritanomaly | Ослабленное восприятие синего | `#e03c44` |
| `achromatopsia` | Achromatopsia | Полная цветовая слепота, видит только оттенки серого | `#6e6e6e` |
| `achromatomaly` | Achromatomaly | Частичная цветовая слепота, сниженное цветовосприятие | `#a5565c` |

### COLORBLIND_MODELS

`Record<ColorblindModel, ModelInfo>` — метаданные для всех 3 моделей симуляции.

```ts
import { COLORBLIND_MODELS } from 'chromanopia'

COLORBLIND_MODELS.machado
// {
//   label: "Machado",
//   description: "Spectral-shift 3×3 matrix (2009), more accurate"
// }
```

| Модель | Название | Описание |
|---|---|---|
| `vienot` | Viénot | Упрощённая матрица 3×3 (1999), быстрая и широко используемая |
| `machado` | Machado | Матрица 3×3 на основе спектрального сдвига (2009), более точная |
| `brettel` | Brettel | Проекция точки смешения в CIE xyY (1997), наиболее точная, медленнее |

## Низкоуровневые утилиты

Экспортируются для продвинутых сценариев (пользовательские конвейеры, шейдеры и т.д.).

### hexToRgb(hex)

```ts
function hexToRgb(hex: string): RGB
```

Парсит `#RGB`, `#RRGGBB`, `RGB` или `RRGGBB` в RGB-объект. Бросает исключение при некорректном вводе.

### rgbToHex(rgb)

```ts
function rgbToHex(rgb: RGB): string
```

Конвертирует RGB-объект в строку `#rrggbb`. Обрезает и округляет значения.

### srgbToLinear(v)

```ts
function srgbToLinear(v: number): number
```

Конвертирует одно значение sRGB (0–255) в линейное [0,1]. Использует предвычисленную LUT для скорости.

### linearToSrgb(c)

```ts
function linearToSrgb(c: number): number
```

Конвертирует линейное значение [0,1] в sRGB (0–255). Обрезает до допустимого диапазона.

### gamutMap(r, g, b)

```ts
function gamutMap(r: number, g: number, b: number): [number, number, number]
```

Отображает линейную RGB-тройку за пределами гамута в [0,1] путём десатурации к яркости Rec. 709. Возвращает входное значение без изменений, если оно уже в гамуте.
