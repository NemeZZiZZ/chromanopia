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
export { simulate, simulateBuffer, simulatePalette, getMatrix, isMatrixModel } from "./simulate"

// Accessibility helpers
export {
  relativeLuminance,
  contrastRatio,
  colorDistance,
  isDistinguishable,
} from "./accessibility"

// Types & metadata
export {
  type ColorblindType,
  type ColorblindModel,
  type SimulateOptions,
  type RGB,
  type HSL,
  type Matrix3x3,
  type DeficiencyInfo,
  type ModelInfo,
  COLORBLIND_TYPES,
  COLORBLIND_MODELS,
} from "./types"

// Color conversion utilities
export {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  toRgb,
  parseCssColor,
} from "./convert"

// Low-level utilities (for advanced use)
export { srgbToLinear, linearToSrgb, gamutMap } from "./core"
