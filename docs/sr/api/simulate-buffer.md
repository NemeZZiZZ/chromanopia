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

Funkcija obrađuje 4 bajta odjednom bez alokacija unutar kritične petlje. Performanse se linearno skaliraju sa brojem piksela. U zagrejanom JavaScript mašini, očekujte otprilike:

| Rezolucija | Pikseli | Viénot | Machado | Brettel |
|---|---|---|---|---|
| 640×480 | 0.3M | ~80ms | ~85ms | ~100ms |
| 1920×1080 | 2.1M | ~590ms | ~560ms | ~660ms |
| 3840×2160 | 8.3M | ~2.4s | ~2.2s | ~2.6s |

*Jedna referentna tačka — Apple M1, Node 22, zagrejan JIT. Sva tri modela rade sa otprilike ~3.5 Mpix/s; Brettelova CIE xyY projekcija po pikselu je samo ~15–20% sporija od matrične putanje, a ne razlika od nekoliko puta koja bi se mogla očekivati na osnovu njene prednosti u tačnosti.*

::: tip
Ovo su CPU/JavaScript vremena. Za obradu slika u realnom vremenu, [WebGL šejder](../guide/recipes#webgl-šejder-uniform) pokreće istu matricu na GPU-u sa 10–100× većom propusnošću. Gore navedeni brojevi su u redu za jednokratne transformacije (npr. obrada otpremljene slike jednom).
:::
