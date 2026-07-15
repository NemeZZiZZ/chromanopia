# Simulación de imágenes

Sube una imagen o usa la muestra integrada para ver cómo aparece bajo diferentes tipos de deficiencia visual cromática. Todo el procesamiento ocurre en tu navegador mediante `simulateBuffer()`.

<script setup>
import ImageSimulator from '../../.vitepress/theme/components/ImageSimulator.vue'
</script>

<ClientOnly>
  <ImageSimulator />
</ClientOnly>

## Cómo funciona

La demo usa la API de Canvas para procesar imágenes:

```ts
import { simulateBuffer } from 'chromanopia'

// Obtener datos de píxeles del canvas
const imageData = ctx.getImageData(0, 0, width, height)

// Simular in situ (modifica el búfer)
simulateBuffer(imageData.data, 'protanopia', {
  model: 'machado',
  severity: 1,
})

// Colocar los datos modificados de vuelta
ctx.putImageData(imageData, 0, 0)
```

## Rendimiento

`simulateBuffer` procesa los píxeles in situ sin asignaciones dentro del bucle principal. En un motor de JavaScript caliente, el rendimiento es aproximadamente:

| Tamaño de imagen | Machado | Brettel |
|---|---|---|
| 640×480 (VGA) | ~40ms | ~80ms |
| 1920×1080 (FHD) | ~260ms | ~520ms |
| 3840×2160 (4K) | ~1.0s | ~2.1s |

*Un punto de referencia — Apple M1, Node 22. Tus resultados en el navegador variarán. Procesar una foto típica (unos pocos megapíxeles) se siente casi instantáneo; para imágenes grandes o uso en tiempo real, considera un [Web Worker](/es/guide/recipes#navegador-offscreencanvas-web-worker) o un [shader WebGL](/es/guide/recipes#webgl-uniforme-de-shader).*

## Consejos

- **Arrastra y suelta** cualquier imagen desde tu escritorio
- Prueba **ajustar la severidad** de 0 a 1 para ver la progresión gradual
- Compara **Machado vs Brettel** — las diferencias son más visibles para tritanopía
- Las imágenes con **rojo/verde** puro muestran las diferencias más dramáticas para los tipos protan/deutan
