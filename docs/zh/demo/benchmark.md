# 性能测试

在您的浏览器中运行 `simulateBuffer()` 的实时性能测试。测量不同分辨率和所有三种模拟模型的吞吐量。

<script setup>
import Benchmark from '../../.vitepress/theme/components/Benchmark.vue'
</script>

<ClientOnly>
  <Benchmark />
</ClientOnly>

## 测试方法

性能测试流程：

1. 使用小缓冲区进行 50 次迭代**预热** JIT
2. 对于每个分辨率 × 模型组合：
   - 创建随机 RGBA 像素缓冲区
   - 运行足够多的迭代以累积约 500ms 的数据
   - 报告**中位数**时间（对 GC 暂停具有鲁棒性）
3. 显示**每帧时间**和**吞吐量**（百万像素/秒）

## 影响性能的因素

| 因素 | 影响 |
|---|---|
| **模型** | Brettel 比 Viénot/Machado 慢约 3-5 倍（逐像素 XYZ 投影） |
| **分辨率** | 线性缩放 — 4K 比全高清慢约 4 倍 |
| **CPU** | V8 对热循环优化良好；Apple Silicon 通常比 x86 快 2 倍 |
| **浏览器** | V8 (Chrome/Edge) 和 SpiderMonkey (Firefox) 性能相近；JSC (Safari) 有所不同 |

## 典型结果

*在 Apple M1，Chrome 125 上测量：*

| 分辨率 | Viénot | Machado | Brettel |
|---|---|---|---|
| VGA (640×480) | ~1ms | ~1.5ms | ~6ms |
| Full HD (1920×1080) | ~8ms | ~10ms | ~40ms |
| 4K (3840×2160) | ~35ms | ~42ms | ~165ms |

对于实时应用（60fps = 16.7ms 预算），Viénot 和 Machado 可以轻松处理全高清分辨率。对于 4K，建议使用 [Web Worker](/zh/guide/recipes#browser-offscreencanvas-web-worker) 或 [WebGL 着色器](/zh/guide/recipes#webgl-shader-uniform)。

## 代码

```ts
// 简单性能测试
const pixels = new Uint8ClampedArray(1920 * 1080 * 4)
// ... 填充图像数据 ...

const start = performance.now()
simulateBuffer(pixels, 'protanopia', { model: 'machado' })
const elapsed = performance.now() - start

console.log(`${elapsed.toFixed(1)}ms`)
```
