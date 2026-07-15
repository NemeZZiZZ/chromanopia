# 颜色转换

颜色解析与转换工具：hex 解析（3/4/6/8 位）、`rgb()`/`rgba()` CSS 字符串、HSL 往返转换，以及通用的 `toRgb()` 强制转换器。

这些工具既可直接使用，也因高层 API（[`simulate()`](./simulate)、[`simulatePalette()`](./simulate-palette)、[无障碍辅助工具](./accessibility)）通过 `toRgb()` 路由从而接受任意颜色形式而被导出。

---

## toRgb()

将任意受支持形式的颜色强制转换为 RGB 对象。这是 API 其余部分使用的通用入口。

```ts
function toRgb(color: string | RGB | HSL): RGB
```

接受 hex 字符串（`"#e63946"`、`"F00"`、`"#RRGGBBAA"`）、CSS `rgb()`/`rgba()` 字符串、HSL 对象，或 RGB 对象（返回一个新的副本）。

### 示例

```ts
import { toRgb } from 'chromanopia'

toRgb('#ff0000')                  // { r: 255, g: 0, b: 0 }
toRgb('rgb(230 57 70)')           // { r: 230, g: 57, b: 70 }
toRgb({ h: 120, s: 1, l: 0.5 })   // { r: 0, g: 255, b: 0 }
toRgb({ r: 10, g: 20, b: 30 })    // { r: 10, g: 20, b: 30 }（副本，非同一引用）
```

::: tip
RGB 对象以副本形式返回，永远不会是相同的引用，因此修改结果是安全的。
:::

---

## parseCssColor()

将 CSS 颜色字符串解析为 RGB 对象。比 `toRgb()` 更底层 —— 只接受字符串。

```ts
function parseCssColor(css: string): RGB
```

支持 hex（3/4/6/8 位，带或不带 `#`）以及 `rgb()` / `rgba()`（既支持旧版逗号语法 `rgba(230, 57, 70, 0.5)`，也支持现代空格语法 `rgb(230 57 70 / 0.5)`）。支持百分比通道（`rgb(100%, 0%, 0%)`）。alpha 分量会被解析但不返回（`RGB` 没有 alpha）。

### 示例

```ts
import { parseCssColor } from 'chromanopia'

parseCssColor('#e63946ff')              // { r: 230, g: 57, b: 70 }（8 位，alpha 丢弃）
parseCssColor('rgb(230, 57, 70)')       // { r: 230, g: 57, b: 70 }
parseCssColor('rgba(230 57 70 / 0.5)')  // { r: 230, g: 57, b: 70 }
parseCssColor('rgb(100%, 0%, 0%)')      // { r: 255, g: 0, b: 0 }
```

对于不支持的格式会抛出异常（不支持命名颜色如 `"red"`、`hsl()` 字符串等 —— 如需使用 HSL，请先通过 `hslToRgb()` 转换）。

---

## hexToRgb()

将 hex 颜色字符串解析为 RGB 对象。

```ts
function hexToRgb(hex: string): RGB
```

接受 `#RGB`、`#RGBA`、`#RRGGBB`、`#RRGGBBAA`（带或不带前导 `#`）。alpha 分量会被解析但丢弃。

### 示例

```ts
import { hexToRgb } from 'chromanopia'

hexToRgb('#e63946')   // { r: 230, g: 57, b: 70 }
hexToRgb('e63946')    // { r: 230, g: 57, b: 70 }（# 可选）
hexToRgb('#F00')      // { r: 255, g: 0, b: 0 }   （3 位）
hexToRgb('#e63946ff') // { r: 230, g: 57, b: 70 }（8 位，alpha 丢弃）
```

输入无效时抛出 `Error` —— 会对整个字符串进行校验，因此像 `#12gggg` 这样部分有效的字符串会被拒绝（不会进行静默的 `parseInt` 前缀解析）。

---

## rgbToHex()

将 RGB 对象转换为带 `#` 前缀的 6 位 hex 字符串。

```ts
function rgbToHex(rgb: RGB): string
```

通道值会被钳制到 [0, 255] 并四舍五入。

### 示例

```ts
import { rgbToHex } from 'chromanopia'

rgbToHex({ r: 230, g: 57, b: 70 }) // '#e63946'
rgbToHex({ r: 0, g: 0, b: 0 })     // '#000000'
rgbToHex({ r: 300, g: -5, b: 0 })  // '#ff0000'（已钳制）
rgbToHex({ r: 127.6, g: 0, b: 0 }) // '#800000'（已四舍五入）
```

---

## rgbToHsl()

将 RGB 颜色转换为 HSL。

```ts
function rgbToHsl(rgb: RGB): HSL
```

返回 `{ h, s, l }`，其中 `h` 为色相，单位为度 [0, 360)，`s`/`l` 为饱和度和亮度，以 [0, 1] 范围内的分数表示。

### 示例

```ts
import { rgbToHsl } from 'chromanopia'

rgbToHsl({ r: 255, g: 0, b: 0 })   // { h: 0,   s: 1, l: 0.5 }（红）
rgbToHsl({ r: 0, g: 255, b: 0 })   // { h: 120, s: 1, l: 0.5 }（绿）
rgbToHsl({ r: 0, g: 0, b: 255 })   // { h: 240, s: 1, l: 0.5 }（蓝）
rgbToHsl({ r: 128, g: 128, b: 128 }) // { h: 0, s: 0, l: 0.5 }（灰 → s: 0）
```

---

## hslToRgb()

将 HSL 颜色转换为 RGB。

```ts
function hslToRgb(hsl: HSL): RGB
```

超出范围的 `h` 会按 360 取模归一化；`s` 和 `l` 会被钳制到 [0, 1]。

### 示例

```ts
import { hslToRgb } from 'chromanopia'

hslToRgb({ h: 0,   s: 1, l: 0.5 }) // { r: 255, g: 0,   b: 0   }（红）
hslToRgb({ h: 120, s: 1, l: 0.5 }) // { r: 0,   g: 255, b: 0   }（绿）
hslToRgb({ h: 480, s: 1, l: 0.5 }) // { r: 0,   g: 255, b: 0   }（480° ≡ 120°）
hslToRgb({ h: 0,   s: 0, l: 0.5 }) // { r: 128, g: 128, b: 128 }（灰）
```

`rgbToHsl` 和 `hslToRgb` 可以精确往返转换（最坏情况下通道误差：在 8 位精度范围内为 0）。
