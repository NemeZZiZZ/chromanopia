---
layout: home
hero:
  name: chromanopia
  text: Симуляция дальтонизма
  tagline: Физически точная симуляция нарушений цветового зрения для JavaScript/TypeScript. Три модели, ноль зависимостей.
  image:
    src: /logo.svg
    alt: chromanopia
  actions:
    - theme: brand
      text: Начать
      link: /ru/guide/getting-started
    - theme: alt
      text: Интерактивное демо
      link: /ru/demo/split-comparison
    - theme: alt
      text: Справочник API
      link: /ru/api/simulate
features:
  - icon: 🔬
    title: Три научные модели
    details: Viénot (1999), Machado (2009) и Brettel (1997) — выбирайте между скоростью и точностью для вашей задачи.
  - icon: 🎨
    title: Все 8 типов нарушений
    details: Протанопия, дейтеранопия, тританопия, ахроматопсия и их частичные варианты — полное покрытие CVD.
  - icon: 🎚️
    title: Регулировка степени
    details: Плавная интерполяция 0–1 между нормальным зрением и полным нарушением — симуляция любой степени дальтонизма.
  - icon: ⚡
    title: Ноль зависимостей
    details: Без runtime-зависимостей. Работает в Node.js, браузерах, edge-рантаймах и Web Workers из коробки.
  - icon: 🖼️
    title: Три API
    details: Один цвет (hex или RGB), пиксельный буфер (Canvas/Sharp) и матрица 3×3 (WebGL-шейдеры).
  - icon: 🧮
    title: Корректная цветовая наука
    details: Линеаризация sRGB с LUT, гамут-маппинг через десатурацию по яркости, коэффициенты Rec. 709.
---
