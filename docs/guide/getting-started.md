# Getting Started

## Installation

::: code-group
```bash [npm]
npm install chromanopia
```
```bash [pnpm]
pnpm add chromanopia
```
```bash [yarn]
yarn add chromanopia
```
:::

## Quick Start

### Simulate a single color

```ts
import { simulate } from 'chromanopia'

// Hex string in → hex string out
simulate('#e63946', 'protanopia')
// → '#6c6545'

// RGB object in → RGB object out
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 108, g: 101, b: 69 }
```

### Choose a model and severity

```ts
simulate('#e63946', 'protanopia', {
  model: 'brettel',   // 'machado' (default), 'vienot', or 'brettel'
  severity: 0.7,       // 0 (normal) to 1 (full deficiency)
})
```

### Process an image (Canvas)

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'deuteranopia')
ctx.putImageData(imageData, 0, 0)
```

### Get a raw matrix (for WebGL / Sharp)

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('tritanopia', { model: 'machado', severity: 0.5 })
// → [1.127764, -0.0383745, -0.0893895, -0.0392055, 0.9654045, 0.073801, 0.0023665, 0.3456835, 0.65195]
```

## How it works

The simulation pipeline:

1. **Input** — hex string or RGB object (0–255 per channel)
2. **sRGB → Linear** — removes gamma curve using a pre-computed 256-entry LUT
3. **Simulation** — applies the selected model's transformation in linear light
4. **Gamut mapping** — desaturates out-of-gamut colors toward their luminance (Rec. 709)
5. **Linear → sRGB** — re-applies gamma curve
6. **Output** — same format as input

This ensures physically correct results. Many other libraries skip steps 2, 4, and 5, which produces visibly incorrect output, especially for saturated colors.

## What's next?

- Try the [interactive demos](/demo/color-picker) to see it in action
- Read about the [three models](/guide/models) and when to use each
- Check the [recipes](/guide/recipes) for Canvas, Sharp, and WebGL integration
- Browse the full [API reference](/api/simulate)
