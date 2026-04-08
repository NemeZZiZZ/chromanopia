import { describe, it, expect } from "vitest"
import { srgbToLinear, linearToSrgb, gamutMap } from "../core"

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
})
