# Comparación de modelos

Compara los tres modelos de simulación lado a lado. Cada modelo transforma el mismo color de entrada de manera diferente — observa la salida, la matriz subyacente y el enfoque matemático.

<script setup>
import ModelComparison from '../../.vitepress/theme/components/ModelComparison.vue'
import MatrixInspector from '../../.vitepress/theme/components/MatrixInspector.vue'
</script>

<ClientOnly>
  <ModelComparison />
</ClientOnly>

## Inspector de matrices

Inspecciona la matriz 3×3 cruda para los modelos basados en matrices (Viénot y Machado). Observa cómo la matriz cambia al ajustar la severidad — interpola linealmente entre la matriz identidad y la matriz de deficiencia total.

<ClientOnly>
  <MatrixInspector />
</ClientOnly>

## Diferencias clave

### ¿Por qué los modelos producen resultados diferentes?

Cada modelo usa un enfoque matemático diferente para simular la pérdida de conos:

- **Viénot** proyecta sobre un espacio de color reducido usando una única matriz precalculada. Los valores siempre son no negativos, así que el resultado siempre está dentro de la gama, pero la precisión se ve afectada.

- **Machado** modela el desplazamiento espectral del tipo de cono afectado. Los valores de la matriz pueden ser negativos (un color puede necesitar "tomar prestado" de otro canal), lo cual es más preciso pero puede producir valores intermedios fuera de gama.

- **Brettel** no usa una sola matriz — proyecta cada píxel individualmente en el espacio de cromaticidad CIE xyY a lo largo de la línea de confusión hacia el punto de confusión. Es el más preciso pero ~1.2× más lento.

### ¿Cuándo importan las diferencias?

Para la mayoría del trabajo de accesibilidad de UI, las diferencias son insignificantes. Se vuelven visibles para:

- **Colores saturados** (rojo puro, verde puro) — Machado y Brettel producen resultados notablemente diferentes a Viénot
- **Tritanopía** — Brettel es significativamente más preciso aquí debido a su proyección por píxel
- **Deficiencias parciales** (anomalías con severidad < 1) — los métodos de interpolación difieren entre modelos

## Código

```ts
import { simulate, getMatrix, isMatrixModel } from 'chromanopia'

// Comparar los tres modelos para un color
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
