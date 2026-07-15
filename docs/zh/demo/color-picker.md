# 取色器

选择任意颜色，查看它在所有 8 种色觉缺陷类型下的表现。更改模型和严重程度以探索差异。

<script setup>
import ColorPicker from '../../.vitepress/theme/components/ColorPicker.vue'
</script>

<ClientOnly>
  <ColorPicker />
</ClientOnly>

## 您看到的内容

每个色块显示 `simulate(color, type, { model, severity })` 的结果：

- **正常视觉** — 原始颜色，未更改
- **Protanopia / Protanomaly** — L 锥体（红色）响应减弱或缺失
- **Deuteranopia / Deuteranomaly** — M 锥体（绿色）响应减弱或缺失
- **Tritanopia / Tritanomaly** — S 锥体（蓝色）响应减弱或缺失
- **Achromatopsia / Achromatomaly** — 所有锥体功能完全或部分丧失

## 试试这些颜色

| 颜色 | 为什么有趣 |
|---|---|
| `#e63946`（红色） | 对红色盲/绿色盲类型变化显著 |
| `#2a9d8f`（青色） | 在绿色盲中难以与灰色区分 |
| `#f4a261`（橙色） | 在红色盲缺陷中与黄色混淆 |
| `#6a4c93`（紫色） | 在绿色盲/红色盲类型中与蓝色混淆 |
| `#00ff00`（纯绿色） | 在绿色盲中几乎不可见 |

## 代码

```ts
import { simulate } from 'chromanopia'

// 每个色块背后的代码：
const result = simulate('#e63946', 'protanopia', {
  model: 'machado',
  severity: 1,
})
// → '#6c6545'
```
