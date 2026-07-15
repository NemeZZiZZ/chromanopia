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

*一个参考点 — Apple M1、Node 22、预热 JIT、40 次迭代的中位数。你的数值会因硬件、浏览器以及 JIT 的预热程度而有所不同。请在自己的机器上运行上方的性能测试以获取实际数值。*

| 分辨率 | 像素数 | Viénot | Machado | Brettel |
|---|---|---|---|---|
| VGA (640×480) | 0.3M | ~60ms | ~40ms | ~80ms |
| Full HD (1920×1080) | 2.1M | ~420ms | ~260ms | ~520ms |
| 4K (3840×2160) | 8.3M | ~1.7s | ~1.0s | ~2.1s |

吞吐量基本上与分辨率无关：稳态下 **Machado ≈ 8 Mpix/s**、**Viénot ≈ 5 Mpix/s**、**Brettel ≈ 4 Mpix/s**。

::: warning
单次 `simulateBuffer()` 调用在任何超过几十万像素的分辨率下都**无法**装入 60fps 的帧（16.7ms）—— JavaScript 根本无法那么快地处理数百万像素。对于实时使用：
- 将计算移至 [Web Worker](/zh/guide/recipes#browser-offscreencanvas-web-worker)，以免阻塞主线程
- 使用 [WebGL shader](/zh/guide/recipes#webgl-shader-uniform) 进行 GPU 加速处理（快 10–100 倍）
- 对于一次性转换（例如处理一次上传的图像），上述时间没问题 —— 用户会觉得 ~260ms 接近瞬时
:::

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
