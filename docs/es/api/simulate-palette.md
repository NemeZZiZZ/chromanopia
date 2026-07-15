# simulatePalette()

Simula una paleta completa de colores en una sola llamada. Cada entrada se simula de forma independiente, y los tipos de salida se conservan por elemento (una entrada de cadena hex produce una salida de cadena hex; un objeto RGB produce un objeto RGB). Las paletas mixtas son compatibles.

Esto evita la sobrecarga de asignación por color que conlleva llamar a [`simulate()`](./simulate) en un bucle, y es el punto de entrada recomendado para comprobaciones de accesibilidad por lotes.

## Firma

```ts
function simulatePalette<T extends string | RGB>(
  colors: readonly T[],
  type: ColorblindType,
  options?: SimulateOptions,
): T[]
```

## Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `colors` | `readonly (string \| RGB)[]` | Sí | Arreglo de colores. Cada uno puede ser una cadena hex o un objeto RGB. |
| `type` | `ColorblindType` | Sí | Tipo de deficiencia a simular |
| `options.model` | `ColorblindModel` | No | `"machado"` (por defecto), `"vienot"`, o `"brettel"` |
| `options.severity` | `number` | No | 0–1, por defecto `1`. Se ajusta al rango válido. |

## Devuelve

Un **nuevo arreglo** de la misma longitud que la entrada. El arreglo de entrada nunca se modifica. Cada elemento conserva el tipo del elemento de entrada correspondiente.

## Ejemplos

### Simular una paleta de sistema de diseño

```ts
import { simulatePalette } from 'chromanopia'

const brand = ['#e63946', '#457b9d', '#1d3557']
const simulated = simulatePalette(brand, 'protanopia')
// → ['#6c6545', '#6b7a9f', '#263758']
```

### Los tipos mixtos se conservan

```ts
const mixed = simulatePalette(
  ['#ff0000', { r: 0, g: 0, b: 255 }],
  'deuteranopia',
)
// → [ '#a29000', { r: 0, g: 66, b: 133 } ]
typeof mixed[0] // 'string'
typeof mixed[1] // 'object'
```

### Con modelo y severidad

```ts
simulatePalette(brand, 'protanomaly', { model: 'brettel', severity: 0.6 })
```

### Paleta vacía

```ts
simulatePalette([], 'protanopia') // → []
```

## Comportamiento

- Cuando `type` es `"none"`, devuelve copias de las entradas (nunca las mismas referencias — ver [`simulate()`](./simulate)).
- Equivalente a `colors.map(c => simulate(c, type, options))`, pero evita crear un búfer de píxeles de 4 bytes desechable por color.
- Para la ruta `"none"` y entradas RGB, cada salida es una copia nueva, de modo que mutar el resultado nunca afecta a la entrada de quien llama.
