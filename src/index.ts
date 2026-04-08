/**
 * chromanopia — Physically accurate colorblindness simulation.
 *
 * Three models: Viénot (1999), Machado (2009), Brettel (1997).
 * sRGB linearization, gamut mapping, zero dependencies.
 *
 * @example
 * ```ts
 * import { simulate, simulateBuffer, getMatrix } from 'chromanopia'
 *
 * // Single color
 * simulate('#e63946', 'protanopia')
 * simulate({ r: 230, g: 57, b: 70 }, 'deuteranopia', { model: 'brettel' })
 *
 * // Pixel buffer (Canvas, Sharp, etc.)
 * simulateBuffer(imageData.data, 'protanopia', { severity: 0.8 })
 *
 * // Raw matrix for WebGL / Sharp recomb
 * getMatrix('tritanopia', { model: 'vienot' })
 * ```
 */

// Public API
export { simulate, simulateBuffer, getMatrix, isMatrixModel } from "./simulate"

// Types & metadata
export {
  type ColorblindType,
  type ColorblindModel,
  type SimulateOptions,
  type RGB,
  type Matrix3x3,
  type DeficiencyInfo,
  type ModelInfo,
  COLORBLIND_TYPES,
  COLORBLIND_MODELS,
} from "./types"

// Low-level utilities (for advanced use)
export { hexToRgb, rgbToHex } from "./convert"
export { srgbToLinear, linearToSrgb, gamutMap } from "./core"
