/**
 * Machado, Oliveira & Fernandes (2009) — 3×3 matrices, severity 1.0.
 * Values can be negative and > 1 (spectral-shift model).
 * Machado covers cone deficiencies only; achromatopsia/achromatomaly use Rec. 709 luminance.
 */

import type { ColorblindType, Matrix3x3 } from "../types"
import { ACHROMATOPSIA_MATRIX, ACHROMATOMALY_MATRIX } from "./shared"

export const MACHADO_MATRICES: Record<Exclude<ColorblindType, "none">, Matrix3x3> = {
  // prettier-ignore
  protanopia:    [ 0.152286,  1.052583, -0.204868,  0.114503,  0.786281,  0.099216, -0.003882, -0.048116,  1.051998],
  // prettier-ignore
  protanomaly:   [ 0.458064,  0.679578, -0.137642,  0.092785,  0.846313,  0.060902, -0.007494, -0.016807,  1.024301],
  // prettier-ignore
  deuteranopia:  [ 0.367322,  0.860646, -0.227968,  0.280085,  0.672501,  0.047413, -0.011820,  0.042940,  0.968881],
  // prettier-ignore
  deuteranomaly: [ 0.547494,  0.607765, -0.155259,  0.181692,  0.781742,  0.036566, -0.010410,  0.027275,  0.983136],
  // prettier-ignore
  tritanopia:    [ 1.255528, -0.076749, -0.178779, -0.078411,  0.930809,  0.147602,  0.004733,  0.691367,  0.303900],
  // prettier-ignore
  tritanomaly:   [ 1.017277,  0.027029, -0.044306, -0.006113,  0.958479,  0.047634,  0.006379,  0.248708,  0.744913],
  achromatopsia: ACHROMATOPSIA_MATRIX,
  achromatomaly: ACHROMATOMALY_MATRIX,
}
