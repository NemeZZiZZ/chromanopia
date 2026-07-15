# Primeros pasos

## Instalación

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

## Inicio rápido

### Simular un solo color

```ts
import { simulate } from 'chromanopia'

// Cadena hex de entrada → cadena hex de salida
simulate('#e63946', 'protanopia')
// → '#6c6545'

// Objeto RGB de entrada → objeto RGB de salida
simulate({ r: 230, g: 57, b: 70 }, 'protanopia')
// → { r: 108, g: 101, b: 69 }
```

### Elegir un modelo y severidad

```ts
simulate('#e63946', 'protanopia', {
  model: 'brettel',   // 'machado' (por defecto), 'vienot', o 'brettel'
  severity: 0.7,       // 0 (normal) a 1 (deficiencia total)
})
```

### Procesar una imagen (Canvas)

```ts
import { simulateBuffer } from 'chromanopia'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

simulateBuffer(imageData.data, 'deuteranopia')
ctx.putImageData(imageData, 0, 0)
```

### Obtener una matriz cruda (para WebGL / Sharp)

```ts
import { getMatrix } from 'chromanopia'

const matrix = getMatrix('tritanopia', { model: 'machado', severity: 0.5 })
// → [1.127764, -0.0383745, -0.0893895, -0.0392055, 0.9654045, 0.073801, 0.0023665, 0.3456835, 0.65195]
```

## Cómo funciona

El pipeline de simulación:

1. **Entrada** — cadena hex u objeto RGB (0–255 por canal)
2. **sRGB → Lineal** — elimina la curva gamma usando una LUT precalculada de 256 entradas
3. **Simulación** — aplica la transformación del modelo seleccionado en luz lineal
4. **Mapeo de gama** — desatura los colores fuera de gama hacia su luminancia (Rec. 709)
5. **Lineal → sRGB** — reaplicar la curva gamma
6. **Salida** — mismo formato que la entrada

Esto garantiza resultados físicamente correctos. Muchas otras bibliotecas omiten los pasos 2, 4 y 5, lo que produce resultados visiblemente incorrectos, especialmente para colores saturados.

## ¿Qué sigue?

- Prueba las [demos interactivas](/es/demo/color-picker) para verlo en acción
- Lee sobre los [tres modelos](/es/guide/models) y cuándo usar cada uno
- Consulta las [recetas](/es/guide/recipes) para integración con Canvas, Sharp y WebGL
- Explora la [referencia completa de la API](/es/api/simulate)
