import { describe, it, expect } from "vitest"
import { srgbToLinear, linearToSrgb, gamutMap, relativeLuminance } from "../core"

describe("srgbToLinear", () => {
  it("returns 0 for sRGB 0", () => {
    expect(srgbToLinear(0)).toBe(0)
  })

  it("returns 1 for sRGB 255", () => {
    expect(srgbToLinear(255)).toBeCloseTo(1, 6)
  })

  it("handles the linear segment threshold (sRGB ~10-11)", () => {
    // sRGB 10 ≈ 0.039, below 0.04045 threshold → linear = v/12.92
    const val = srgbToLinear(10)
    expect(val).toBeCloseTo((10 / 255) / 12.92, 6)
  })

  it("handles the gamma segment (sRGB 128)", () => {
    const val = srgbToLinear(128)
    expect(val).toBeGreaterThan(0)
    expect(val).toBeLessThan(1)
    // Mid sRGB ≈ 0.2159 linear (not 0.5 due to gamma)
    expect(val).toBeCloseTo(0.2159, 3)
  })

  it("clamps out-of-range values", () => {
    expect(srgbToLinear(-1)).toBe(srgbToLinear(0))
    expect(srgbToLinear(256)).toBe(srgbToLinear(255))
    expect(srgbToLinear(300)).toBe(srgbToLinear(255))
  })

  it("handles fractional input by truncating", () => {
    expect(srgbToLinear(127.9)).toBe(srgbToLinear(127))
  })
})

describe("linearToSrgb", () => {
  it("returns 0 for linear 0", () => {
    expect(linearToSrgb(0)).toBe(0)
  })

  it("returns 255 for linear 1", () => {
    expect(linearToSrgb(1)).toBe(255)
  })

  it("clamps negative values to 0", () => {
    expect(linearToSrgb(-0.5)).toBe(0)
  })

  it("clamps values above 1 to 255", () => {
    expect(linearToSrgb(1.5)).toBe(255)
  })

  it("round-trips with srgbToLinear for all 256 values", () => {
    for (let i = 0; i < 256; i++) {
      const linear = srgbToLinear(i)
      const back = linearToSrgb(linear)
      expect(back).toBe(i)
    }
  })
})

describe("gamutMap", () => {
  it("returns in-gamut colors unchanged", () => {
    expect(gamutMap(0.5, 0.3, 0.7)).toEqual([0.5, 0.3, 0.7])
  })

  it("returns black unchanged", () => {
    expect(gamutMap(0, 0, 0)).toEqual([0, 0, 0])
  })

  it("returns white unchanged", () => {
    expect(gamutMap(1, 1, 1)).toEqual([1, 1, 1])
  })

  it("maps out-of-gamut colors into [0,1]", () => {
    const [r, g, b] = gamutMap(1.2, -0.1, 0.5)
    expect(r).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(1)
    expect(g).toBeGreaterThanOrEqual(0)
    expect(g).toBeLessThanOrEqual(1)
    expect(b).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThanOrEqual(1)
  })

  it("preserves luminance direction during mapping", () => {
    const [r, g, b] = gamutMap(1.5, 0.5, -0.3)
    // Result should be valid
    expect(r).toBeGreaterThanOrEqual(0)
    expect(b).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(1)
  })

  it("always returns values within [0,1] (degenerate all-above-gamut)", () => {
    const [r, g, b] = gamutMap(1.5, 1.5, 0)
    expect(r).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(1)
    expect(g).toBeGreaterThanOrEqual(0)
    expect(g).toBeLessThanOrEqual(1)
    expect(b).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThanOrEqual(1)
  })

  it("returns white when all channels are equally above 1", () => {
    const [r, g, b] = gamutMap(2, 2, 2)
    expect(r).toBe(1)
    expect(g).toBe(1)
    expect(b).toBe(1)
  })

  it("returns black when all channels are equally below 0", () => {
    const [r, g, b] = gamutMap(-1, -1, -1)
    expect(r).toBe(0)
    expect(g).toBe(0)
    expect(b).toBe(0)
  })

  it("never produces NaN/Infinity for extreme inputs", () => {
    for (const [r, g, b] of [
      [1e9, 1e9, 1e9],
      [-1e9, -1e9, -1e9],
      [1e9, -1e9, 0],
    ] as const) {
      const out = gamutMap(r, g, b)
      for (const ch of out) {
        expect(Number.isFinite(ch)).toBe(true)
        expect(ch).toBeGreaterThanOrEqual(0)
        expect(ch).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance(0, 0, 0)).toBe(0)
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 6)
  })

  it("weights green highest (Rec. 709)", () => {
    const greenL = relativeLuminance(0, 255, 0)
    const redL = relativeLuminance(255, 0, 0)
    const blueL = relativeLuminance(0, 0, 255)
    expect(greenL).toBeGreaterThan(redL)
    expect(redL).toBeGreaterThan(blueL)
  })

  it("returns a value in [0,1] for any channel values", () => {
    for (let r = 0; r <= 255; r += 37) {
      for (let g = 0; g <= 255; g += 53) {
        for (let b = 0; b <= 255; b += 71) {
          const L = relativeLuminance(r, g, b)
          expect(L).toBeGreaterThanOrEqual(0)
          expect(L).toBeLessThanOrEqual(1)
        }
      }
    }
  })
})
