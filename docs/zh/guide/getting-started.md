# 快速开始

## 安装

::: code-group
```bash [npm]
npm install chromanopia
```
```bash [pnpm]
pnpm add chromanopia
```
```bash [yarn]
yarn add chromanopia
```
:::

## 快速开始

### 模拟单个颜色

```ts
import { simulate } from 'chromanopia'

// 输入 hex 字符串 → 输出 hex 字符串
simulate('#e63946', 'protanopia')
// → '#8b8b2b'

// 输入 RGB 对象 → 输出 RGB 对象
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 139, g: 139, b: 43 }
```

### 选择模型和严重程度

```ts
simulate('#e63946', 'protanopia', {
  model: 'brettel',   // 'machado'（默认）、'vienot' 或 'brettel'
  severity: 0.7,       // 0（正常视觉）到 1（完全缺陷）
})
```

### 处理图像 (Canvas)

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'deuteranopia')
ctx.putImageData(imageData, 0, 0)
```

### 获取原始矩阵（用于 WebGL / Sharp）

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('tritanopia', { model: 'machado', severity: 0.5 })
// → [0.975, 0.025, 0, 0, 0.71667, 0.28333, 0, 0.2375, 0.7625]
```

## 工作原理

模拟管线：

1. **输入** — hex 字符串或 RGB 对象（每通道 0–255）
2. **sRGB → 线性** — 使用预计算的 256 项 LUT 移除 gamma 曲线
3. **模拟** — 在线性光空间中应用所选模型的变换
4. **色域映射** — 将超出色域的颜色向其亮度值去饱和（Rec. 709）
5. **线性 → sRGB** — 重新应用 gamma 曲线
6. **输出** — 与输入格式相同

这确保了物理正确的结果。许多其他库跳过了步骤 2、4 和 5，这会产生视觉上不正确的输出，尤其是对于饱和颜色。

## 下一步

- 试试[交互式演示](/zh/demo/color-picker)，实际体验效果
- 了解[三种模型](/zh/guide/models)及其适用场景
- 查看 Canvas、Sharp 和 WebGL 集成的[实用示例](/zh/guide/recipes)
- 浏览完整的 [API 参考](/zh/api/simulate)
