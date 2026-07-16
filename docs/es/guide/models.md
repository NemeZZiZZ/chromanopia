# Modelos de simulación

chromanopia implementa tres modelos de simulación revisados por pares. Cada uno equilibra precisión y velocidad de manera diferente.

## Resumen

| Modelo | Año | Método | Velocidad | Precisión | Caso de uso |
|---|---|---|---|---|---|
| **Viénot** | 1999 | Matriz 3×3, no negativa | Más rápido | Buena | UI en tiempo real, vistas previas rápidas |
| **Machado** | 2009 | Matriz 3×3 de desplazamiento espectral | Rápido | Mejor | Opción por defecto, mejor equilibrio |
| **Brettel** | 1997 | Proyección CIE xyY por píxel | ~1.2× más lento | La mejor | Investigación, validación, referencia |

## Viénot (1999)

**Artículo:** Viénot, Brettel & Mollon — *Digital video colourmaps for checking the legibility of displays by dichromats*

- Todos los valores de la matriz son no negativos (≥ 0)
- La suma de las filas es igual a 1.0 — la luminancia se preserva perfectamente
- Cálculo más rápido: una sola multiplicación de matriz por píxel
- Ligeramente menos preciso para casos extremos y deficiencias parciales
- Ideal para: aplicaciones en tiempo real, pipelines de shaders con presupuestos ajustados

```ts
simulate('#e63946', 'protanopia', { model: 'vienot' })
```

## Machado (2009)

**Artículo:** Machado, Oliveira & Fernandes — *A physiologically-based model for simulation of color vision deficiency*

- Usa desplazamiento espectral para modelar cambios en la respuesta de los conos
- Los valores de la matriz pueden ser negativos y > 1 (extrapolación)
- Más preciso físicamente que Viénot
- El modelo por defecto en chromanopia
- Ideal para: la mayoría de los casos de uso, pruebas de accesibilidad, herramientas de diseño

```ts
simulate('#e63946', 'protanopia', { model: 'machado' })
// Esto es el valor por defecto — equivalente a:
simulate('#e63946', 'protanopia')
```

## Brettel (1997)

**Artículo:** Brettel, Viénot & Mollon — *Computerized simulation of color appearance for dichromats*

- Proyecta cada píxel sobre la línea de confusión en el espacio de color CIE xyY
- No es una sola matriz — cada píxel requiere conversión XYZ, proyección e inversión
- El modelo más preciso, especialmente para tritanopía
- ~1.2× más lento que los modelos de matriz
- Recurre a las matrices de Machado para monocromatismo de bastones (acromatopsia / acromatoamalía)
- Ideal para: investigación, salida de referencia, validación contra otras implementaciones

```ts
simulate('#e63946', 'protanopia', { model: 'brettel' })
```

::: tip
Usa `isMatrixModel(model)` para verificar si un modelo devuelve una matriz 3×3. Esto es útil para decidir entre `recomb` de Sharp (ruta de matriz) y procesamiento de búfer crudo (Brettel).
:::

## Variantes de anomalía

Cada deficiencia de conos tiene una variante parcial (anomalía):

| Deficiencia total | Variante parcial | Cono afectado |
|---|---|---|
| Protanopía | Protanomalía | L (rojo) |
| Deuteranopía | Deuteranomalía | M (verde) |
| Tritanopía | Tritanomalía | S (azul) |
| Acromatopsia | Acromatoamalía | Todos los conos (solo bastones) |

Para los modelos de matriz, la simulación de anomalías usa interpolación entre la matriz identidad y la matriz de deficiencia total.

Para Brettel, las anomalías usan una mezcla ponderada (factor 1.75/2.75) entre el color original y el color dicrómata simulado.

## Monocromatismo de bastones

La acromatopsia (daltonismo total) y la acromatoamalía (parcial) no son deficiencias específicas de conos — resultan de la ausencia o reducción total de la función de los conos. Estas usan coeficientes de luminancia Rec. 709:

```
R' = 0.2126·R + 0.7152·G + 0.0722·B
G' = 0.2126·R + 0.7152·G + 0.0722·B
B' = 0.2126·R + 0.7152·G + 0.0722·B
```

Esta matriz es compartida entre los tres modelos ya que no es específica del modelo.

<script setup>
import ModelComparison from '../../.vitepress/theme/components/ModelComparison.vue'
</script>

## Comparación interactiva

Prueba diferentes colores y tipos para ver cómo difiere cada modelo:

<ClientOnly>
  <ModelComparison />
</ClientOnly>
