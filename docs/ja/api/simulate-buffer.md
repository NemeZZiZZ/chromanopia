# simulateBuffer()

RGBAピクセルバッファに色覚異常シミュレーションを**インプレース**で適用します。画像処理のコア関数です。

## シグネチャ

```ts
function simulateBuffer(
  pixels: Uint8Array | Uint8ClampedArray,
  type: ColorblindType,
  options?: SimulateOptions,
): void
```

**入力バッファを変更します。** 元のデータを保持する必要がある場合は、先にクローンしてください。

## パラメータ

| パラメータ | 型 | 必須 | 説明 |
|---|---|---|---|
| `pixels` | `Uint8Array \| Uint8ClampedArray` | はい | RGBAピクセルバッファ。長さは4の倍数でなければなりません。 |
| `type` | `ColorblindType` | はい | シミュレートする色覚異常タイプ |
| `options.model` | `ColorblindModel` | いいえ | `"machado"`（デフォルト）、`"vienot"`、または `"brettel"` |
| `options.severity` | `number` | いいえ | 0〜1、デフォルト `1`。有効範囲にクランプされます。 |

## 使用例

### Canvas ImageData

```ts
import { simulateBuffer } from 'chromanopia'

const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

### 元データの保持

```ts
const original = ctx.getImageData(0, 0, canvas.width, canvas.height)
const copy = new ImageData(
  new Uint8ClampedArray(original.data),
  original.width,
  original.height,
)

simulateBuffer(copy.data, 'deuteranopia')
ctx.putImageData(copy, 0, 0)
```

### Node.js Buffer（Sharp）

```ts
const { data, info } = await sharp('photo.jpg')
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// BufferはUint8Arrayを継承 — 直接使用可能
simulateBuffer(data, 'tritanopia', { model: 'brettel' })
```

### 重症度の指定

```ts
simulateBuffer(pixels, 'protanomaly', { severity: 0.5 })
```

## 動作

- **アルファチャンネルは保持されます** — R、G、Bバイトのみが変更されます（4バイトごとにスキップ）
- `type` が `"none"` または `severity` が `0` の場合、即座に返します（処理なし）
- 行列モデル（Viénot、Machado）：sRGB → リニア → 行列乗算 → ガマットマップ → sRGB
- Brettel：sRGB → リニア → XYZ → xyY射影 → XYZ → リニア → sRGB
- Brettelで全色盲/不全色盲の場合：Machado行列にフォールバック

## パフォーマンス

この関数はホットループ内でアロケーションなしに一度に4バイトを処理します。パフォーマンスはピクセル数に比例してスケールします：

| 解像度 | ピクセル数 | Machado | Brettel |
|---|---|---|---|
| 640×480 | 307K | 約2ms | 約8ms |
| 1920×1080 | 2.1M | 約12ms | 約45ms |
| 3840×2160 | 8.3M | 約50ms | 約180ms |

*Apple M1、シングルスレッドで計測。結果は環境により異なります。*
