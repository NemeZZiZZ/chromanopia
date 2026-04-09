# 类型与元数据

## 类型

### ColorblindType

所有支持的色觉缺陷类型。`"none"` 表示正常视觉（单位矩阵 / 空操作）。

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

可用的模拟模型。

```ts
type ColorblindModel = "vienot" | "machado" | "brettel"
```

### SimulateOptions

`simulate()`、`simulateBuffer()` 和 `getMatrix()` 的选项。

```ts
interface SimulateOptions {
  /** Simulation model. Default: "machado". */
  model?: ColorblindModel
  /** Deficiency severity from 0 (none) to 1 (full). Default: 1. */
  severity?: number
}
```

### RGB

RGB 颜色，以 0–255 整数通道的对象表示。

```ts
interface RGB {
  r: number
  g: number
  b: number
}
```

### Matrix3x3

3×3 色彩矩阵，以行优先顺序的扁平 9 元素元组表示。

```ts
type Matrix3x3 = [
  number, number, number,
  number, number, number,
  number, number, number,
]
```

### DeficiencyInfo

缺陷类型的元数据。

```ts
interface DeficiencyInfo {
  label: string
  description: string
  /** Representative color preview (hex). */
  color: string
}
```

### ModelInfo

模拟模型的元数据。

```ts
interface ModelInfo {
  label: string
  description: string
}
```

## 元数据对象

### COLORBLIND_TYPES

`Record<ColorblindType, DeficiencyInfo>` — 所有 9 种缺陷类型（包括 `"none"`）的元数据。

```ts
import { COLORBLIND_TYPES } from 'chromanopia'

COLORBLIND_TYPES.protanopia
// {
//   label: "Protanopia",
//   description: "Red-blind, cannot perceive red light",
//   color: "#9b9a43"
// }
```

适用于构建 UI 选择器、图例和提示信息。

| 类型 | 标签 | 描述 | 预览 |
|---|---|---|---|
| `none` | Normal Vision | 无色觉缺陷 | `#e63946` |
| `protanopia` | Protanopia | 红色盲，无法感知红光 | `#9b9a43` |
| `protanomaly` | Protanomaly | 红色弱，对红色敏感度降低 | `#c67344` |
| `deuteranopia` | Deuteranopia | 绿色盲，无法感知绿光 | `#a5b242` |
| `deuteranomaly` | Deuteranomaly | 绿色弱，对绿色敏感度降低 | `#c36644` |
| `tritanopia` | Tritanopia | 蓝色盲，无法感知蓝光 | `#dd4040` |
| `tritanomaly` | Tritanomaly | 蓝色弱，对蓝色敏感度降低 | `#e03c44` |
| `achromatopsia` | Achromatopsia | 全色盲，只能看到灰度 | `#6e6e6e` |
| `achromatomaly` | Achromatomaly | 部分色盲，色彩感知降低 | `#a5565c` |

### COLORBLIND_MODELS

`Record<ColorblindModel, ModelInfo>` — 所有 3 种模拟模型的元数据。

```ts
import { COLORBLIND_MODELS } from 'chromanopia'

COLORBLIND_MODELS.machado
// {
//   label: "Machado",
//   description: "Spectral-shift 3×3 matrix (2009), more accurate"
// }
```

| 模型 | 标签 | 描述 |
|---|---|---|
| `vienot` | Viénot | 简化 3×3 矩阵 (1999)，快速且广泛使用 |
| `machado` | Machado | 光谱偏移 3×3 矩阵 (2009)，更精确 |
| `brettel` | Brettel | CIE xyY 混淆点投影 (1997)，最精确，较慢 |

## 底层工具函数

这些导出用于高级用例（自定义管线、着色器等）。

### hexToRgb(hex)

```ts
function hexToRgb(hex: string): RGB
```

将 `#RGB`、`#RRGGBB`、`RGB` 或 `RRGGBB` 解析为 RGB 对象。输入无效时抛出异常。

### rgbToHex(rgb)

```ts
function rgbToHex(rgb: RGB): string
```

将 RGB 对象转换为 `#rrggbb` 字符串。会钳制和四舍五入值。

### srgbToLinear(v)

```ts
function srgbToLinear(v: number): number
```

将单个 sRGB 值（0–255）转换为线性 [0,1]。使用预计算 LUT 以提高速度。

### linearToSrgb(c)

```ts
function linearToSrgb(c: number): number
```

将线性 [0,1] 值转换为 sRGB（0–255）。钳制到有效范围。

### gamutMap(r, g, b)

```ts
function gamutMap(r: number, g: number, b: number): [number, number, number]
```

通过向 Rec. 709 亮度值去饱和，将超出色域的线性 RGB 三元组映射到 [0,1]。如果已在色域内则返回原始输入。
