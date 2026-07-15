# simulatePalette()

Simulates a whole palette of colors in one call. Each input is simulated independently, and output types are preserved per element (a hex-string input yields a hex-string output; an RGB object yields an RGB object). Mixed palettes are supported.

This avoids the per-color allocation overhead of calling [`simulate()`](./simulate) in a loop and is the recommended entry point for batch accessibility checks.

## Signature

```ts
function simulatePalette<T extends string | RGB>(
  colors: readonly T[],
  type: ColorblindType,
  options?: SimulateOptions,
): T[]
```

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `colors` | `readonly (string \| RGB)[]` | Yes | Array of colors. Each may be a hex string or an RGB object. |
| `type` | `ColorblindType` | Yes | Deficiency type to simulate |
| `options.model` | `ColorblindModel` | No | `"machado"` (default), `"vienot"`, or `"brettel"` |
| `options.severity` | `number` | No | 0–1, default `1`. Clamped to valid range. |

## Returns

A **new array** of the same length as the input. The input array is never mutated. Each element keeps the type of the corresponding input element.

## Examples

### Simulate a design-system palette

```ts
import { simulatePalette } from 'chromanopia'

const brand = ['#e63946', '#457b9d', '#1d3557']
const simulated = simulatePalette(brand, 'protanopia')
// → ['#6c6545', '#6b7a9f', '#263758']
```

### Mixed types are preserved

```ts
const mixed = simulatePalette(
  ['#ff0000', { r: 0, g: 0, b: 255 }],
  'deuteranopia',
)
// → [ '#a29000', { r: 0, g: 66, b: 133 } ]
typeof mixed[0] // 'string'
typeof mixed[1] // 'object'
```

### With model and severity

```ts
simulatePalette(brand, 'protanomaly', { model: 'brettel', severity: 0.6 })
```

### Empty palette

```ts
simulatePalette([], 'protanopia') // → []
```

## Behavior

- When `type` is `"none"`, returns copies of the inputs (never the same references — see [`simulate()`](./simulate)).
- Equivalent to `colors.map(c => simulate(c, type, options))`, but avoids creating a throwaway 4-byte pixel buffer per color.
- For the `"none"` path and RGB inputs, each output is a fresh copy so mutating the result never affects the caller's input.
