# simulateBuffer()

Primenjuje simulaciju daltonizma na RGBA bafer piksela **na licu mesta**. Ovo je osnovna funkcija za obradu slika.

## Potpis

```ts
function simulateBuffer(
  pixels: Uint8Array | Uint8ClampedArray,
  type: ColorblindType,
  options?: SimulateOptions,
): void
```

**Menja ulazni bafer na licu mesta.** Ako treba da sačuvate original, prvo ga klonirajte.

## Parametri

| Parametar | Tip | Obavezno | Opis |
|---|---|---|---|
| `pixels` | `Uint8Array \| Uint8ClampedArray` | Da | RGBA bafer piksela. Dužina mora biti deljiva sa 4. |
| `type` | `ColorblindType` | Da | Tip poremećaja za simulaciju |
| `options.model` | `ColorblindModel` | Ne | `"machado"` (podrazumevano), `"vienot"`, ili `"brettel"` |
| `options.severity` | `number` | Ne | 0–1, podrazumevano `1`. Ograničava se na validan opseg. |

## Primeri

### Canvas ImageData

```ts
import { simulateBuffer } from 'chromanopia'

const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'protanopia')
ctx.putImageData(imageData, 0, 0)
```

### Čuvanje originala

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

### Node.js Buffer (Sharp)

```ts
const { data, info } = await sharp('photo.jpg')
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

// Buffer proširuje Uint8Array — radi direktno
simulateBuffer(data, 'tritanopia', { model: 'brettel' })
```

### Sa jačinom

```ts
simulateBuffer(pixels, 'protanomaly', { severity: 0.5 })
```

## Ponašanje

- **Alfa kanal je očuvan** — menjaju se samo R, G, B bajtovi (svaki 4. bajt se preskače)
- Kada je `type` jednako `"none"` ili `severity` jednako `0`, vraća se odmah (bez obrade)
- Za matrične modele (Viénot, Machado): sRGB → linearno → množenje matricom → mapiranje gamuta → sRGB
- Za Brettel: sRGB → linearno → XYZ → xyY projekcija → XYZ → linearno → sRGB
- Za Brettel sa ahromatopsijom/ahromatomalijom: prelazi na Machado matricu

## Performanse

Funkcija obrađuje 4 bajta odjednom bez alokacija unutar kritične petlje. Performanse se linearno skaliraju sa brojem piksela:

| Rezolucija | Pikseli | Machado | Brettel |
|---|---|---|---|
| 640×480 | 307K | ~2ms | ~8ms |
| 1920×1080 | 2.1M | ~12ms | ~45ms |
| 3840×2160 | 8.3M | ~50ms | ~180ms |

*Mereno na Apple M1, jednonitno. Vaši rezultati mogu varirati.*
