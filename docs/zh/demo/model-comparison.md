# 模型对比

并排对比三种模拟模型。每种模型以不同方式转换相同的输入颜色 — 查看输出结果、底层矩阵和数学方法。

<script setup>
import ModelComparison from '../../.vitepress/theme/components/ModelComparison.vue'
import MatrixInspector from '../../.vitepress/theme/components/MatrixInspector.vue'
</script>

<ClientOnly>
  <ModelComparison />
</ClientOnly>

## 矩阵检查器

检查基于矩阵的模型（Viénot 和 Machado）的原始 3×3 矩阵。观察矩阵如何随严重程度调整而变化 — 它在单位矩阵和完全缺陷矩阵之间线性插值。

<ClientOnly>
  <MatrixInspector />
</ClientOnly>

## 关键差异

### 为什么不同模型会产生不同结果？

每种模型使用不同的数学方法来模拟锥体丧失：

- **Viénot** 使用单个预计算矩阵投影到缩减的色彩空间。值始终为非负，因此结果总在色域内，但精度有所损失。

- **Machado** 对受影响的锥体类型建模光谱偏移。矩阵值可以为负（一种颜色可能需要从另一个通道"借用"），这更精确但可能产生超出色域的中间值。

- **Brettel** 完全不使用单一矩阵 — 它在 CIE xyY 色度空间中沿混淆线向混淆点逐像素投影。这是最精确的，但慢约 3-5 倍。

### 差异何时重要？

对于大多数 UI 无障碍工作，差异可以忽略不计。以下情况差异会变得明显：

- **饱和颜色**（纯红色、纯绿色）— Machado 和 Brettel 产生的结果与 Viénot 明显不同
- **蓝色盲（Tritanopia）** — 由于逐像素投影，Brettel 在此处精度明显更高
- **部分缺陷**（严重程度 < 1 的异常）— 模型间的插值方法不同

## 代码

```ts
import { simulate, getMatrix, isMatrixModel } from 'chromanopia'

// 对一种颜色比较所有三种模型
const models = ['vienot', 'machado', 'brettel'] as const

for (const model of models) {
  const result = simulate('#e63946', 'protanopia', { model })
  console.log(`${model}: ${result}`)

  if (isMatrixModel(model)) {
    const matrix = getMatrix('protanopia', { model })
    console.log('  matrix:', matrix)
  }
}
```
