# Poređenje prikaza

Uporedite originalne i simulirane slike jednu pored druge sa pokretnim razdelnim prikazom. Ovo je najintuitivniji način da vidite kako poremećaj kolornog vida utiče na percepciju.

<script setup>
import SplitComparison from '../../.vitepress/theme/components/SplitComparison.vue'
</script>

<ClientOnly>
  <SplitComparison />
</ClientOnly>

## Na šta obratiti pažnju

Povucite ručicu da otkrijete originalnu (levo) i simuliranu (desno) sliku. Obratite pažnju kako:

- **Protanopija / Deuteranopija** — crvene i zelene postaju nerazlučive, sažimajući se u žute i braon nijanse
- **Tritanopija** — plave i žute se spajaju, dok crvene i zelene ostaju vidljive
- **Ahromatopsija** — sve informacije o boji su izgubljene, ostaje samo svetlost
- **Parcijalne varijante** (anomalija) — boje se pomeraju ali ostaju delimično razlučive

## Saveti

- **Otpremite sopstvenu sliku** — testirajte snimke ekrana vaše aplikacije, grafikone ili dizajne korisničkog interfejsa
- **Podesite jačinu** — klizite od 0 do 1 da vidite postepenu progresiju
- **Isprobajte deuteranomaliju prvo** — to je najčešći CVD tip (~5% muškaraca)

## Pravljenje ovoga u React-u

Za React aplikacije, [`use-split-view`](https://github.com/NemeZZiZZ/use-split-view) headless hook pruža isto split-view korisničko iskustvo sa zumiranjem, pomeranjem i podrškom za dodir:

```tsx
import { useSplitView } from 'use-split-view'
import { simulateBuffer } from 'chromanopia'

function CVDCompare({ imageData }: { imageData: ImageData }) {
  const { containerRef, handleProps, split, getPaneState } = useSplitView({
    direction: 'horizontal',
    initialSplit: 50,
  })

  const simulated = useMemo(() => {
    const copy = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    )
    simulateBuffer(copy.data, 'protanopia')
    return copy
  }, [imageData])

  const startPane = getPaneState('start')
  const endPane = getPaneState('end')

  return (
    <div ref={containerRef} style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ clipPath: startPane.clipPath }}>
        <CanvasRenderer data={imageData} />
      </div>
      <div style={{ position: 'absolute', inset: 0, clipPath: endPane.clipPath }}>
        <CanvasRenderer data={simulated} />
      </div>
      <div {...handleProps} className="handle" />
    </div>
  )
}
```

Pogledajte kompletan recept u [Recepti → React Split View](/sr/guide/recipes#react-split-view-sa-use-split-view).
