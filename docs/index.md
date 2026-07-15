---
layout: home
hero:
  name: chromanopia
  text: Color Blindness Simulation
  tagline: Physically accurate CVD simulation for JavaScript/TypeScript. Three models, zero dependencies.
  image:
    src: /logo.svg
    alt: chromanopia
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Interactive Demo
      link: /demo/split-comparison
    - theme: alt
      text: API Reference
      link: /api/simulate
features:
  - icon: 🔬
    title: Three Scientific Models
    details: Viénot (1999), Machado (2009), and Brettel (1997) — choose between speed and accuracy for your use case.
  - icon: 🎨
    title: All 8 Deficiency Types
    details: Protanopia, deuteranopia, tritanopia, achromatopsia, and their partial variants — complete CVD coverage.
  - icon: 🎚️
    title: Severity Slider
    details: Smooth 0–1 interpolation between normal vision and full deficiency — simulate any degree of color blindness.
  - icon: ⚡
    title: Zero Dependencies
    details: No runtime dependencies. Works in Node.js, browsers, edge runtimes, and Web Workers out of the box.
  - icon: 🖼️
    title: Four APIs
    details: Single color (hex or RGB), full palette, pixel buffer (Canvas/Sharp), and raw 3×3 matrix (WebGL shaders).
  - icon: 🧮
    title: Correct Color Science
    details: sRGB linearization with LUT, gamut mapping via luminance desaturation, Rec. 709 coefficients.
---
