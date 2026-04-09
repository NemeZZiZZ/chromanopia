---
layout: home
hero:
  name: chromanopia
  text: 色覚異常シミュレーション
  tagline: JavaScript/TypeScript向けの物理的に正確なCVDシミュレーション。3つのモデル、依存関係ゼロ。
  image:
    src: /logo.svg
    alt: chromanopia
  actions:
    - theme: brand
      text: はじめに
      link: /ja/guide/getting-started
    - theme: alt
      text: インタラクティブデモ
      link: /ja/demo/split-comparison
    - theme: alt
      text: APIリファレンス
      link: /ja/api/simulate
features:
  - icon: 🔬
    title: 3つの科学的モデル
    details: Viénot (1999)、Machado (2009)、Brettel (1997) — 用途に応じて速度と精度を選択できます。
  - icon: 🎨
    title: 全8種類の色覚異常
    details: 1型色覚異常、2型色覚異常、3型色覚異常、全色盲、およびそれらの部分的な変異型 — 完全なCVDカバレッジ。
  - icon: 🎚️
    title: 重症度スライダー
    details: 正常視覚から完全な色覚異常まで0〜1のスムーズな補間 — あらゆる程度の色覚異常をシミュレート。
  - icon: ⚡
    title: 依存関係ゼロ
    details: ランタイム依存関係なし。Node.js、ブラウザ、エッジランタイム、Web Workerですぐに動作します。
  - icon: 🖼️
    title: 3つのAPI
    details: 単一色（16進数またはRGB）、ピクセルバッファ（Canvas/Sharp）、生の3×3行列（WebGLシェーダー）。
  - icon: 🧮
    title: 正確な色彩科学
    details: LUTによるsRGB線形化、輝度デサチュレーションによるガマットマッピング、Rec. 709係数。
---
