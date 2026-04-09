# Сравнение с разделением

Сравните оригинальное и симулированное изображения рядом с перетаскиваемым разделителем. Это самый наглядный способ увидеть, как нарушения цветового зрения влияют на восприятие.

<script setup>
import SplitComparison from '../../.vitepress/theme/components/SplitComparison.vue'
</script>

<ClientOnly>
  <SplitComparison />
</ClientOnly>

## На что обратить внимание

Перетащите ручку, чтобы увидеть оригинальное (слева) и симулированное (справа) изображение. Обратите внимание:

- **Протанопия / Дейтеранопия** — красные и зелёные становятся неразличимыми, сливаясь в жёлтые и коричневые
- **Тританопия** — синие и жёлтые сливаются, а красные и зелёные остаются видимыми
- **Ахроматопсия** — вся цветовая информация теряется, остаётся только яркость
- **Частичные варианты** (аномалии) — цвета смещаются, но остаются частично различимыми

## Советы

- **Загрузите своё изображение** — протестируйте скриншоты вашего приложения, графики или дизайн UI
- **Регулируйте степень** — двигайте от 0 до 1, чтобы увидеть постепенное изменение
- **Попробуйте сначала дейтераномалию** — это наиболее распространённый тип CVD (~5% мужчин)

## Реализация на React

Для React-приложений headless-хук [`use-split-view`](https://github.com/NemeZZiZZ/use-split-view) предоставляет такой же UX разделённого вида с поддержкой масштабирования, панорамирования и сенсорного ввода:

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

Полный рецепт смотрите в [Рецепты — React Split View](/ru/guide/recipes#react-split-view-с-use-split-view).
