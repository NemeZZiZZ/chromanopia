# ベンチマーク

ブラウザで `simulateBuffer()` のリアルタイムパフォーマンステストを実行します。さまざまな解像度と3つのシミュレーションモデルすべてのスループットを測定します。

<script setup>
import Benchmark from '../../.vitepress/theme/components/Benchmark.vue'
</script>

<ClientOnly>
  <Benchmark />
</ClientOnly>

## 測定方法

ベンチマーク：

1. 小さなバッファで50回のイテレーションによりJITを**ウォームアップ**
2. 各解像度×モデルの組み合わせに対して：
   - ランダムなRGBAピクセルバッファを作成
   - 約500msのデータを蓄積するのに十分なイテレーションを実行
   - **中央値**を報告（GCポーズに対してロバスト）
3. **フレームあたりの時間**と**メガピクセル/秒**のスループットを表示

## パフォーマンスに影響する要因

| 要因 | 影響 |
|---|---|
| **モデル** | BrettelはViénot/Machadoより約3〜5倍遅い（ピクセルごとのXYZ射影） |
| **解像度** | 線形スケーリング — 4KはFull HDより約4倍遅い |
| **CPU** | V8はホットループを適切に最適化。Apple Siliconは一般的にx86より2倍高速 |
| **ブラウザ** | V8（Chrome/Edge）とSpiderMonkey（Firefox）は同様のパフォーマンス。JSC（Safari）は変動あり |

## 一般的な結果

*Apple M1、Chrome 125で計測：*

| 解像度 | Viénot | Machado | Brettel |
|---|---|---|---|
| VGA（640×480） | 約1ms | 約1.5ms | 約6ms |
| Full HD（1920×1080） | 約8ms | 約10ms | 約40ms |
| 4K（3840×2160） | 約35ms | 約42ms | 約165ms |

リアルタイムアプリケーション（60fps = 16.7msのバジェット）では、ViénotとMachadoはFull HDまで問題なく処理できます。4Kの場合は、[Web Worker](/ja/guide/recipes#browser-offscreencanvas-web-worker)または[WebGLシェーダー](/ja/guide/recipes#webgl-shader-uniform)の使用を検討してください。

## コード

```ts
// シンプルなベンチマーク
const pixels = new Uint8ClampedArray(1920 * 1080 * 4)
// ... 画像データで埋める ...

const start = performance.now()
simulateBuffer(pixels, 'protanopia', { model: 'machado' })
const elapsed = performance.now() - start

console.log(`${elapsed.toFixed(1)}ms`)
```
