# 无障碍辅助工具

基于模拟核心构建的无障碍辅助工具：WCAG 对比度、感知颜色距离、相对亮度，以及一个"在某种缺陷下这两种颜色是否可区分"的检查。

这正是你最初接触色觉缺陷库的典型原因 —— 除了*展示*色盲人士看到的画面之外，你还可以*测试*你的调色板是否可用。

---

## contrastRatio()

两种颜色之间的 WCAG 2.x 对比度。

```ts
function contrastRatio(
  a: string | RGB,
  b: string | RGB,
): number
```

返回一个 **[1, 21]** 范围内的值，其中 1 表示完全相同，21 表示黑与白的对比。接受任何 [`toRgb()`](./color-conversion) 能理解的颜色形式：hex 字符串、`rgb()`/`rgba()`、RGB 或 HSL 对象。

### 参数

| 参数 | 类型 | 必需 | 描述 |
|---|---|---|---|
| `a` | `string \| RGB` | 是 | 第一种颜色（hex、`rgb()`、RGB 或 HSL 对象） |
| `b` | `string \| RGB` | 是 | 第二种颜色（形式与 `a` 相同） |

### 示例

```ts
import { contrastRatio } from 'chromanopia'

contrastRatio('#ffffff', '#000000') // 21
contrastRatio('#ffffff', '#767676') // ≈ 4.54（通过正文文本的 WCAG AA）
contrastRatio('#777777', '#ffffff') // ≈ 4.48（与顺序无关）
contrastRatio('#e63946', '#e63946') // 1（完全相同）
```

### WCAG 阈值

| 比值 | 等级 | 使用场景 |
|---|---|---|
| ≥ 7 | AAA | 正文文本 < 18pt |
| ≥ 4.5 | AA | 正文文本 < 18pt |
| ≥ 3 | AA | 大号文本 ≥ 18pt，或 UI 组件 |

---

## colorDistance()

两种颜色在 sRGB [0,255]³ 空间中的欧几里得距离。计算开销低，且与感知差异单调相关；用于快速排序，不适用于感知均匀的 ΔE。

```ts
function colorDistance(
  a: string | RGB,
  b: string | RGB,
): number
```

### 示例

```ts
import { colorDistance } from 'chromanopia'

colorDistance('#ff0000', '#00ff00') // ≈ 360.6（红对绿）
colorDistance('#e63946', '#e63946') // 0（完全相同）
colorDistance('#000000', '#010101') // ≈ 1.73
```

---

## isDistinguishable()

如果两种颜色在模拟某种缺陷后仍然可区分，则返回 `true` —— 即它们模拟后的 sRGB 距离达到了某个 `threshold`。

```ts
function isDistinguishable(
  a: string | RGB,
  b: string | RGB,
  type: ColorblindType,
  options?: SimulateOptions,
  threshold?: number, // default 30
): boolean
```

### 参数

| 参数 | 类型 | 必需 | 描述 |
|---|---|---|---|
| `a` | `string \| RGB` | 是 | 第一种颜色 |
| `b` | `string \| RGB` | 是 | 第二种颜色 |
| `type` | `ColorblindType` | 是 | 要模拟的缺陷。使用 `"none"` 表示正常视觉的距离。 |
| `options` | `SimulateOptions` | 否 | 模拟模型/严重程度（默认 Machado，严重程度 1） |
| `threshold` | `number` | 否 | 视为可区分的最小 sRGB 欧几里得距离。默认值：`30`。 |

### 示例

```ts
import { isDistinguishable } from 'chromanopia'

// 橙色 #f77f00 和绿色 #1d9c1d 在正常视觉下看起来明显不同……
isDistinguishable('#f77f00', '#1d9c1d', 'none')       // true
// ……但对红色盲来说会坍缩为相同的色相：
isDistinguishable('#f77f00', '#1d9c1d', 'protanopia') // false

// 根据你的使用场景调整阈值（越低越严格）：
isDistinguishable('#aabbcc', '#112233', 'deuteranopia', {}, 50) // 更严格
```

### 选择阈值

默认值 `30` 对应于 sRGB 显示器上一个清晰可见的差异。对于关键 UI（状态指示器、绝不能混淆的图表系列），请使用更高的阈值（50–80）。对于"大致相同颜色"的检测，则降低该值。

---

## relativeLuminance()

根据 WCAG 2.x / Rec. 709 计算的 sRGB 颜色的相对亮度。返回 [0, 1] 范围内的值，其中 0 表示黑色，1 表示白色。使用与库其余部分相同的 sRGB 线性化方式。

```ts
function relativeLuminance(
  r: number,
  g: number,
  b: number,
): number
```

### 参数

| 参数 | 类型 | 必需 | 描述 |
|---|---|---|---|
| `r` | `number` | 是 | 红色通道，0–255 |
| `g` | `number` | 是 | 绿色通道，0–255 |
| `b` | `number` | 是 | 蓝色通道，0–255 |

### 示例

```ts
import { relativeLuminance } from 'chromanopia'

relativeLuminance(0, 0, 0)       // 0
relativeLuminance(255, 255, 255) // 1
relativeLuminance(255, 0, 0)     // 0.2126（红）
relativeLuminance(0, 255, 0)     // 0.7152（绿 —— 权重最高）
relativeLuminance(0, 0, 255)     // 0.0722（蓝）
```

`contrastRatio()` 基于此函数实现。
