# Selector de colores

Elige cualquier color y observa cómo aparece bajo los 8 tipos de deficiencia visual cromática. Cambia el modelo y la severidad para explorar las diferencias.

<script setup>
import ColorPicker from '../../.vitepress/theme/components/ColorPicker.vue'
</script>

<ClientOnly>
  <ColorPicker />
</ClientOnly>

## Lo que estás viendo

Cada muestra de color muestra el resultado de `simulate(color, type, { model, severity })`:

- **Visión normal** — el color original, sin cambios
- **Protanopía / Protanomalía** — respuesta del cono L (rojo) reducida o ausente
- **Deuteranopía / Deuteranomalía** — respuesta del cono M (verde) reducida o ausente
- **Tritanopía / Tritanomalía** — respuesta del cono S (azul) reducida o ausente
- **Acromatopsia / Acromatoamalía** — pérdida total o parcial de la función de todos los conos

## Prueba estos colores

| Color | Por qué es interesante |
|---|---|
| `#e63946` (rojo) | Cambia dramáticamente para los tipos protan/deutan |
| `#2a9d8f` (verde azulado) | Difícil de distinguir del gris en deuteranopía |
| `#f4a261` (naranja) | Se confunde con amarillo en deficiencias protan |
| `#6a4c93` (púrpura) | Se confunde con azul en tipos deutan/protan |
| `#00ff00` (verde puro) | Casi invisible en deuteranopía |

## Código

```ts
import { simulate } from 'chromanopia'

// El código detrás de cada muestra:
const result = simulate('#e63946', 'protanopia', {
  model: 'machado',
  severity: 1,
})
// → '#6c6545'
```
