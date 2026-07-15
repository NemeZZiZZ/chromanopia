# simulatePalette()

一次调用即可模拟整个调色板中的所有颜色。每个输入独立模拟，输出类型按元素一一保留（hex 字符串输入得到 hex 字符串输出；RGB 对象得到 RGB 对象）。支持混合类型的调色板。

这样可以避免在循环中调用 [`simulate()`](./simulate) 带来的逐色分配开销，是批量无障碍检查的推荐入口。

## 签名

```ts
function simulatePalette<T extends string | RGB>(
  colors: readonly T[],
  type: ColorblindType,
  options?: SimulateOptions,
): T[]
```

## 参数

| 参数 | 类型 | 必需 | 描述 |
|---|---|---|---|
| `colors` | `readonly (string \| RGB)[]` | 是 | 颜色数组。每个元素可以是 hex 字符串或 RGB 对象。 |
| `type` | `ColorblindType` | 是 | 要模拟的缺陷类型 |
| `options.model` | `ColorblindModel` | 否 | `"machado"`（默认）、`"vienot"` 或 `"brettel"` |
| `options.severity` | `number` | 否 | 0–1，默认值 `1`。超出范围的值会被钳制。 |

## 返回

返回一个与输入长度相同的**新数组**。输入数组永远不会被修改。每个元素都保留对应输入元素的类型。

## 示例

### 模拟设计系统调色板

```ts
import { simulatePalette } from 'chromanopia'

const brand = ['#e63946', '#457b9d', '#1d3557']
const simulated = simulatePalette(brand, 'protanopia')
// → ['#6c6545', '#6b7a9f', '#263758']
```

### 保留混合类型

```ts
const mixed = simulatePalette(
  ['#ff0000', { r: 0, g: 0, b: 255 }],
  'deuteranopia',
)
// → [ '#a29000', { r: 0, g: 66, b: 133 } ]
typeof mixed[0] // 'string'
typeof mixed[1] // 'object'
```

### 使用模型和严重程度

```ts
simulatePalette(brand, 'protanomaly', { model: 'brettel', severity: 0.6 })
```

### 空调色板

```ts
simulatePalette([], 'protanopia') // → []
```

## 行为

- 当 `type` 为 `"none"` 时，返回输入的副本（永远不会是相同的引用 —— 见 [`simulate()`](./simulate)）。
- 等价于 `colors.map(c => simulate(c, type, options))`，但避免了为每个颜色创建一次性的 4 字节像素缓冲区。
- 对于 `"none"` 路径和 RGB 输入，每个输出都是一个新的副本，因此修改结果永远不会影响调用方的输入。
