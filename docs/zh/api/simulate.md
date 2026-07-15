# simulate()

模拟特定色觉缺陷者所看到的单个颜色。

## 签名

```ts
function simulate<T extends string | RGB>(
  color: T,
  type: ColorblindType,
  options?: SimulateOptions,
): T
```

**返回与输入相同的类型**：输入 hex 字符串 → 输出 hex 字符串，输入 RGB 对象 → 输出 RGB 对象。

## 参数

| 参数 | 类型 | 必需 | 描述 |
|---|---|---|---|
| `color` | `string \| RGB` | 是 | Hex 字符串（`"#e63946"`、`"e63946"`、`"#F00"`）或 RGB 对象 `{ r, g, b }`（0–255） |
| `type` | `ColorblindType` | 是 | 要模拟的缺陷类型 |
| `options.model` | `ColorblindModel` | 否 | `"machado"`（默认）、`"vienot"` 或 `"brettel"` |
| `options.severity` | `number` | 否 | 0（正常视觉）到 1（完全缺陷）。默认值：`1`。超出范围的值会被钳制。 |

## 示例

### Hex 字符串

```ts
import { simulate } from 'chromanopia'

simulate('#e63946', 'protanopia')
// → '#6c6545'

simulate('#F00', 'deuteranopia')
// → '#a29000'

simulate('e63946', 'tritanopia')  // # 是可选的
// → '#f60046'
```

### RGB 对象

```ts
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 108, g: 101, b: 69 }
```

### 使用模型和严重程度

```ts
simulate('#e63946', 'protanopia', { model: 'brettel', severity: 0.7 })
// → '#aa6d56'

simulate('#e63946', 'protanopia', { severity: 0 })
// → '#e63946'（未改变 — severity 0 = 正常视觉）
```

### 类型 `"none"`（空操作）

```ts
simulate('#e63946', 'none')
// → '#e63946'（始终返回未改变的输入）
```

## 行为

- 当 `type` 为 `"none"` 时，返回未改变的输入（不做任何处理）
- 当 `severity` 为 `0` 时，返回未改变的输入
- 内部创建一个 4 像素的 `Uint8ClampedArray` 并委托给 `simulateBuffer`
- 对于 hex 输入，通过 `hexToRgb` 解析，再通过 `rgbToHex` 转换回去
