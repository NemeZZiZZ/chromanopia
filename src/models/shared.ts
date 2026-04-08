/**
 * Shared matrices for rod monochromacy (achromatopsia / achromatomaly).
 * These are not model-specific — they use Rec. 709 luminance coefficients.
 */

import type { Matrix3x3 } from "../types"

/** Full rod monochromacy: Rec. 709 grayscale. */
export const ACHROMATOPSIA_MATRIX: Matrix3x3 = [
  0.2126, 0.7152, 0.0722,
  0.2126, 0.7152, 0.0722,
  0.2126, 0.7152, 0.0722,
]

/** Partial rod monochromacy: blended toward grayscale. */
export const ACHROMATOMALY_MATRIX: Matrix3x3 = [
  0.6063, 0.3576, 0.0361,
  0.1063, 0.8576, 0.0361,
  0.1063, 0.3576, 0.5361,
]
