---
layout: home
hero:
  name: chromanopia
  text: Simulación de daltonismo
  tagline: Simulación de DVC físicamente precisa para JavaScript/TypeScript. Tres modelos, cero dependencias.
  image:
    src: /logo.svg
    alt: chromanopia
  actions:
    - theme: brand
      text: Primeros pasos
      link: /es/guide/getting-started
    - theme: alt
      text: Demo interactiva
      link: /es/demo/split-comparison
    - theme: alt
      text: Referencia API
      link: /es/api/simulate
features:
  - icon: 🔬
    title: Tres modelos científicos
    details: Viénot (1999), Machado (2009) y Brettel (1997) — elige entre velocidad y precisión según tu caso de uso.
  - icon: 🎨
    title: Los 8 tipos de deficiencia
    details: Protanopía, deuteranopía, tritanopía, acromatopsia y sus variantes parciales — cobertura completa de DVC.
  - icon: 🎚️
    title: Control de severidad
    details: Interpolación suave de 0 a 1 entre visión normal y deficiencia total — simula cualquier grado de daltonismo.
  - icon: ⚡
    title: Cero dependencias
    details: Sin dependencias en tiempo de ejecución. Funciona en Node.js, navegadores, edge runtimes y Web Workers de forma nativa.
  - icon: 🖼️
    title: Tres APIs
    details: Color individual (hex o RGB), búfer de píxeles (Canvas/Sharp) y matriz 3×3 cruda (shaders WebGL).
  - icon: 🧮
    title: Ciencia del color correcta
    details: Linearización sRGB con LUT, mapeo de gama mediante desaturación por luminancia, coeficientes Rec. 709.
---
