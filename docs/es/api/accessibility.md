# Utilidades de accesibilidad

Utilidades de accesibilidad construidas sobre el núcleo de simulación: relación de contraste WCAG, distancia de color perceptual, luminancia relativa y una comprobación de "¿son estos dos colores distinguibles bajo una deficiencia?".

Esta es la razón típica por la que se recurre a una librería de deficiencia visual cromática en primer lugar — más allá de simplemente *mostrar* lo que ve una persona con daltonismo, puedes *probar* si tu paleta es utilizable.

---

## contrastRatio()

Relación de contraste WCAG 2.x entre dos colores.

```ts
function contrastRatio(
  a: string | RGB,
  b: string | RGB,
): number
```

Devuelve un valor en **[1, 21]**, donde 1 es idéntico y 21 es negro contra blanco. Acepta cualquier forma de color que [`toRgb()`](./color-conversion) entienda: cadenas hex, `rgb()`/`rgba()`, RGB u objetos HSL.

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `a` | `string \| RGB` | Sí | Primer color (hex, `rgb()`, RGB u objeto HSL) |
| `b` | `string \| RGB` | Sí | Segundo color (mismas formas que `a`) |

### Ejemplos

```ts
import { contrastRatio } from 'chromanopia'

contrastRatio('#ffffff', '#000000') // 21
contrastRatio('#ffffff', '#767676') // ≈ 4.54 (cumple WCAG AA para texto del cuerpo)
contrastRatio('#777777', '#ffffff') // ≈ 4.48 (el orden no importa)
contrastRatio('#e63946', '#e63946') // 1 (idéntico)
```

### Umbrales WCAG

| Proporción | Nivel | Caso de uso |
|---|---|---|
| ≥ 7 | AAA | Texto del cuerpo < 18pt |
| ≥ 4.5 | AA | Texto del cuerpo < 18pt |
| ≥ 3 | AA | Texto grande ≥ 18pt, o componentes de UI |

---

## colorDistance()

Distancia euclídea en sRGB [0,255]³ entre dos colores. Barata y monotónica con la diferencia perceptual; úsala para ordenación rápida, no para un ΔE perceptualmente uniforme.

```ts
function colorDistance(
  a: string | RGB,
  b: string | RGB,
): number
```

### Ejemplos

```ts
import { colorDistance } from 'chromanopia'

colorDistance('#ff0000', '#00ff00') // ≈ 360.6 (rojo contra verde)
colorDistance('#e63946', '#e63946') // 0 (idéntico)
colorDistance('#000000', '#010101') // ≈ 1.73
```

---

## isDistinguishable()

Devuelve `true` si dos colores siguen siendo distinguibles tras simular una deficiencia dada — es decir, si su distancia sRGB tras la simulación alcanza un `threshold` (umbral).

```ts
function isDistinguishable(
  a: string | RGB,
  b: string | RGB,
  type: ColorblindType,
  options?: SimulateOptions,
  threshold?: number, // default 30
): boolean
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `a` | `string \| RGB` | Sí | Primer color |
| `b` | `string \| RGB` | Sí | Segundo color |
| `type` | `ColorblindType` | Sí | Deficiencia a simular. Usa `"none"` para la distancia con visión normal. |
| `options` | `SimulateOptions` | No | Modelo/severidad de simulación (por defecto Machado, severidad 1) |
| `threshold` | `number` | No | Distancia euclídea sRGB mínima para considerar los colores distinguibles. Por defecto `30`. |

### Ejemplos

```ts
import { isDistinguishable } from 'chromanopia'

// El naranja #f77f00 y el verde #1d9c1d parecen claramente diferentes con visión normal...
isDistinguishable('#f77f00', '#1d9c1d', 'none')       // true
// ...pero colapsan al mismo tono para un protánope:
isDistinguishable('#f77f00', '#1d9c1d', 'protanopia') // false

// Ajusta el umbral para tu caso de uso (más bajo = más estricto):
isDistinguishable('#aabbcc', '#112233', 'deuteranopia', {}, 50) // más estricto
```

### Elegir un umbral

El valor por defecto `30` corresponde a una diferencia claramente visible en una pantalla sRGB. Para UI crítica (indicadores de estado, series de gráficos que no deben confundirse), usa un umbral mayor (50–80). Para detectar "aproximadamente el mismo color", bájalo.

---

## relativeLuminance()

Luminancia relativa de un color sRGB, según WCAG 2.x / Rec. 709. Devuelve un valor en [0, 1] donde 0 es negro y 1 es blanco. Usa la misma linealización sRGB que el resto de la librería.

```ts
function relativeLuminance(
  r: number,
  g: number,
  b: number,
): number
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `r` | `number` | Sí | Canal rojo, 0–255 |
| `g` | `number` | Sí | Canal verde, 0–255 |
| `b` | `number` | Sí | Canal azul, 0–255 |

### Ejemplos

```ts
import { relativeLuminance } from 'chromanopia'

relativeLuminance(0, 0, 0)       // 0
relativeLuminance(255, 255, 255) // 1
relativeLuminance(255, 0, 0)     // 0.2126 (rojo)
relativeLuminance(0, 255, 0)     // 0.7152 (verde — mayor peso)
relativeLuminance(0, 0, 255)     // 0.0722 (azul)
```

`contrastRatio()` está implementado en términos de esta función.
