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
| **モデル** | BrettelはViénot/Machadoより約1.2倍遅い（ピクセルごとのXYZ射影） |
| **解像度** | 線形スケーリング — 4KはFull HDより約4倍遅い |
| **CPU** | V8はホットループを適切に最適化。Apple Siliconは一般的にx86より2倍高速 |
| **ブラウザ** | V8（Chrome/Edge）とSpiderMonkey（Firefox）は同様のパフォーマンス。JSC（Safari）は変動あり |

## 代表的な結果

*1つの参考値 — Apple M1、Node 22、ウォームJIT、40イテレーションの中央値。結果はハードウェア、ブラウザ、JITのウォームアップ具合により異なります。お使いの環境での数値は上のベンチマークを実行してください。*

| Resolution | Pixels | Viénot | Machado | Brettel |
|---|---|---|---|---|
| VGA (640×480) | 0.3M | ~80ms | ~85ms | ~100ms |
| Full HD (1920×1080) | 2.1M | ~590ms | ~560ms | ~660ms |
| 4K (3840×2160) | 8.3M | ~2.4s | ~2.2s | ~2.6s |

スループットはほぼ解像度に依存せず、行列モデル（Viénot、Machado）で **~3.5 Mpix/s**、Brettelで **~3.2 Mpix/s** です。

::: warning
1回の `simulateBuffer()` 呼び出しは、数十万ピクセルを超えるいかなる解像度でも60fpsフレーム（16.7ms）に**収まりません** — JavaScriptがそれほど高速に数百万ピクセルを処理することは単に不可能です。リアルタイム用途では：
- メインスレッドをブロックしないよう、処理を[Web Worker](/ja/guide/recipes#browser-offscreencanvas-web-worker)に移動してください
- GPUアクセラレーション処理には[WebGL shader](/ja/guide/recipes#webgl-shader-uniform)を使用してください（10〜100倍高速）
- ワンショットの変換（例：アップロードした画像を1回だけ処理する場合）では、上記の時間で問題ありません — ユーザーは約260msをほぼ瞬時と感じます
:::

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
