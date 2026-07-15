import { describe, it, expect } from "vitest"
import {
  relativeLuminance,
  contrastRatio,
  colorDistance,
  isDistinguishable,
} from "../accessibility"

describe("contrastRatio", () => {
  it("is 21 for pure black vs pure white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5)
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5)
  })

  it("is 1 for a color against itself", () => {
    expect(contrastRatio("#e63946", "#e63946")).toBeCloseTo(1, 6)
  })

  it("accepts RGB objects and hex strings interchangeably", () => {
    const hex = contrastRatio("#ffffff", "#000000")
    const obj = contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })
    expect(hex).toBeCloseTo(obj, 6)
  })

  it("always returns a value in [1, 21]", () => {
    for (const a of ["#000000", "#ff0000", "#00ff00", "#ffffff"]) {
      for (const b of ["#123456", "#abcdef", "#000000"]) {
        const c = contrastRatio(a, b)
        expect(c).toBeGreaterThanOrEqual(1)
        expect(c).toBeLessThanOrEqual(21)
      }
    }
  })
})

describe("colorDistance", () => {
  it("is 0 for identical colors", () => {
    expect(colorDistance("#e63946", "#e63946")).toBe(0)
  })

  it("computes Euclidean distance in sRGB space", () => {
    // red (255,0,0) vs green (0,255,0): sqrt(255² + 255²) ≈ 360.624
    expect(colorDistance("#ff0000", "#00ff00")).toBeCloseTo(Math.sqrt(255 * 255 * 2), 3)
  })

  it("accepts RGB objects", () => {
    expect(colorDistance({ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 })).toBe(0)
  })
})

describe("isDistinguishable", () => {
  it("normal vision distinguishes red from green", () => {
    expect(isDistinguishable("#ff0000", "#00ff00", "none")).toBe(true)
  })

  it("two identical colors are never distinguishable", () => {
    expect(isDistinguishable("#e63946", "#e63946", "protanopia")).toBe(false)
  })

  it("respects a custom threshold", () => {
    // red vs slightly-red: very close
    const close = isDistinguishable("#ff0000", "#fe0000", "none", {}, 5)
    expect(close).toBe(false)
    const far = isDistinguishable("#ff0000", "#00ff00", "none", {}, 5)
    expect(far).toBe(true)
  })

  it("returns a boolean", () => {
    const r = isDistinguishable("#aabbcc", "#112233", "deuteranopia")
    expect(typeof r).toBe("boolean")
  })
})

describe("relativeLuminance re-export", () => {
  it("is exported from accessibility module", () => {
    expect(relativeLuminance(0, 0, 0)).toBe(0)
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 6)
  })
})
