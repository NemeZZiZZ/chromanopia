/**
 * Viénot, Brettel & Mollon (1999) — 3×3 matrices, severity 1.0.
 * All values ≥ 0, row sums = 1.0.
 */

import type { ColorblindType, Matrix3x3 } from "../types"
import { ACHROMATOPSIA_MATRIX, ACHROMATOMALY_MATRIX } from "./shared"

export const VIENOT_MATRICES: Record<Exclude<ColorblindType, "none">, Matrix3x3> = {
  protanopia:    [0.56667, 0.43333, 0, 0.55833, 0.44167, 0, 0, 0.24167, 0.75833],
  protanomaly:   [0.81667, 0.18333, 0, 0.33333, 0.66667, 0, 0, 0.125, 0.875],
  deuteranopia:  [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  deuteranomaly: [0.8, 0.2, 0, 0.25833, 0.74167, 0, 0, 0.14167, 0.85833],
  tritanopia:    [0.95, 0.05, 0, 0, 0.43333, 0.56667, 0, 0.475, 0.525],
  tritanomaly:   [0.96667, 0.03333, 0, 0, 0.73333, 0.26667, 0, 0.18333, 0.81667],
  achromatopsia: ACHROMATOPSIA_MATRIX,
  achromatomaly: ACHROMATOMALY_MATRIX,
}
