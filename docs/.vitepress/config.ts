import { defineConfig, type DefaultTheme } from "vitepress"

function guideSidebar(prefix: string, labels: { guide: string; gettingStarted: string; models: string; recipes: string }): DefaultTheme.SidebarItem[] {
  return [
    {
      text: labels.guide,
      items: [
        { text: labels.gettingStarted, link: `${prefix}/guide/getting-started` },
        { text: labels.models, link: `${prefix}/guide/models` },
        { text: labels.recipes, link: `${prefix}/guide/recipes` },
      ],
    },
  ]
}

function demoSidebar(prefix: string, labels: { demo: string; splitComparison: string; colorPicker: string; imageSimulation: string; modelComparison: string; paletteChecker: string; benchmark: string }): DefaultTheme.SidebarItem[] {
  return [
    {
      text: labels.demo,
      items: [
        { text: labels.splitComparison, link: `${prefix}/demo/split-comparison` },
        { text: labels.colorPicker, link: `${prefix}/demo/color-picker` },
        { text: labels.imageSimulation, link: `${prefix}/demo/image-simulation` },
        { text: labels.modelComparison, link: `${prefix}/demo/model-comparison` },
        { text: labels.paletteChecker, link: `${prefix}/demo/palette-checker` },
        { text: labels.benchmark, link: `${prefix}/demo/benchmark` },
      ],
    },
  ]
}

function apiSidebar(prefix: string, labels: {
  api: string
  types: string
  accessibility: string
  conversion: string
}): DefaultTheme.SidebarItem[] {
  return [
    {
      text: labels.api,
      items: [
        { text: "simulate()", link: `${prefix}/api/simulate` },
        { text: "simulatePalette()", link: `${prefix}/api/simulate-palette` },
        { text: "simulateBuffer()", link: `${prefix}/api/simulate-buffer` },
        { text: "getMatrix()", link: `${prefix}/api/get-matrix` },
        { text: labels.accessibility, link: `${prefix}/api/accessibility` },
        { text: labels.conversion, link: `${prefix}/api/color-conversion` },
        { text: labels.types, link: `${prefix}/api/types` },
      ],
    },
  ]
}

export default defineConfig({
  title: "chromanopia",
  description: "Physically accurate colorblindness simulation",
  base: "/chromanopia/",
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/chromanopia/logo.svg" }],
  ],
  locales: {
    root: {
      label: "English",
      lang: "en",
    },
    ru: {
      label: "Русский",
      lang: "ru",
      description: "Физически точная симуляция дальтонизма",
      themeConfig: {
        nav: [
          { text: "Руководство", link: "/ru/guide/getting-started" },
          { text: "Демо", link: "/ru/demo/split-comparison" },
          { text: "API", link: "/ru/api/simulate" },
        ],
        sidebar: {
          "/ru/guide/": guideSidebar("/ru", { guide: "Руководство", gettingStarted: "Начало работы", models: "Модели", recipes: "Рецепты" }),
          "/ru/demo/": demoSidebar("/ru", { demo: "Интерактивные демо", splitComparison: "Сравнение", colorPicker: "Палитра цветов", imageSimulation: "Симуляция изображений", modelComparison: "Сравнение моделей", paletteChecker: "Проверка палитры", benchmark: "Бенчмарк" }),
          "/ru/api/": apiSidebar("/ru", { api: "Справочник API", types: "Типы и метаданные", accessibility: "Специальные возможности", conversion: "Преобразование цветов" }),
        },
      },
    },
    sr: {
      label: "Srpski",
      lang: "sr",
      description: "Fizički tačna simulacija daltonizma",
      themeConfig: {
        nav: [
          { text: "Vodič", link: "/sr/guide/getting-started" },
          { text: "Demo", link: "/sr/demo/split-comparison" },
          { text: "API", link: "/sr/api/simulate" },
        ],
        sidebar: {
          "/sr/guide/": guideSidebar("/sr", { guide: "Vodič", gettingStarted: "Početak rada", models: "Modeli", recipes: "Recepti" }),
          "/sr/demo/": demoSidebar("/sr", { demo: "Interaktivni demo", splitComparison: "Poređenje", colorPicker: "Birač boja", imageSimulation: "Simulacija slika", modelComparison: "Poređenje modela", paletteChecker: "Provera palete", benchmark: "Benchmark" }),
          "/sr/api/": apiSidebar("/sr", { api: "API referenca", types: "Tipovi i metapodaci", accessibility: "Pristupačnost", conversion: "Konverzija boja" }),
        },
      },
    },
    zh: {
      label: "中文",
      lang: "zh",
      description: "物理精确的色盲模拟",
      themeConfig: {
        nav: [
          { text: "指南", link: "/zh/guide/getting-started" },
          { text: "演示", link: "/zh/demo/split-comparison" },
          { text: "API", link: "/zh/api/simulate" },
        ],
        sidebar: {
          "/zh/guide/": guideSidebar("/zh", { guide: "指南", gettingStarted: "快速开始", models: "模型", recipes: "实用示例" }),
          "/zh/demo/": demoSidebar("/zh", { demo: "交互式演示", splitComparison: "分屏对比", colorPicker: "取色器", imageSimulation: "图像模拟", modelComparison: "模型对比", paletteChecker: "调色板检查", benchmark: "性能测试" }),
          "/zh/api/": apiSidebar("/zh", { api: "API 参考", types: "类型与元数据", accessibility: "无障碍辅助", conversion: "颜色转换" }),
        },
      },
    },
    ja: {
      label: "日本語",
      lang: "ja",
      description: "物理的に正確な色覚異常シミュレーション",
      themeConfig: {
        nav: [
          { text: "ガイド", link: "/ja/guide/getting-started" },
          { text: "デモ", link: "/ja/demo/split-comparison" },
          { text: "API", link: "/ja/api/simulate" },
        ],
        sidebar: {
          "/ja/guide/": guideSidebar("/ja", { guide: "ガイド", gettingStarted: "はじめに", models: "モデル", recipes: "レシピ" }),
          "/ja/demo/": demoSidebar("/ja", { demo: "インタラクティブデモ", splitComparison: "分割比較", colorPicker: "カラーピッカー", imageSimulation: "画像シミュレーション", modelComparison: "モデル比較", paletteChecker: "パレットチェッカー", benchmark: "ベンチマーク" }),
          "/ja/api/": apiSidebar("/ja", { api: "APIリファレンス", types: "型とメタデータ", accessibility: "アクセシビリティ", conversion: "色変換" }),
        },
      },
    },
    es: {
      label: "Español",
      lang: "es",
      description: "Simulación físicamente precisa de daltonismo",
      themeConfig: {
        nav: [
          { text: "Guía", link: "/es/guide/getting-started" },
          { text: "Demo", link: "/es/demo/split-comparison" },
          { text: "API", link: "/es/api/simulate" },
        ],
        sidebar: {
          "/es/guide/": guideSidebar("/es", { guide: "Guía", gettingStarted: "Primeros pasos", models: "Modelos", recipes: "Recetas" }),
          "/es/demo/": demoSidebar("/es", { demo: "Demo interactiva", splitComparison: "Comparación", colorPicker: "Selector de colores", imageSimulation: "Simulación de imágenes", modelComparison: "Comparación de modelos", paletteChecker: "Verificador de paleta", benchmark: "Benchmark" }),
          "/es/api/": apiSidebar("/es", { api: "Referencia API", types: "Tipos y metadatos", accessibility: "Accesibilidad", conversion: "Conversión de color" }),
        },
      },
    },
  },
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Demo", link: "/demo/split-comparison" },
      { text: "API", link: "/api/simulate" },
    ],
    sidebar: {
      "/guide/": guideSidebar("", { guide: "Guide", gettingStarted: "Getting Started", models: "Models", recipes: "Recipes" }),
      "/demo/": demoSidebar("", { demo: "Interactive Demo", splitComparison: "Split Comparison", colorPicker: "Color Picker", imageSimulation: "Image Simulation", modelComparison: "Model Comparison", paletteChecker: "Palette Checker", benchmark: "Benchmark" }),
      "/api/": apiSidebar("", { api: "API Reference", types: "Types & Metadata", accessibility: "Accessibility", conversion: "Color Conversion" }),
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/nemezzizz/chromanopia" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 NemeZZiZZ",
    },
    search: {
      provider: "local",
    },
  },
})
