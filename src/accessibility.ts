/**
 * Accessibility helpers built on top of the simulation core:
 * relative luminance, WCAG contrast ratio, perceptual color distance,
 * and a "are these two colors distinguishable under a deficiency" check.
 */

import { relativeLuminance } from "./core"
import { simulate } from "./simulate"
import { toRgb } from "./convert"
import type { ColorblindType, RGB, SimulateOptions } from "./types"

export { relativeLuminance } from "./core"

/**
 * WCAG 2.x contrast ratio between two colors, in [1, 21].
 *
 * Accepts any color form `toRgb` understands (hex string, `rgb()`, RGB/HSL object).
 *
 * @example
 * ```ts
 * contrastRatio('#fff', '#000') // 21
 * contrastRatio('#777', '#888') // ~1.13 (fails WCAG AA for normal text)
 * ```
 */
export function contrastRatio(a: string | RGB, b: string | RGB): number {
  const la = relativeLuminanceOf(a)
  const lb = relativeLuminanceOf(b)
  const lighter = la > lb ? la : lb
  const darker = la > lb ? lb : la
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Squared Euclidean distance in sRGB [0,255]³ between two colors.
 * Cheap and monotonic with perceptual difference; use `colorDistance` for a
 * quick ordering and `deltaE`-style metrics when you need perceptual uniformity.
 */
export function colorDistance(a: string | RGB, b: string | RGB): number {
  const ca = toRgb(a)
  const cb = toRgb(b)
  const dr = ca.r - cb.r
  const dg = ca.g - cb.g
  const db = ca.b - cb.b
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

/**
 * Returns `true` if two colors remain distinguishable after simulating a given
 * deficiency, i.e. their post-simulation sRGB distance exceeds `threshold`.
 *
 * Useful for accessibility checks: will a protanope be able to tell these two
 * colors apart? Default `threshold` of 30 ≈ a clearly visible difference on an
 * sRGB screen; tune to your application.
 *
 * @param a First color (any form `toRgb` accepts).
 * @param b Second color.
 * @param type Deficiency to simulate. Use `"none"` for normal-vision distance.
 * @param options Simulation model/severity (default Machado, severity 1).
 * @param threshold Minimum sRGB Euclidean distance to count as distinguishable.
 */
export function isDistinguishable(
  a: string | RGB,
  b: string | RGB,
  type: ColorblindType,
  options: SimulateOptions = {},
  threshold = 30,
): boolean {
  if (type === "none") return colorDistance(a, b) >= threshold
  const sa = simulate(a, type, options)
  const sb = simulate(b, type, options)
  return colorDistance(sa, sb) >= threshold
}

/**
 * Maps a color of any supported form to its WCAG relative luminance.
 */
function relativeLuminanceOf(color: string | RGB): number {
  const { r, g, b } = toRgb(color)
  return relativeLuminance(r, g, b)
}
