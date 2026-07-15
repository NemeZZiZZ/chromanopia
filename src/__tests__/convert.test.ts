import { describe, it, expect } from "vitest"
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, toRgb, parseCssColor } from "../convert"

describe("hexToRgb", () => {
  it("parses 6-digit hex with #", () => {
    expect(hexToRgb("#e63946")).toEqual({ r: 230, g: 57, b: 70 })
  })

  it("parses 6-digit hex without #", () => {
    expect(hexToRgb("e63946")).toEqual({ r: 230, g: 57, b: 70 })
  })

  it("parses 3-digit hex with #", () => {
    expect(hexToRgb("#F00")).toEqual({ r: 255, g: 0, b: 0 })
  })

  it("parses 3-digit hex without #", () => {
    expect(hexToRgb("0af")).toEqual({ r: 0, g: 170, b: 255 })
  })

  it("parses 4-digit hex with alpha (alpha dropped)", () => {
    expect(hexToRgb("#F00F")).toEqual({ r: 255, g: 0, b: 0 })
  })

  it("parses 8-digit hex with alpha (alpha dropped)", () => {
    expect(hexToRgb("#e63946ff")).toEqual({ r: 230, g: 57, b: 70 })
    expect(hexToRgb("#e6394600")).toEqual({ r: 230, g: 57, b: 70 })
  })

  it("parses black and white", () => {
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 })
  })

  it("throws on invalid hex length", () => {
    expect(() => hexToRgb("#12345")).toThrow("Invalid hex color")
  })

  it("throws on invalid hex characters", () => {
    expect(() => hexToRgb("#gggggg")).toThrow("Invalid hex color")
  })

  it("rejects partially-valid hex (no silent prefix parsing)", () => {
    // parseInt('12gg',16) would return 0x12 — the regex must catch this.
    expect(() => hexToRgb("#12gggg")).toThrow("Invalid hex color")
    expect(() => hexToRgb("12gg")).toThrow("Invalid hex color")
  })

  it("trims surrounding whitespace", () => {
    expect(hexToRgb("  #e63946  ")).toEqual({ r: 230, g: 57, b: 70 })
  })
})

describe("rgbToHex", () => {
  it("converts RGB to 6-digit hex", () => {
    expect(rgbToHex({ r: 230, g: 57, b: 70 })).toBe("#e63946")
  })

  it("pads with leading zeros", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000")
  })

  it("clamps values above 255", () => {
    expect(rgbToHex({ r: 300, g: 0, b: 0 })).toBe("#ff0000")
  })

  it("clamps negative values", () => {
    expect(rgbToHex({ r: -10, g: 0, b: 0 })).toBe("#000000")
  })

  it("rounds fractional values", () => {
    expect(rgbToHex({ r: 127.6, g: 0, b: 0 })).toBe("#800000")
  })

  it("round-trips through hexToRgb", () => {
    const hex = "#1a2b3c"
    expect(rgbToHex(hexToRgb(hex))).toBe(hex)
  })
})

describe("HSL conversion", () => {
  it("converts pure red", () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, l: 0.5 })
  })

  it("converts pure green", () => {
    expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 1, l: 0.5 })
  })

  it("converts pure blue", () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 1, l: 0.5 })
  })

  it("grayscale has zero saturation", () => {
    const { s, h } = rgbToHsl({ r: 128, g: 128, b: 128 })
    expect(s).toBe(0)
    expect(h).toBe(0)
  })

  it("black and white", () => {
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 })
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 1 })
  })

  it("round-trips saturated colors through rgbToHsl/hslToRgb", () => {
    for (const rgb of [
      { r: 230, g: 57, b: 70 },
      { r: 50, g: 200, b: 130 },
      { r: 10, g: 20, b: 200 },
      { r: 200, g: 100, b: 0 },
    ]) {
      const back = hslToRgb(rgbToHsl(rgb))
      expect(back.r).toBeCloseTo(rgb.r, 0)
      expect(back.g).toBeCloseTo(rgb.g, 0)
      expect(back.b).toBeCloseTo(rgb.b, 0)
    }
  })

  it("normalizes out-of-range hue", () => {
    const rgb = hslToRgb({ h: 480, s: 1, l: 0.5 }) // 480 ≡ 120 (green)
    expect(rgb).toEqual({ r: 0, g: 255, b: 0 })
  })

  it("zero-saturation returns the lightness gray", () => {
    expect(hslToRgb({ h: 0, s: 0, l: 0.5 })).toEqual({ r: 128, g: 128, b: 128 })
  })
})

describe("parseCssColor", () => {
  it("parses hex", () => {
    expect(parseCssColor("#e63946")).toEqual({ r: 230, g: 57, b: 70 })
    expect(parseCssColor("e63946")).toEqual({ r: 230, g: 57, b: 70 })
  })

  it("parses rgb() legacy comma form", () => {
    expect(parseCssColor("rgb(230, 57, 70)")).toEqual({ r: 230, g: 57, b: 70 })
  })

  it("parses rgba()", () => {
    expect(parseCssColor("rgba(230, 57, 70, 0.5)")).toEqual({ r: 230, g: 57, b: 70 })
  })

  it("parses modern space form with alpha", () => {
    expect(parseCssColor("rgb(230 57 70 / 0.5)")).toEqual({ r: 230, g: 57, b: 70 })
  })

  it("parses percentage channels", () => {
    expect(parseCssColor("rgb(100%, 0%, 0%)")).toEqual({ r: 255, g: 0, b: 0 })
  })

  it("throws on unknown format", () => {
    expect(() => parseCssColor("red")).toThrow("Unsupported color format")
  })
})

describe("toRgb", () => {
  it("passes RGB objects through (as a copy)", () => {
    const rgb = { r: 10, g: 20, b: 30 }
    expect(toRgb(rgb)).toEqual(rgb)
    expect(toRgb(rgb)).not.toBe(rgb)
  })

  it("converts hex strings", () => {
    expect(toRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 })
  })

  it("converts rgb() strings", () => {
    expect(toRgb("rgb(0, 128, 255)")).toEqual({ r: 0, g: 128, b: 255 })
  })

  it("converts HSL objects", () => {
    expect(toRgb({ h: 120, s: 1, l: 0.5 })).toEqual({ r: 0, g: 255, b: 0 })
  })
})
