# Model Comparison

Compare the three simulation models side by side. Each model transforms the same input color differently — see the output, the underlying matrix, and the mathematical approach.

<script setup>
import ModelComparison from '../.vitepress/theme/components/ModelComparison.vue'
import MatrixInspector from '../.vitepress/theme/components/MatrixInspector.vue'
</script>

<ClientOnly>
  <ModelComparison />
</ClientOnly>

## Matrix Inspector

Inspect the raw 3×3 matrix for matrix-based models (Viénot and Machado). Watch how the matrix changes as you adjust severity — it interpolates linearly between the identity matrix and the full deficiency matrix.

<ClientOnly>
  <MatrixInspector />
</ClientOnly>

## Key differences

### Why do models produce different results?

Each model uses a different mathematical approach to simulate cone loss:

- **Viénot** projects onto a reduced color space using a single pre-computed matrix. Values are always non-negative, so the result is always inside gamut, but precision suffers.

- **Machado** models the spectral shift of the affected cone type. Matrix values can be negative (a color may need to "borrow" from another channel), which is more accurate but can produce out-of-gamut intermediate values.

- **Brettel** doesn't use a single matrix at all — it projects each pixel individually in CIE xyY chromaticity space along the confusion line toward the confusion point. This is the most accurate but ~1.2× slower.

### When do the differences matter?

For most UI accessibility work, the differences are negligible. They become visible for:

- **Saturated colors** (pure red, pure green) — Machado and Brettel produce noticeably different results than Viénot
- **Tritanopia** — Brettel is significantly more accurate here due to its per-pixel projection
- **Partial deficiencies** (anomalies at severity < 1) — the interpolation methods differ between models

## Code

```ts
import { simulate, getMatrix, isMatrixModel } from 'chromanopia'

// Compare all three models for one color
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
