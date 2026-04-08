import { describe, it, expect } from "vitest"
import { hexToRgb, rgbToHex } from "../convert"

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
