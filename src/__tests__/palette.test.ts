import { describe, it, expect } from "vitest"
import { simulate, simulatePalette } from "../simulate"

describe("simulatePalette", () => {
  it("simulates each color and preserves type per element", () => {
    const out = simulatePalette(["#ff0000", { r: 0, g: 255, b: 0 }], "protanopia")
    expect(typeof out[0]).toBe("string")
    expect(typeof out[1]).toBe("object")
    expect(out[0]).toMatch(/^#[0-9a-f]{6}$/)
    expect(out[1]).toHaveProperty("r")
  })

  it("matches per-element simulate() output", () => {
    const colors = ["#e63946", { r: 12, g: 34, b: 56 }, "#00ffff"] as const
    const palette = simulatePalette(colors, "deuteranopia", { model: "vienot" })
    const individual = colors.map((c) => simulate(c, "deuteranopia", { model: "vienot" }))
    expect(palette).toEqual(individual)
  })

  it("returns a new array and does not mutate the input", () => {
    const colors = ["#ff0000", "#00ff00"]
    const snapshot = [...colors]
    const out = simulatePalette(colors, "protanopia")
    expect(colors).toEqual(snapshot)
    expect(out).not.toBe(colors)
  })

  it("handles 'none' (returns copies, not aliases)", () => {
    const rgb = { r: 5, g: 6, b: 7 }
    const out = simulatePalette([rgb], "none")
    expect(out[0]).toEqual(rgb)
    expect(out[0]).not.toBe(rgb)
  })

  it("handles empty palette", () => {
    expect(simulatePalette([], "protanopia")).toEqual([])
  })
})

describe("simulate 'none' reference safety (regression)", () => {
  it("returns a copy of the RGB object, not the same reference", () => {
    const input = { r: 230, g: 57, b: 70 }
    const out = simulate(input, "none")
    expect(out).toEqual(input)
    expect(out).not.toBe(input)
    // mutating the result must not affect the input
    out.r = 0
    expect(input.r).toBe(230)
  })

  it("returns the hex string unchanged for 'none'", () => {
    expect(simulate("#e63946", "none")).toBe("#e63946")
  })
})
