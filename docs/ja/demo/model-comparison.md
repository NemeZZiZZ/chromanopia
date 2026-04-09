# モデル比較

3つのシミュレーションモデルを並べて比較します。各モデルは同じ入力色を異なる方法で変換します — 出力、基礎となる行列、数学的アプローチを確認できます。

<script setup>
import ModelComparison from '../../.vitepress/theme/components/ModelComparison.vue'
import MatrixInspector from '../../.vitepress/theme/components/MatrixInspector.vue'
</script>

<ClientOnly>
  <ModelComparison />
</ClientOnly>

## 行列インスペクター

行列ベースのモデル（ViénotとMachado）の生の3×3行列を検査します。重症度を調整すると行列がどのように変化するかを観察してください — 単位行列と完全な色覚異常行列の間で線形に補間されます。

<ClientOnly>
  <MatrixInspector />
</ClientOnly>

## 主な違い

### なぜモデルによって結果が異なるのか？

各モデルは錐体の欠損をシミュレートするために異なる数学的アプローチを使用しています：

- **Viénot** は事前計算された単一の行列を使用して縮小された色空間に射影します。値は常に非負なので結果は常にガマット内ですが、精度は犠牲になります。

- **Machado** は影響を受ける錐体タイプのスペクトルシフトをモデル化します。行列値は負になることがあり（色が別のチャンネルから「借用」する必要がある場合）、より正確ですがガマット外の中間値を生成する可能性があります。

- **Brettel** は単一の行列をまったく使用しません — CIE xyY色度空間で各ピクセルを混同線に沿って混同点に向かって個別に射影します。最も正確ですが約3〜5倍遅くなります。

### 違いが重要になる場合

ほとんどのUIアクセシビリティ作業では、違いは無視できます。以下の場合に違いが顕著になります：

- **彩度の高い色**（純粋な赤、純粋な緑） — MachadoとBrettelはViénotとは明らかに異なる結果を生成
- **3型色覚異常（トリタノピア）** — Brettelはピクセルごとの射影によりここで大幅に正確
- **部分的な色覚異常**（severity < 1の異常） — 補間方法がモデル間で異なる

## コード

```ts
import { simulate, getMatrix, isMatrixModel } from 'chromanopia'

// 1つの色で3つのモデルすべてを比較
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
