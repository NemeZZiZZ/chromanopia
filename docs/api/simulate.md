# simulate()

Simulates a single color as seen by a person with a specific color vision deficiency.

## Signature

```ts
function simulate<T extends string | RGB>(
  color: T,
  type: ColorblindType,
  options?: SimulateOptions,
): T
```

**Returns the same type as the input**: hex string in → hex string out, RGB object in → RGB object out.

## Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `color` | `string \| RGB` | Yes | Hex string (`"#e63946"`, `"e63946"`, `"#F00"`) or RGB object `{ r, g, b }` (0–255) |
| `type` | `ColorblindType` | Yes | Deficiency type to simulate |
| `options.model` | `ColorblindModel` | No | `"machado"` (default), `"vienot"`, or `"brettel"` |
| `options.severity` | `number` | No | 0 (normal vision) to 1 (full deficiency). Default: `1`. Values outside range are clamped. |

## Examples

### Hex string

```ts
import { simulate } from 'chromanopia'

simulate('#e63946', 'protanopia')
// → '#886b1f'

simulate('#F00', 'deuteranopia')
// → '#a29100'

simulate('e63946', 'tritanopia')  // # is optional
// → '#eb3636'
```

### RGB object

```ts
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 136, g: 107, b: 31 }
```

### With model and severity

```ts
simulate('#e63946', 'protanopia', { model: 'brettel', severity: 0.7 })
// → '#b36234'

simulate('#e63946', 'protanopia', { severity: 0 })
// → '#e63946' (unchanged — severity 0 = normal vision)
```

### Type `"none"` (no-op)

```ts
simulate('#e63946', 'none')
// → '#e63946' (always returns input unchanged)
```

## Behavior

- When `type` is `"none"`, returns the input unchanged (no processing)
- When `severity` is `0`, returns the input unchanged
- Internally creates a 4-pixel `Uint8ClampedArray` and delegates to `simulateBuffer`
- For hex input, parses via `hexToRgb`, converts back via `rgbToHex`
