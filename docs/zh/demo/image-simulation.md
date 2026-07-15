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

`simulateBuffer` 就地处理像素，热循环内无内存分配。在预热的 JavaScript 引擎中，吞吐量大致为：

| 图像尺寸 | Machado | Brettel |
|---|---|---|
| 640×480 (VGA) | ~40ms | ~80ms |
| 1920×1080 (FHD) | ~260ms | ~520ms |
| 3840×2160 (4K) | ~1.0s | ~2.1s |

*一个参考点 — Apple M1、Node 22。你的浏览器结果可能有所不同。处理一张典型照片（几百万像素）感觉接近瞬时；对于大图像或实时使用，请考虑使用 [Web Worker](/zh/guide/recipes#browser-offscreencanvas-web-worker) 或 [WebGL shader](/zh/guide/recipes#webgl-shader-uniform)。*

## 提示

- **拖放**桌面上的任意图像
- 尝试**调整严重程度**从 0 到 1，观察渐变过程
- 对比 **Machado 和 Brettel** — 差异在蓝色盲（tritanopia）中最为明显
- 纯**红/绿**图像对红色盲/绿色盲类型显示最显著的差异
