# simulateBuffer()

将色盲模拟**就地**应用到 RGBA 像素缓冲区。这是图像处理的核心函数。

## 签名

```ts
function simulateBuffer(
  pixels: Uint8Array | Uint8ClampedArray,
  type: ColorblindType,
  options?: SimulateOptions,
): void
```

**直接修改输入缓冲区。** 如果需要保留原始数据，请先克隆。

## 参数

| 参数 | 类型 | 必需 | 描述 |
|---|---|---|---|
| `pixels` | `Uint8Array \| Uint8ClampedArray` | 是 | RGBA 像素缓冲区。长度必须是 4 的倍数。 |
| `type` | `ColorblindType` | 是 | 要模拟的缺陷类型 |
| `options.model` | `ColorblindModel` | 否 | `"machado"`（默认）、`"vienot"` 或 `"brettel"` |
| `options.severity` | `number` | 否 | 0–1，默认 `1`。会钳制到有效范围。 |

## 示例

### Canvas ImageData

```ts
import { simulateBuffer } from 'chromanopia'

const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

### 保留原始数据

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

// Buffer 继承自 Uint8Array — 可直接使用
simulateBuffer(data, 'tritanopia', { model: 'brettel' })
```

### 使用严重程度

```ts
simulateBuffer(pixels, 'protanomaly', { severity: 0.5 })
```

## 行为

- **Alpha 通道保持不变** — 仅修改 R、G、B 字节（每第 4 个字节被跳过）
- 当 `type` 为 `"none"` 或 `severity` 为 `0` 时，立即返回（不做任何处理）
- 对于矩阵模型（Viénot、Machado）：sRGB → 线性 → 矩阵乘法 → 色域映射 → sRGB
- 对于 Brettel：sRGB → 线性 → XYZ → xyY 投影 → XYZ → 线性 → sRGB
- 对于 Brettel 处理全色盲/部分全色盲时：回退到 Machado 矩阵

## 性能

该函数每次处理 4 字节，热循环内无内存分配。性能与像素数量线性相关：

| 分辨率 | 像素数 | Machado | Brettel |
|---|---|---|---|
| 640×480 | 307K | ~2ms | ~8ms |
| 1920×1080 | 2.1M | ~12ms | ~45ms |
| 3840×2160 | 8.3M | ~50ms | ~180ms |

*在 Apple M1 上单线程测量。您的结果可能有所不同。*
