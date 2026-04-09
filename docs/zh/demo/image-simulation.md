# 图像模拟

上传图像或使用内置示例图，查看它在不同色觉缺陷类型下的表现。所有处理都通过 `simulateBuffer()` 在您的浏览器中完成。

<script setup>
import ImageSimulator from '../../.vitepress/theme/components/ImageSimulator.vue'
</script>

<ClientOnly>
  <ImageSimulator />
</ClientOnly>

## 工作原理

该演示使用 Canvas API 处理图像：

```ts
import { simulateBuffer } from 'chromanopia'

// 从画布获取像素数据
const imageData = ctx.getImageData(0, 0, width, height)

// 就地模拟（修改缓冲区）
simulateBuffer(imageData.data, 'protanopia', {
  model: 'machado',
  severity: 1,
})

// 将修改后的数据放回
ctx.putImageData(imageData, 0, 0)
```

## 性能

`simulateBuffer` 就地处理像素，热循环内无内存分配：

| 图像尺寸 | Machado/Viénot | Brettel |
|---|---|---|
| 640×480 (VGA) | ~2ms | ~8ms |
| 1920×1080 (FHD) | ~12ms | ~45ms |
| 3840×2160 (4K) | ~50ms | ~180ms |

对于大图像，建议使用 [Web Worker](/zh/guide/recipes#browser-offscreencanvas-web-worker) 以避免阻塞主线程。

## 提示

- **拖放**桌面上的任意图像
- 尝试**调整严重程度**从 0 到 1，观察渐变过程
- 对比 **Machado 和 Brettel** — 差异在蓝色盲（tritanopia）中最为明显
- 纯**红/绿**图像对红色盲/绿色盲类型显示最显著的差异
