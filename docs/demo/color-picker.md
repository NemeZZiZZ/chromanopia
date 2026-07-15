# Color Picker

Pick any color and see how it appears under all 8 types of color vision deficiency. Change the model and severity to explore the differences.

<script setup>
import ColorPicker from '../.vitepress/theme/components/ColorPicker.vue'
</script>

<ClientOnly>
  <ColorPicker />
</ClientOnly>

## What you're seeing

Each swatch shows the result of `simulate(color, type, { model, severity })`:

- **Normal Vision** — the original color, unchanged
- **Protanopia / Protanomaly** — reduced or absent L-cone (red) response
- **Deuteranopia / Deuteranomaly** — reduced or absent M-cone (green) response
- **Tritanopia / Tritanomaly** — reduced or absent S-cone (blue) response
- **Achromatopsia / Achromatomaly** — total or partial loss of all cone function

## Try these colors

| Color | Why it's interesting |
|---|---|
| `#e63946` (red) | Dramatically shifts for protan/deutan types |
| `#2a9d8f` (teal) | Hard to distinguish from gray in deuteranopia |
| `#f4a261` (orange) | Confused with yellow in protan deficiencies |
| `#6a4c93` (purple) | Confused with blue in deutan/protan types |
| `#00ff00` (pure green) | Almost invisible in deuteranopia |

## Code

```ts
import { simulate } from 'chromanopia'

// The code behind each swatch:
const result = simulate('#e63946', 'protanopia', {
  model: 'machado',
  severity: 1,
})
// → '#6c6545'
```
