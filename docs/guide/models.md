# Simulation Models

chromanopia implements three peer-reviewed simulation models. Each trades accuracy for speed differently.

## Overview

| Model | Year | Method | Speed | Accuracy | Use case |
|---|---|---|---|---|---|
| **Viénot** | 1999 | 3×3 matrix, non-negative | Fastest | Good | Real-time UI, quick previews |
| **Machado** | 2009 | 3×3 spectral-shift matrix | Fast | Better | Default choice, best balance |
| **Brettel** | 1997 | Per-pixel CIE xyY projection | ~1.2× slower | Best | Research, validation, reference |

## Viénot (1999)

**Paper:** Viénot, Brettel & Mollon — *Digital video colourmaps for checking the legibility of displays by dichromats*

- All matrix values are non-negative (≥ 0)
- Row sums equal 1.0 — luminance is perfectly preserved
- Fastest computation: single matrix multiply per pixel
- Slightly less accurate for edge cases and partial deficiencies
- Best for: real-time applications, shader pipelines with tight budgets

```ts
simulate('#e63946', 'protanopia', { model: 'vienot' })
```

## Machado (2009)

**Paper:** Machado, Oliveira & Fernandes — *A physiologically-based model for simulation of color vision deficiency*

- Uses spectral shift to model cone response changes
- Matrix values can be negative and > 1 (extrapolation)
- More physically accurate than Viénot
- The default model in chromanopia
- Best for: most use cases, accessibility testing, design tools

```ts
simulate('#e63946', 'protanopia', { model: 'machado' })
// This is the default — equivalent to:
simulate('#e63946', 'protanopia')
```

## Brettel (1997)

**Paper:** Brettel, Viénot & Mollon — *Computerized simulation of color appearance for dichromats*

- Projects each pixel onto the confusion line in CIE xyY color space
- Not a single matrix — each pixel requires XYZ conversion, projection, and inverse
- Most accurate model, especially for tritanopia
- ~1.2× slower than matrix models
- Falls back to Machado matrices for rod monochromacy (achromatopsia / achromatomaly)
- Best for: research, reference output, validation against other implementations

```ts
simulate('#e63946', 'protanopia', { model: 'brettel' })
```

::: tip
Use `isMatrixModel(model)` to check whether a model returns a 3×3 matrix. This is useful when deciding between Sharp `recomb` (matrix path) and raw buffer processing (Brettel).
:::

## Anomaly variants

Each cone deficiency has a partial variant (anomaly):

| Full deficiency | Partial variant | Affected cone |
|---|---|---|
| Protanopia | Protanomaly | L (red) |
| Deuteranopia | Deuteranomaly | M (green) |
| Tritanopia | Tritanomaly | S (blue) |
| Achromatopsia | Achromatomaly | All cones (rods only) |

For matrix models, anomaly simulation uses interpolation between the identity matrix and the full deficiency matrix.

For Brettel, anomalies use a weighted blend (1.75/2.75 factor) between the original color and the simulated dichromat color.

## Rod monochromacy

Achromatopsia (total color blindness) and achromatomaly (partial) are not cone-specific deficiencies — they result from absent or reduced cone function entirely. These use Rec. 709 luminance coefficients:

```
R' = 0.2126·R + 0.7152·G + 0.0722·B
G' = 0.2126·R + 0.7152·G + 0.0722·B
B' = 0.2126·R + 0.7152·G + 0.0722·B
```

This matrix is shared across all three models since it's not model-specific.

<script setup>
import ModelComparison from '../.vitepress/theme/components/ModelComparison.vue'
</script>

## Interactive comparison

Try different colors and types to see how each model differs:

<ClientOnly>
  <ModelComparison />
</ClientOnly>
