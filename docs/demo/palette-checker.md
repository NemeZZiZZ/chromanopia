# Palette Checker

Check whether your color palette remains distinguishable under all types of color vision deficiency. Enter your colors, pick a preset, and see the minimum contrast ratio between any pair.

<script setup>
import PaletteChecker from '../.vitepress/theme/components/PaletteChecker.vue'
</script>

<ClientOnly>
  <PaletteChecker />
</ClientOnly>

## How to read the results

Each row shows your palette transformed by a specific deficiency type:

- **Green badge (≥ 3:1)** — colors are easily distinguishable
- **Red badge (< 2:1)** — colors may be confused; consider adjusting your palette

The ratio is the **minimum pairwise contrast** between any two colors in the row. A ratio of 1:1 means two colors are identical.

## Design tips

### For charts and data visualization

- Use **at least 3:1 contrast** between adjacent data series
- Prefer **luminance variation** (light vs dark) over pure hue variation
- Add **patterns, labels, or icons** as a secondary differentiator
- Test your palette against **deuteranomaly** (most common, ~5% of males) first

### For UI status colors

- Don't rely solely on red/green for success/error — add icons or text
- Use **blue + orange** instead of **green + red** for better CVD contrast
- Ensure all status colors differ in **lightness**, not just hue

### Safe color combinations

These pairs remain distinguishable across most CVD types:

| Pair | Why it works |
|---|---|
| Blue + Orange | High luminance contrast, different confusion lines |
| Blue + Yellow | S-cone vs L+M, only problematic for tritanopia |
| Dark blue + Light pink | Luminance difference survives all types |
| Black + any bright color | Achromatic + chromatic always works |

## Code

```ts
import { simulate } from 'chromanopia'

const palette = ['#e63946', '#f4a261', '#2a9d8f', '#264653']
const type = 'deuteranopia'

const simulated = palette.map(color => simulate(color, type))
// → ['#886b1f', '#c4a833', '#7ba065', '#3b4e4f']
// Check: are any of these too similar?
```
