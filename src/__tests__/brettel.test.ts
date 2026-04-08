import { describe, it, expect } from "vitest"
import { brettelSimPixel } from "../models/brettel"

describe("brettelSimPixel", () => {
  it("returns [0,0,0] for black", () => {
    expect(brettelSimPixel(0, 0, 0, "protan")).toEqual([0, 0, 0])
  })

  it("returns values in [0,1] for normal input", () => {
    const [r, g, b] = brettelSimPixel(0.5, 0.3, 0.2, "deutan")
    expect(r).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(1)
    expect(g).toBeGreaterThanOrEqual(0)
    expect(g).toBeLessThanOrEqual(1)
    expect(b).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThanOrEqual(1)
  })

  it("handles all cone types without throwing", () => {
    for (const cone of ["protan", "deutan", "tritan"] as const) {
      const result = brettelSimPixel(0.4, 0.6, 0.2, cone)
      expect(result).toHaveLength(3)
      result.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      })
    }
  })

  it("handles near-zero luminance without throwing", () => {
    const result = brettelSimPixel(0.001, 0.001, 0.001, "protan")
    expect(result).toHaveLength(3)
    result.forEach((v) => expect(Number.isFinite(v)).toBe(true))
  })

  it("handles pure white", () => {
    const [r, g, b] = brettelSimPixel(1, 1, 1, "tritan")
    expect(r).toBeCloseTo(1, 1)
    expect(g).toBeCloseTo(1, 1)
    expect(b).toBeCloseTo(1, 1)
  })
})
