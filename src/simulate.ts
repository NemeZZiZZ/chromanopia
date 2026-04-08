/**
 * Core simulation functions: getMatrix, simulateBuffer, simulate (single-color).
 */

import { SRGB_TO_LINEAR, gamutMap, linearToSrgb } from "./core"
import { hexToRgb, rgbToHex } from "./convert"
import { VIENOT_MATRICES } from "./models/vienot"
import { MACHADO_MATRICES } from "./models/machado"
import { BRETTEL_IS_ANOMALY, BRETTEL_TYPE_MAP, brettelSimPixel } from "./models/brettel"
import type { ColorblindModel, ColorblindType, Matrix3x3, RGB, SimulateOptions } from "./types"

const IDENTITY: Matrix3x3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]

/**
 * Returns the interpolated 3×3 color matrix for a given deficiency and severity.
 * For matrix-based models (Viénot, Machado) only — Brettel uses per-pixel projection.
 *
 * @returns A flat 9-element tuple in row-major order.
 * @throws If `model` is `"brettel"` (Brettel is not a matrix-based model).
 */
export function getMatrix(
  type: ColorblindType,
  options: SimulateOptions = {},
): Matrix3x3 {
  const { model = "machado", severity: rawSeverity = 1 } = options
  const severity = Math.max(0, Math.min(1, rawSeverity))

  if (model === "brettel") {
    throw new Error('getMatrix() does not support model "brettel" — Brettel uses per-pixel projection, not a 3×3 matrix. Use simulateBuffer() instead.')
  }

  if (type === "none" || severity <= 0) return [...IDENTITY]

  const matrices = model === "machado" ? MACHADO_MATRICES : VIENOT_MATRICES
  const target = matrices[type]

  if (severity >= 1) return [...target]

  const inv = 1 - severity
  return [
    target[0] * severity + IDENTITY[0] * inv,
    target[1] * severity + IDENTITY[1] * inv,
    target[2] * severity + IDENTITY[2] * inv,
    target[3] * severity + IDENTITY[3] * inv,
    target[4] * severity + IDENTITY[4] * inv,
    target[5] * severity + IDENTITY[5] * inv,
    target[6] * severity + IDENTITY[6] * inv,
    target[7] * severity + IDENTITY[7] * inv,
    target[8] * severity + IDENTITY[8] * inv,
  ]
}

/**
 * Returns `true` if the model uses a 3×3 matrix (can be used with Sharp `recomb`, WebGL, etc.).
 */
export function isMatrixModel(model: ColorblindModel): model is "vienot" | "machado" {
  return model !== "brettel"
}

/**
 * Applies a pre-computed matrix to an RGBA pixel buffer in-place.
 * Pipeline: sRGB → linear → matrix multiply → gamut map → sRGB.
 */
function applyMatrixToBuffer(
  pixels: Uint8Array | Uint8ClampedArray,
  m: Matrix3x3,
): void {
  const [m0, m1, m2, m3, m4, m5, m6, m7, m8] = m

  for (let i = 0; i < pixels.length; i += 4) {
    const lr = SRGB_TO_LINEAR[pixels[i]!]!
    const lg = SRGB_TO_LINEAR[pixels[i + 1]!]!
    const lb = SRGB_TO_LINEAR[pixels[i + 2]!]!

    const [gr, gg, gb] = gamutMap(
      lr * m0 + lg * m1 + lb * m2,
      lr * m3 + lg * m4 + lb * m5,
      lr * m6 + lg * m7 + lb * m8,
    )
    pixels[i] = linearToSrgb(gr)
    pixels[i + 1] = linearToSrgb(gg)
    pixels[i + 2] = linearToSrgb(gb)
  }
}

/**
 * Applies colorblindness simulation to an RGBA pixel buffer **in-place**.
 *
 * Pipeline:
 * - Viénot/Machado: sRGB → linear → matrix multiply → gamut map → sRGB
 * - Brettel: sRGB → linear → XYZ → xyY projection → XYZ → linear → gamut map → sRGB
 *
 * @param pixels - RGBA pixel buffer (e.g. `ImageData.data`, Sharp raw output, or any `Uint8Array`).
 * @param type - Deficiency type.
 * @param options - Model and severity options.
 */
export function simulateBuffer(
  pixels: Uint8Array | Uint8ClampedArray,
  type: ColorblindType,
  options: SimulateOptions = {},
): void {
  if (type === "none") return

  const { model = "machado", severity: rawSeverity = 1 } = options
  const severity = Math.max(0, Math.min(1, rawSeverity))
  if (severity <= 0) return

  if (model === "brettel") {
    applyBrettelSim(pixels, type, severity)
    return
  }

  const m = getMatrix(type, { model, severity })
  applyMatrixToBuffer(pixels, m)
}

/**
 * Simulates a single color.
 *
 * @param color - Hex string (`"#e63946"`, `"e63946"`, `"#F00"`) or RGB object.
 * @param type - Deficiency type.
 * @param options - Model and severity.
 * @returns The same format as the input: hex string if input was string, RGB object otherwise.
 */
export function simulate<T extends string | RGB>(
  color: T,
  type: ColorblindType,
  options?: SimulateOptions,
): T
export function simulate(
  color: string | RGB,
  type: ColorblindType,
  options: SimulateOptions = {},
): string | RGB {
  if (type === "none") return color

  const rgb = typeof color === "string" ? hexToRgb(color) : color
  const pixels = new Uint8ClampedArray([rgb.r, rgb.g, rgb.b, 255])

  simulateBuffer(pixels, type, options)

  const result: RGB = { r: pixels[0]!, g: pixels[1]!, b: pixels[2]! }

  return typeof color === "string" ? rgbToHex(result) : result
}

// ─── Brettel internals ──────────────────────────────────────────────────────

function applyBrettelSim(
  pixels: Uint8Array | Uint8ClampedArray,
  type: ColorblindType,
  severity: number,
): void {
  const coneType = BRETTEL_TYPE_MAP[type as Exclude<ColorblindType, "none">]
  const isAnomaly = BRETTEL_IS_ANOMALY[type as Exclude<ColorblindType, "none">]

  // Rod monochromacy: fall back to Machado matrix
  if (!coneType) {
    const m = getMatrix(type, { model: "machado", severity })
    applyMatrixToBuffer(pixels, m)
    return
  }

  const anomalyWeight = isAnomaly ? 1.75 / 2.75 : 1.0
  const blend = severity * anomalyWeight

  for (let i = 0; i < pixels.length; i += 4) {
    const lr = SRGB_TO_LINEAR[pixels[i]!]!
    const lg = SRGB_TO_LINEAR[pixels[i + 1]!]!
    const lb = SRGB_TO_LINEAR[pixels[i + 2]!]!

    const [sr, sg, sb] = brettelSimPixel(lr, lg, lb, coneType)

    const fr = lr + blend * (sr - lr)
    const fg = lg + blend * (sg - lg)
    const fb = lb + blend * (sb - lb)

    pixels[i] = linearToSrgb(fr)
    pixels[i + 1] = linearToSrgb(fg)
    pixels[i + 2] = linearToSrgb(fb)
  }
}
