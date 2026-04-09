---
layout: home
hero:
  name: chromanopia
  text: 色盲模拟
  tagline: 适用于 JavaScript/TypeScript 的物理精确色觉缺陷模拟。三种模型，零依赖。
  image:
    src: /logo.svg
    alt: chromanopia
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 交互式演示
      link: /zh/demo/split-comparison
    - theme: alt
      text: API 参考
      link: /zh/api/simulate
features:
  - icon: "\U0001F52C"
    title: 三种科学模型
    details: "Vi\xE9not (1999)、Machado (2009) 和 Brettel (1997) \u2014 根据您的使用场景在速度和精度之间选择。"
  - icon: "\U0001F3A8"
    title: 全部 8 种缺陷类型
    details: "红色盲、绿色盲、蓝色盲、全色盲及其部分变体 \u2014 完整的色觉缺陷覆盖。"
  - icon: "\U0001F39A\uFE0F"
    title: 严重程度滑块
    details: "0\u20131 之间的平滑插值 \u2014 模拟任意程度的色盲。"
  - icon: "\u26A1"
    title: 零依赖
    details: 无运行时依赖。开箱即用，支持 Node.js、浏览器、边缘运行时和 Web Workers。
  - icon: "\U0001F5BC\uFE0F"
    title: 三种 API
    details: "单色 (hex 或 RGB)\u3001像素缓冲区 (Canvas/Sharp) 和原始 3\xD73 矩阵 (WebGL 着色器)。"
  - icon: "\U0001F9EE"
    title: 正确的色彩科学
    details: 使用 LUT 的 sRGB 线性化、基于亮度去饱和的色域映射、Rec. 709 系数。
---
