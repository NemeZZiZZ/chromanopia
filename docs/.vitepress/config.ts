import { defineConfig } from "vitepress"

export default defineConfig({
  title: "chromanopia",
  description: "Physically accurate colorblindness simulation",
  base: "/chromanopia/",
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/chromanopia/logo.svg" }],
  ],
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Demo", link: "/demo/split-comparison" },
      { text: "API", link: "/api/simulate" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Models", link: "/guide/models" },
            { text: "Recipes", link: "/guide/recipes" },
          ],
        },
      ],
      "/demo/": [
        {
          text: "Interactive Demo",
          items: [
            { text: "Split Comparison", link: "/demo/split-comparison" },
            { text: "Color Picker", link: "/demo/color-picker" },
            { text: "Image Simulation", link: "/demo/image-simulation" },
            { text: "Model Comparison", link: "/demo/model-comparison" },
            { text: "Palette Checker", link: "/demo/palette-checker" },
            { text: "Benchmark", link: "/demo/benchmark" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [
            { text: "simulate()", link: "/api/simulate" },
            { text: "simulateBuffer()", link: "/api/simulate-buffer" },
            { text: "getMatrix()", link: "/api/get-matrix" },
            { text: "Types & Metadata", link: "/api/types" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/nemezzizz/chromanopia" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025 NemeZZiZZ",
    },
    search: {
      provider: "local",
    },
  },
})
