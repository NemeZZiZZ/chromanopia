# Simulacija slika

Otpremite sliku ili koristite ugrađeni uzorak da vidite kako izgleda pod različitim tipovima poremećaja kolornog vida. Sva obrada se dešava u vašem pregledaču putem `simulateBuffer()`.

<script setup>
import ImageSimulator from '../../.vitepress/theme/components/ImageSimulator.vue'
</script>

<ClientOnly>
  <ImageSimulator />
</ClientOnly>

## Kako funkcioniše

Demo koristi Canvas API za obradu slika:

```ts
import { simulateBuffer } from 'chromanopia'

// Dobijanje podataka piksela sa canvas-a
const imageData = ctx.getImageData(0, 0, width, height)

// Simulacija na licu mesta (menja bafer)
simulateBuffer(imageData.data, 'protanopia', {
  model: 'machado',
  severity: 1,
})

// Vraćanje modifikovanih podataka nazad
ctx.putImageData(imageData, 0, 0)
```

## Performanse

`simulateBuffer` obrađuje piksele na licu mesta bez alokacija unutar kritične petlje:

| Veličina slike | Machado/Viénot | Brettel |
|---|---|---|
| 640×480 (VGA) | ~2ms | ~8ms |
| 1920×1080 (FHD) | ~12ms | ~45ms |
| 3840×2160 (4K) | ~50ms | ~180ms |

Za velike slike, razmislite o korišćenju [Web Worker-a](/sr/guide/recipes#pregledač-offscreencanvas-web-worker) da ne biste blokirali glavnu nit.

## Saveti

- **Prevucite i otpustite** bilo koju sliku sa vašeg desktopa
- Isprobajte **podešavanje jačine** od 0 do 1 da vidite postepenu progresiju
- Uporedite **Machado naspram Brettel** — razlike su najvidljivije za tritanopiju
- Čisto **crvene/zelene** slike pokazuju najdramatičnije razlike za protan/deutan tipove
