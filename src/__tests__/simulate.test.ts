import { describe, it, expect } from "vitest"
import { simulate, simulateBuffer, getMatrix, isMatrixModel } from "../simulate"
import type { ColorblindType, ColorblindModel } from "../types"

const ALL_TYPES: ColorblindType[] = [
  "none", "protanopia", "protanomaly", "deuteranopia", "deuteranomaly",
  "tritanopia", "tritanomaly", "achromatopsia", "achromatomaly",
]

const MATRIX_MODELS: ColorblindModel[] = ["vienot", "machado"]

describe("getMatrix", () => {
  it("returns identity for type 'none'", () => {
    const m = getMatrix("none")
    expect(m).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1])
  })

  it("returns identity when severity is 0", () => {
    const m = getMatrix("protanopia", { severity: 0 })
    expect(m).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1])
  })

  it("returns full matrix when severity is 1", () => {
    const m = getMatrix("protanopia", { model: "machado" })
    expect(m).toHaveLength(9)
    expect(m[0]).toBeCloseTo(0.152286, 4)
  })

  it("interpolates severity correctly", () => {
    const full = getMatrix("protanopia", { severity: 1 })
    const half = getMatrix("protanopia", { severity: 0.5 })
    const identity = [1, 0, 0, 0, 1, 0, 0, 0, 1]

    for (let i = 0; i < 9; i++) {
      const expected = full[i]! * 0.5 + identity[i]! * 0.5
      expect(half[i]).toBeCloseTo(expected, 6)
    }
  })

  it("clamps severity above 1", () => {
    const m1 = getMatrix("protanopia", { severity: 1 })
    const m2 = getMatrix("protanopia", { severity: 5 })
    expect(m1).toEqual(m2)
  })

  it("clamps severity below 0", () => {
    const m = getMatrix("protanopia", { severity: -1 })
    expect(m).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1])
  })

  it("throws for brettel model", () => {
    expect(() => getMatrix("protanopia", { model: "brettel" })).toThrow("brettel")
  })

  it("returns a new array each time (no mutation risk)", () => {
    const a = getMatrix("protanopia")
    const b = getMatrix("protanopia")
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })

  for (const model of MATRIX_MODELS) {
    for (const type of ALL_TYPES.filter((t) => t !== "none")) {
      it(`returns 9 elements for ${model}/${type}`, () => {
        const m = getMatrix(type, { model })
        expect(m).toHaveLength(9)
        m.forEach((v) => expect(typeof v).toBe("number"))
      })
    }
  }
})

describe("isMatrixModel", () => {
  it("returns true for vienot", () => {
    expect(isMatrixModel("vienot")).toBe(true)
  })

  it("returns true for machado", () => {
    expect(isMatrixModel("machado")).toBe(true)
  })

  it("returns false for brettel", () => {
    expect(isMatrixModel("brettel")).toBe(false)
  })
})

describe("simulate (single color)", () => {
  it("returns input unchanged for type 'none'", () => {
    expect(simulate("#e63946", "none")).toBe("#e63946")
    expect(simulate({ r: 230, g: 57, b: 70 }, "none")).toEqual({ r: 230, g: 57, b: 70 })
  })

  it("returns hex string when input is hex", () => {
    const result = simulate("#e63946", "protanopia")
    expect(typeof result).toBe("string")
    expect(result).toMatch(/^#[0-9a-f]{6}$/)
  })

  it("returns RGB object when input is RGB", () => {
    const result = simulate({ r: 230, g: 57, b: 70 }, "protanopia")
    expect(result).toHaveProperty("r")
    expect(result).toHaveProperty("g")
    expect(result).toHaveProperty("b")
  })

  it("simulates protanopia (red appears dimmer/shifted)", () => {
    const result = simulate({ r: 255, g: 0, b: 0 }, "protanopia")
    // Red should lose intensity for protanopia
    expect(result.r).toBeLessThan(255)
  })

  it("achromatopsia produces grayscale", () => {
    const result = simulate({ r: 230, g: 57, b: 70 }, "achromatopsia")
    // All channels should be equal (grayscale) within rounding
    expect(Math.abs(result.r - result.g)).toBeLessThanOrEqual(1)
    expect(Math.abs(result.g - result.b)).toBeLessThanOrEqual(1)
  })

  it("severity 0 returns input unchanged (via hex)", () => {
    const result = simulate("#e63946", "protanopia", { severity: 0 })
    expect(result).toBe("#e63946")
  })

  it("works with 3-digit hex", () => {
    const result = simulate("#F00", "deuteranopia")
    expect(typeof result).toBe("string")
    expect(result).toMatch(/^#[0-9a-f]{6}$/)
  })

  it("works with all models", () => {
    for (const model of ["vienot", "machado", "brettel"] as ColorblindModel[]) {
      const result = simulate("#e63946", "protanopia", { model })
      expect(result).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it("black stays black for all types", () => {
    for (const type of ALL_TYPES) {
      expect(simulate("#000000", type)).toBe("#000000")
    }
  })

  it("white stays white for all types and models", () => {
    for (const type of ALL_TYPES) {
      for (const model of ["vienot", "machado", "brettel"] as ColorblindModel[]) {
        const result = simulate({ r: 255, g: 255, b: 255 }, type, { model })
        // White should stay very close to white
        expect(result.r).toBeGreaterThanOrEqual(254)
        expect(result.g).toBeGreaterThanOrEqual(254)
        expect(result.b).toBeGreaterThanOrEqual(254)
      }
    }
  })
})

describe("simulateBuffer", () => {
  it("does nothing for type 'none'", () => {
    const pixels = new Uint8ClampedArray([230, 57, 70, 255])
    simulateBuffer(pixels, "none")
    expect(pixels[0]).toBe(230)
    expect(pixels[1]).toBe(57)
    expect(pixels[2]).toBe(70)
    expect(pixels[3]).toBe(255)
  })

  it("preserves alpha channel", () => {
    const pixels = new Uint8ClampedArray([230, 57, 70, 128])
    simulateBuffer(pixels, "protanopia")
    expect(pixels[3]).toBe(128)
  })

  it("processes multiple pixels", () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
    ])
    simulateBuffer(pixels, "deuteranopia")
    // All pixels should be modified (except alpha)
    expect(pixels[3]).toBe(255)
    expect(pixels[7]).toBe(255)
    expect(pixels[11]).toBe(255)
  })

  it("accepts Uint8Array (for Node.js Buffer compatibility)", () => {
    const pixels = new Uint8Array([230, 57, 70, 255])
    simulateBuffer(pixels, "protanopia")
    // Should not throw and should modify in-place
    expect(pixels[3]).toBe(255)
  })

  it("produces same result as simulate for single pixel", () => {
    const rgb = { r: 180, g: 50, b: 90 }
    const expected = simulate(rgb, "tritanopia", { model: "machado" })

    const pixels = new Uint8ClampedArray([rgb.r, rgb.g, rgb.b, 255])
    simulateBuffer(pixels, "tritanopia", { model: "machado" })

    expect(pixels[0]).toBe(expected.r)
    expect(pixels[1]).toBe(expected.g)
    expect(pixels[2]).toBe(expected.b)
  })

  it("works with brettel model", () => {
    const pixels = new Uint8ClampedArray([230, 57, 70, 255])
    simulateBuffer(pixels, "protanopia", { model: "brettel" })
    // Should modify in-place without throwing
    expect(pixels[3]).toBe(255)
  })

  it("brettel falls back to machado for achromatopsia", () => {
    const pixelsBrettel = new Uint8ClampedArray([230, 57, 70, 255])
    const pixelsMachado = new Uint8ClampedArray([230, 57, 70, 255])

    simulateBuffer(pixelsBrettel, "achromatopsia", { model: "brettel" })
    simulateBuffer(pixelsMachado, "achromatopsia", { model: "machado" })

    expect(pixelsBrettel[0]).toBe(pixelsMachado[0])
    expect(pixelsBrettel[1]).toBe(pixelsMachado[1])
    expect(pixelsBrettel[2]).toBe(pixelsMachado[2])
  })
})
