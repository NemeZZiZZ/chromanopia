# 色変換

色の解析と変換ユーティリティ：16進数解析（3/4/6/8桁）、`rgb()`/`rgba()` CSS文字列、HSLラウンドトリップ、そして汎用 `toRgb()` 強制変換関数。

これらは直接的な使用目的と、上位レベルのAPI（[`simulate()`](./simulate)、[`simulatePalette()`](./simulate-palette)、[アクセシビリティヘルパー](./accessibility)）が `toRgb()` 経由で任意の色形式を受け付けるためにエクスポートされています。

---

## toRgb()

任意の受け入れ可能な形式の色をRGBオブジェクトに強制変換します。APIの他の部分で使用される汎用エントリポイントです。

```ts
function toRgb(color: string | RGB | HSL): RGB
```

16進数文字列（`"#e63946"`、`"F00"`、`"#RRGGBBAA"`）、CSS `rgb()`/`rgba()` 文字列、HSLオブジェクト、またはRGBオブジェクト（新しいコピーとして返されます）を受け付けます。

### 使用例

```ts
import { toRgb } from 'chromanopia'

toRgb('#ff0000')                  // { r: 255, g: 0, b: 0 }
toRgb('rgb(230 57 70)')           // { r: 230, g: 57, b: 70 }
toRgb({ h: 120, s: 1, l: 0.5 })   // { r: 0, g: 255, b: 0 }
toRgb({ r: 10, g: 20, b: 30 })    // { r: 10, g: 20, b: 30 }（コピー、エイリアスではない）
```

::: tip
RGBオブジェクトはコピーとして返され、同じ参照になることはないため、結果を変更しても安全です。
:::

---

## parseCssColor()

CSS色文字列をRGBオブジェクトに解析します。`toRgb()` よりも低レベルで、文字列のみを受け付けます。

```ts
function parseCssColor(css: string): RGB
```

16進数（3/4/6/8桁、`#` の有無は問わない）と、レガシーのカンマ構文（`rgba(230, 57, 70, 0.5)`）およびモダンなスペース構文（`rgb(230 57 70 / 0.5)`）の両方の `rgb()` / `rgba()` をサポートします。パーセンテージチャンネル（`rgb(100%, 0%, 0%)`）もサポートされます。アルファコンポーネントは解析されますが返されません（`RGB` にアルファはありません）。

### 使用例

```ts
import { parseCssColor } from 'chromanopia'

parseCssColor('#e63946ff')              // { r: 230, g: 57, b: 70 }（8桁、アルファは破棄）
parseCssColor('rgb(230, 57, 70)')       // { r: 230, g: 57, b: 70 }
parseCssColor('rgba(230 57 70 / 0.5)')  // { r: 230, g: 57, b: 70 }
parseCssColor('rgb(100%, 0%, 0%)')      // { r: 255, g: 0, b: 0 }
```

サポートされていない形式に対してはエラーをスローします（`"red"` のような名前付きカラーや、`hsl()` 文字列などはサポートされていません — HSLの場合は事前に `hslToRgb()` で変換してください）。

---

## hexToRgb()

16進数色文字列をRGBオブジェクトに解析します。

```ts
function hexToRgb(hex: string): RGB
```

`#RGB`、`#RGBA`、`#RRGGBB`、`#RRGGBBAA`（先頭の `#` の有無は問わない）を受け付けます。アルファコンポーネントは解析されますが破棄されます。

### 使用例

```ts
import { hexToRgb } from 'chromanopia'

hexToRgb('#e63946')   // { r: 230, g: 57, b: 70 }
hexToRgb('e63946')    // { r: 230, g: 57, b: 70 }（# はオプション）
hexToRgb('#F00')      // { r: 255, g: 0, b: 0 }   （3桁）
hexToRgb('#e63946ff') // { r: 230, g: 57, b: 70 } （8桁、アルファは破棄）
```

無効な入力に対しては `Error` をスローします — 文字列全体が検証されるため、`#12gggg` のような部分的に有効な文字列は拒否されます（`parseInt` のプレフィックス解析による暗黙の許容はありません）。

---

## rgbToHex()

RGBオブジェクトを `#` プレフィックス付きの6桁16進数文字列に変換します。

```ts
function rgbToHex(rgb: RGB): string
```

チャンネル値は [0, 255] にクランプされ、丸められます。

### 使用例

```ts
import { rgbToHex } from 'chromanopia'

rgbToHex({ r: 230, g: 57, b: 70 }) // '#e63946'
rgbToHex({ r: 0, g: 0, b: 0 })     // '#000000'
rgbToHex({ r: 300, g: -5, b: 0 })  // '#ff0000'（クランプ）
rgbToHex({ r: 127.6, g: 0, b: 0 }) // '#800000'（丸め）
```

---

## rgbToHsl()

RGB色をHSLに変換します。

```ts
function rgbToHsl(rgb: RGB): HSL
```

`{ h, s, l }` を返します。`h` は度数 [0, 360) の色相、`s`/`l` は [0, 1] の範囲の分数としての彩度と輝度です。

### 使用例

```ts
import { rgbToHsl } from 'chromanopia'

rgbToHsl({ r: 255, g: 0, b: 0 })   // { h: 0,   s: 1, l: 0.5 }（赤）
rgbToHsl({ r: 0, g: 255, b: 0 })   // { h: 120, s: 1, l: 0.5 }（緑）
rgbToHsl({ r: 0, g: 0, b: 255 })   // { h: 240, s: 1, l: 0.5 }（青）
rgbToHsl({ r: 128, g: 128, b: 128 }) // { h: 0, s: 0, l: 0.5 }（グレー → s: 0）
```

---

## hslToRgb()

HSL色をRGBに変換します。

```ts
function hslToRgb(hsl: HSL): RGB
```

範囲外の `h` は360を法として正規化されます。`s` と `l` は [0, 1] にクランプされます。

### 使用例

```ts
import { hslToRgb } from 'chromanopia'

hslToRgb({ h: 0,   s: 1, l: 0.5 }) // { r: 255, g: 0,   b: 0   }（赤）
hslToRgb({ h: 120, s: 1, l: 0.5 }) // { r: 0,   g: 255, b: 0   }（緑）
hslToRgb({ h: 480, s: 1, l: 0.5 }) // { r: 0,   g: 255, b: 0   }（480° ≡ 120°）
hslToRgb({ h: 0,   s: 0, l: 0.5 }) // { r: 128, g: 128, b: 128 }（グレー）
```

`rgbToHsl` と `hslToRgb` は正確にラウンドトリップします（最悪のケースでも8ビット精度の範囲でチャンネル誤差は0です）。
