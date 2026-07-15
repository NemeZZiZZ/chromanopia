# simulate()

Simula un solo color tal como lo vería una persona con una deficiencia visual cromática específica.

## Firma

```ts
function simulate<T extends string | RGB>(
  color: T,
  type: ColorblindType,
  options?: SimulateOptions,
): T
```

**Devuelve el mismo tipo que la entrada**: cadena hex de entrada → cadena hex de salida, objeto RGB de entrada → objeto RGB de salida.

## Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `color` | `string \| RGB` | Sí | Cadena hex (`"#e63946"`, `"e63946"`, `"#F00"`) u objeto RGB `{ r, g, b }` (0–255) |
| `type` | `ColorblindType` | Sí | Tipo de deficiencia a simular |
| `options.model` | `ColorblindModel` | No | `"machado"` (por defecto), `"vienot"`, o `"brettel"` |
| `options.severity` | `number` | No | 0 (visión normal) a 1 (deficiencia total). Por defecto: `1`. Los valores fuera de rango se ajustan. |

## Ejemplos

### Cadena hex

```ts
import { simulate } from 'chromanopia'

simulate('#e63946', 'protanopia')
// → '#6c6545'

simulate('#F00', 'deuteranopia')
// → '#a29000'

simulate('e63946', 'tritanopia')  // # es opcional
// → '#f60046'
```

### Objeto RGB

```ts
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 108, g: 101, b: 69 }
```

### Con modelo y severidad

```ts
simulate('#e63946', 'protanopia', { model: 'brettel', severity: 0.7 })
// → '#aa6d56'

simulate('#e63946', 'protanopia', { severity: 0 })
// → '#e63946' (sin cambios — severidad 0 = visión normal)
```

### Tipo `"none"` (sin operación)

```ts
simulate('#e63946', 'none')
// → '#e63946' (siempre devuelve la entrada sin cambios)
```

## Comportamiento

- Cuando `type` es `"none"`, devuelve la entrada sin cambios (sin procesamiento)
- Cuando `severity` es `0`, devuelve la entrada sin cambios
- Internamente crea un `Uint8ClampedArray` de 4 píxeles y delega a `simulateBuffer`
- Para entrada hex, parsea con `hexToRgb`, convierte de vuelta con `rgbToHex`
