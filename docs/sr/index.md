---
layout: home
hero:
  name: chromanopia
  text: Simulacija daltonizma
  tagline: Fizički precizna simulacija poremećaja kolornog vida za JavaScript/TypeScript. Tri modela, nula zavisnosti.
  image:
    src: /logo.svg
    alt: chromanopia
  actions:
    - theme: brand
      text: Početak rada
      link: /sr/guide/getting-started
    - theme: alt
      text: Interaktivni demo
      link: /sr/demo/split-comparison
    - theme: alt
      text: API referenca
      link: /sr/api/simulate
features:
  - icon: 🔬
    title: Tri naučna modela
    details: Viénot (1999), Machado (2009) i Brettel (1997) — izaberite između brzine i preciznosti za vaš slučaj upotrebe.
  - icon: 🎨
    title: Svih 8 tipova poremećaja
    details: Protanopija, deuteranopija, tritanopija, ahromatopsija i njihove parcijalne varijante — potpuna pokrivenost CVD.
  - icon: 🎚️
    title: Klizač jačine
    details: Glatka interpolacija 0–1 između normalnog vida i potpunog poremećaja — simulirajte bilo koji stepen daltonizma.
  - icon: ⚡
    title: Nula zavisnosti
    details: Bez runtime zavisnosti. Radi u Node.js, pregledačima, edge okruženjima i Web Worker-ima bez dodatne konfiguracije.
  - icon: 🖼️
    title: Tri API-ja
    details: Pojedinačna boja (hex ili RGB), bafer piksela (Canvas/Sharp) i sirova 3×3 matrica (WebGL šejderi).
  - icon: 🧮
    title: Korektna nauka o bojama
    details: sRGB linearizacija sa LUT tabelom, mapiranje gamuta putem desaturacije svetlosti, Rec. 709 koeficijenti.
---
