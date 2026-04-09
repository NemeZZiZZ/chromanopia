# シミュレーションモデル

chromanopiaは3つの査読済みシミュレーションモデルを実装しています。それぞれ精度と速度のトレードオフが異なります。

## 概要

| モデル | 年 | 手法 | 速度 | 精度 | 用途 |
|---|---|---|---|---|---|
| **Viénot** | 1999 | 3×3行列、非負 | 最速 | 良好 | リアルタイムUI、クイックプレビュー |
| **Machado** | 2009 | 3×3スペクトルシフト行列 | 高速 | より良好 | デフォルト選択、最適なバランス |
| **Brettel** | 1997 | ピクセルごとのCIE xyY射影 | 約3〜5倍遅い | 最良 | 研究、検証、リファレンス |

## Viénot (1999)

**論文:** Viénot, Brettel & Mollon — *Digital video colourmaps for checking the legibility of displays by dichromats*

- すべての行列値が非負（≥ 0）
- 行の合計が1.0 — 輝度が完全に保存される
- 最速の計算：ピクセルあたり単一の行列乗算
- エッジケースや部分的な色覚異常に対してやや精度が低い
- 最適な用途：リアルタイムアプリケーション、タイトなバジェットのシェーダーパイプライン

```ts
simulate('#e63946', 'protanopia', { model: 'vienot' })
```

## Machado (2009)

**論文:** Machado, Oliveira & Fernandes — *A physiologically-based model for simulation of color vision deficiency*

- スペクトルシフトを使用して錐体応答の変化をモデル化
- 行列値が負やgt;1になることがある（外挿）
- Viénotより物理的に正確
- chromanopiaのデフォルトモデル
- 最適な用途：ほとんどのユースケース、アクセシビリティテスト、デザインツール

```ts
simulate('#e63946', 'protanopia', { model: 'machado' })
// これがデフォルト — 以下と同等：
simulate('#e63946', 'protanopia')
```

## Brettel (1997)

**論文:** Brettel, Viénot & Mollon — *Computerized simulation of color appearance for dichromats*

- 各ピクセルをCIE xyY色空間の混同線上に射影
- 単一の行列ではない — 各ピクセルにXYZ変換、射影、逆変換が必要
- 最も正確なモデル、特に3型色覚異常（トリタノピア）に対して
- 行列モデルより約3〜5倍遅い
- 杆体モノクロマシー（全色盲/不全色盲）ではMachado行列にフォールバック
- 最適な用途：研究、リファレンス出力、他の実装との検証

```ts
simulate('#e63946', 'protanopia', { model: 'brettel' })
```

::: tip
`isMatrixModel(model)` を使用して、モデルが3×3行列を返すかどうかを確認できます。これはSharpの `recomb`（行列パス）と生バッファ処理（Brettel）のどちらを使用するかを決定する際に便利です。
:::

## 異常変異型

各錐体の色覚異常には部分的な変異型（異常）があります：

| 完全な色覚異常 | 部分的変異型 | 影響を受ける錐体 |
|---|---|---|
| Protanopia | Protanomaly | L（赤） |
| Deuteranopia | Deuteranomaly | M（緑） |
| Tritanopia | Tritanomaly | S（青） |
| Achromatopsia | Achromatomaly | すべての錐体（杆体のみ） |

行列モデルでは、異常シミュレーションは単位行列と完全な色覚異常行列の間の補間を使用します。

Brettelでは、異常は元の色とシミュレートされた2色覚の色の間の加重ブレンド（1.75/2.75係数）を使用します。

## 杆体モノクロマシー

全色盲（完全な色覚異常）と不全色盲（部分的）は錐体固有の欠陥ではなく、錐体機能が完全に欠如または低下した結果です。これらはRec. 709輝度係数を使用します：

```
R' = 0.2126·R + 0.7152·G + 0.0722·B
G' = 0.2126·R + 0.7152·G + 0.0722·B
B' = 0.2126·R + 0.7152·G + 0.0722·B
```

この行列はモデル固有ではないため、3つのモデルすべてで共有されます。

<script setup>
import ModelComparison from '../../.vitepress/theme/components/ModelComparison.vue'
</script>

## インタラクティブ比較

異なる色とタイプを試して、各モデルの違いを確認してください：

<ClientOnly>
  <ModelComparison />
</ClientOnly>
