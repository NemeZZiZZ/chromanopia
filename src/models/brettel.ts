/**
 * Brettel, Viénot & Mollon (1997) — per-pixel confusion-point projection in CIE xyY.
 * Source: Wickline implementation (colorlab.wickline.org).
 */

import type { ColorblindType } from "../types"

/** sRGB → XYZ (D65) matrix, row-major. */
// prettier-ignore
const M_RGB_XYZ = [
  0.4124564, 0.3575761, 0.1804375,
  0.2126729, 0.7151522, 0.0721750,
  0.0193339, 0.1191920, 0.9503041,
]

/** XYZ → sRGB (D65) matrix, row-major. */
// prettier-ignore
const M_XYZ_RGB = [
   3.2404542, -1.5371385, -0.4985314,
  -0.9692660,  1.8760108,  0.0415560,
   0.0556434, -0.2040259,  1.0572252,
]

/**
 * Confusion-point data for each cone deficiency.
 * - x, y: confusion point in CIE xy chromaticity
 * - m: slope of the color axis (between two spectral anchor wavelengths)
 * - yi: y-intercept of the color axis at x=0
 */
const BRETTEL_PARAMS: Record<"protan" | "deutan" | "tritan", {
  x: number; y: number; m: number; yi: number
}> = {
  protan: { x: 0.7465, y: 0.2535, m: 1.273463, yi: -0.073894 },
  deutan: { x: 1.4, y: -0.4, m: 0.968437, yi: 0.003331 },
  tritan: { x: 0.1748, y: 0, m: 0.062921, yi: 0.292119 },
}

type ConeType = "protan" | "deutan" | "tritan"

/** Map ColorblindType → cone type (null for rod monochromacy). */
export const BRETTEL_TYPE_MAP: Record<Exclude<ColorblindType, "none">, ConeType | null> = {
  protanopia: "protan",
  protanomaly: "protan",
  deuteranopia: "deutan",
  deuteranomaly: "deutan",
  tritanopia: "tritan",
  tritanomaly: "tritan",
  achromatopsia: null,
  achromatomaly: null,
}

/** Whether the type is an anomaly (partial) variant. */
export const BRETTEL_IS_ANOMALY: Record<Exclude<ColorblindType, "none">, boolean> = {
  protanopia: false,
  protanomaly: true,
  deuteranopia: false,
  deuteranomaly: true,
  tritanopia: false,
  tritanomaly: true,
  achromatopsia: false,
  achromatomaly: true,
}

/**
 * Simulates a single pixel in linear RGB using Brettel's confusion-point projection.
 * Returns simulated linear RGB with gamut mapping applied.
 */
export function brettelSimPixel(
  lr: number, lg: number, lb: number,
  coneType: ConeType,
): [number, number, number] {
  const M = M_RGB_XYZ
  const X = lr * M[0]! + lg * M[1]! + lb * M[2]!
  const Y = lr * M[3]! + lg * M[4]! + lb * M[5]!
  const Z = lr * M[6]! + lg * M[7]! + lb * M[8]!

  const sum = X + Y + Z
  if (sum < 1e-10) return [0, 0, 0]
  const cx = X / sum
  const cy = Y / sum

  const line = BRETTEL_PARAMS[coneType]

  const dCx = cx - line.x
  // If the pixel chromaticity coincides with the confusion point, it is
  // already on the confusion line — return the original color unchanged.
  if (Math.abs(dCx) < 1e-10) return [lr, lg, lb]

  const slope = (cy - line.y) / dCx
  const yi = cy - cx * slope

  const slopeDiff = slope - line.m
  // If the pixel's confusion line is parallel to the model axis,
  // return the original color (degenerate case).
  if (Math.abs(slopeDiff) < 1e-10) return [lr, lg, lb]

  const dx = (line.yi - yi) / slopeDiff
  const dy = slope * dx + yi

  // Protect against zero dy (chromaticity on the alychne).
  if (Math.abs(dy) < 1e-10) return [lr, lg, lb]

  const sX = dx * Y / dy
  const sY = Y
  const sZ = (1 - (dx + dy)) * Y / dy

  const Mi = M_XYZ_RGB
  let sR = sX * Mi[0]! + sY * Mi[1]! + sZ * Mi[2]!
  let sG = sX * Mi[3]! + sY * Mi[4]! + sZ * Mi[5]!
  let sB = sX * Mi[6]! + sY * Mi[7]! + sZ * Mi[8]!

  // Gamut mapping: shift toward D65 neutral gray
  const ngX = 0.312713 * Y / 0.329016
  const ngZ = 0.358271 * Y / 0.329016
  const dX = ngX - sX
  const dZ = ngZ - sZ
  const dR = dX * Mi[0]! + dZ * Mi[2]!
  const dG = dX * Mi[3]! + dZ * Mi[5]!
  const dB = dX * Mi[6]! + dZ * Mi[8]!

  let adjR = dR === 0 ? 0 : ((sR < 0 ? 0 : 1) - sR) / dR
  let adjG = dG === 0 ? 0 : ((sG < 0 ? 0 : 1) - sG) / dG
  let adjB = dB === 0 ? 0 : ((sB < 0 ? 0 : 1) - sB) / dB
  if (adjR > 1 || adjR < 0) adjR = 0
  if (adjG > 1 || adjG < 0) adjG = 0
  if (adjB > 1 || adjB < 0) adjB = 0
  const adjust = Math.max(adjR, adjG, adjB)

  sR += adjust * dR
  sG += adjust * dG
  sB += adjust * dB

  return [
    Math.max(0, Math.min(1, sR)),
    Math.max(0, Math.min(1, sG)),
    Math.max(0, Math.min(1, sB)),
  ]
}
