# 模拟模型

chromanopia 实现了三种经过同行评审的模拟模型。每种模型在精度和速度之间有不同的权衡。

## 概览

| 模型 | 年份 | 方法 | 速度 | 精度 | 使用场景 |
|---|---|---|---|---|---|
| **Viénot** | 1999 | 3×3 矩阵，非负值 | 最快 | 良好 | 实时 UI，快速预览 |
| **Machado** | 2009 | 3×3 光谱偏移矩阵 | 快速 | 更好 | 默认选择，最佳平衡 |
| **Brettel** | 1997 | 逐像素 CIE xyY 投影 | 慢约 3-5 倍 | 最佳 | 研究、验证、参考 |

## Viénot (1999)

**论文：** Viénot, Brettel & Mollon — *Digital video colourmaps for checking the legibility of displays by dichromats*

- 所有矩阵值均为非负（≥ 0）
- 行和等于 1.0 — 亮度完全保持
- 最快的计算方式：每像素仅一次矩阵乘法
- 对边缘情况和部分缺陷的精度略低
- 最适合：实时应用、预算紧张的着色器管线

```ts
simulate('#e63946', 'protanopia', { model: 'vienot' })
```

## Machado (2009)

**论文：** Machado, Oliveira & Fernandes — *A physiologically-based model for simulation of color vision deficiency*

- 使用光谱偏移来建模视锥细胞响应变化
- 矩阵值可以为负数且大于 1（外推）
- 比 Viénot 更具物理精度
- chromanopia 的默认模型
- 最适合：大多数使用场景、无障碍测试、设计工具

```ts
simulate('#e63946', 'protanopia', { model: 'machado' })
// 这是默认值 — 等同于：
simulate('#e63946', 'protanopia')
```

## Brettel (1997)

**论文：** Brettel, Viénot & Mollon — *Computerized simulation of color appearance for dichromats*

- 在 CIE xyY 色彩空间中将每个像素投影到混淆线上
- 不是单一矩阵 — 每个像素都需要 XYZ 转换、投影和逆变换
- 最精确的模型，尤其适用于蓝色盲（tritanopia）
- 比矩阵模型慢约 3-5 倍
- 对于杆状单色视觉（全色盲 / 部分全色盲），回退到 Machado 矩阵
- 最适合：研究、参考输出、与其他实现的对照验证

```ts
simulate('#e63946', 'protanopia', { model: 'brettel' })
```

::: tip
使用 `isMatrixModel(model)` 检查模型是否返回 3×3 矩阵。这在决定使用 Sharp 的 `recomb`（矩阵路径）还是原始缓冲区处理（Brettel）时很有用。
:::

## 异常变体

每种视锥缺陷都有一个部分变体（异常）：

| 完全缺陷 | 部分变体 | 受影响的视锥 |
|---|---|---|
| Protanopia（红色盲） | Protanomaly（红色弱） | L（红色） |
| Deuteranopia（绿色盲） | Deuteranomaly（绿色弱） | M（绿色） |
| Tritanopia（蓝色盲） | Tritanomaly（蓝色弱） | S（蓝色） |
| Achromatopsia（全色盲） | Achromatomaly（部分全色盲） | 所有视锥（仅杆状细胞） |

对于矩阵模型，异常模拟使用单位矩阵和完全缺陷矩阵之间的插值。

对于 Brettel，异常使用原始颜色和模拟二色视觉颜色之间的加权混合（1.75/2.75 因子）。

## 杆状单色视觉

全色盲（achromatopsia，完全色盲）和部分全色盲（achromatomaly）不是特定视锥的缺陷 — 它们源于视锥功能完全缺失或减弱。它们使用 Rec. 709 亮度系数：

```
R' = 0.2126·R + 0.7152·G + 0.0722·B
G' = 0.2126·R + 0.7152·G + 0.0722·B
B' = 0.2126·R + 0.7152·G + 0.0722·B
```

此矩阵在所有三种模型中共享，因为它不是特定于模型的。

<script setup>
import ModelComparison from '../../.vitepress/theme/components/ModelComparison.vue'
</script>

## 交互式对比

尝试不同的颜色和类型，查看每种模型的差异：

<ClientOnly>
  <ModelComparison />
</ClientOnly>
