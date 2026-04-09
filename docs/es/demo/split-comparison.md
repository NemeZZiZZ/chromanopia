# Comparación dividida

Compara imágenes originales y simuladas lado a lado con una vista dividida arrastrable. Esta es la forma más intuitiva de ver cómo la deficiencia visual cromática afecta la percepción.

<script setup>
import SplitComparison from '../../.vitepress/theme/components/SplitComparison.vue'
</script>

<ClientOnly>
  <SplitComparison />
</ClientOnly>

## Qué observar

Arrastra el control para revelar la imagen original (izquierda) y la simulada (derecha). Observa cómo:

- **Protanopía / Deuteranopía** — los rojos y verdes se vuelven indistinguibles, colapsando en amarillos y marrones
- **Tritanopía** — los azules y amarillos se fusionan, mientras que los rojos y verdes permanecen visibles
- **Acromatopsia** — toda la información de color se pierde, solo queda la luminancia
- **Variantes parciales** (anomalía) — los colores cambian pero siguen siendo parcialmente distinguibles

## Consejos

- **Sube tu propia imagen** — prueba capturas de pantalla de tu aplicación, gráficos o diseños de UI
- **Ajusta la severidad** — desliza de 0 a 1 para ver la progresión gradual
- **Prueba deuteranomalía primero** — es el tipo de DVC más común (~5% de los hombres)

## Construir esto en React

Para aplicaciones React, el hook headless [`use-split-view`](https://github.com/NemeZZiZZ/use-split-view) proporciona la misma UX de vista dividida con zoom, desplazamiento y soporte táctil:

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

Consulta la receta completa en [Recetas → Vista dividida con React](/es/guide/recipes#react-vista-dividida-con-use-split-view).
