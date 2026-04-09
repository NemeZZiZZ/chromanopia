# Verificador de paleta

Verifica si tu paleta de colores sigue siendo distinguible bajo todos los tipos de deficiencia visual cromática. Ingresa tus colores, elige un preset y observa la relación de contraste mínima entre cualquier par.

<script setup>
import PaletteChecker from '../../.vitepress/theme/components/PaletteChecker.vue'
</script>

<ClientOnly>
  <PaletteChecker />
</ClientOnly>

## Cómo leer los resultados

Cada fila muestra tu paleta transformada por un tipo de deficiencia específico:

- **Insignia verde (≥ 3:1)** — los colores son fácilmente distinguibles
- **Insignia roja (< 2:1)** — los colores pueden confundirse; considera ajustar tu paleta

La relación es el **contraste mínimo entre pares** de cualquier par de colores en la fila. Una relación de 1:1 significa que dos colores son idénticos.

## Consejos de diseño

### Para gráficos y visualización de datos

- Usa **al menos 3:1 de contraste** entre series de datos adyacentes
- Prefiere **variación de luminancia** (claro vs oscuro) sobre variación pura de matiz
- Agrega **patrones, etiquetas o iconos** como diferenciador secundario
- Prueba tu paleta contra **deuteranomalía** (la más común, ~5% de los hombres) primero

### Para colores de estado en la UI

- No dependas únicamente de rojo/verde para éxito/error — agrega iconos o texto
- Usa **azul + naranja** en lugar de **verde + rojo** para mejor contraste en DVC
- Asegúrate de que todos los colores de estado difieran en **luminosidad**, no solo en matiz

### Combinaciones de colores seguras

Estos pares siguen siendo distinguibles en la mayoría de los tipos de DVC:

| Par | Por qué funciona |
|---|---|
| Azul + Naranja | Alto contraste de luminancia, líneas de confusión diferentes |
| Azul + Amarillo | Cono S vs L+M, solo problemático para tritanopía |
| Azul oscuro + Rosa claro | La diferencia de luminancia sobrevive a todos los tipos |
| Negro + cualquier color brillante | Acromático + cromático siempre funciona |

## Código

```ts
import { simulate } from 'chromanopia'

const palette = ['#e63946', '#f4a261', '#2a9d8f', '#264653']
const type = 'deuteranopia'

const simulated = palette.map(color => simulate(color, type))
// → ['#886b1f', '#c4a833', '#7ba065', '#3b4e4f']
// Verificar: ¿alguno de estos es demasiado similar?
```
