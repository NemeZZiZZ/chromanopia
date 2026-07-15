/**
 * sRGB linearization / companding and gamut mapping utilities.
 */

/** sRGB → linear LUT (256 entries, built once at module load). */
export const SRGB_TO_LINEAR = new Float64Array(256)
for (let i = 0; i < 256; i++) {
  const s = i / 255
  SRGB_TO_LINEAR[i] = s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

/** Rec. 709 luminance weights. */
export const LUM_R = 0.2126
export const LUM_G = 0.7152
export const LUM_B = 0.0722

/** Converts a single sRGB value (0–255) to linear [0,1]. Clamps to valid range. */
export function srgbToLinear(v: number): number {
  return SRGB_TO_LINEAR[Math.max(0, Math.min(255, v)) | 0]!
}

/** Converts a linear [0,1] value to sRGB (0–255). */
export function linearToSrgb(c: number): number {
  const v = c < 0 ? 0 : c > 1 ? 1 : c
  return v <= 0.0031308
    ? Math.round(v * 12.92 * 255)
    : Math.round((1.055 * v ** (1 / 2.4) - 0.055) * 255)
}

/**
 * Relative luminance of an sRGB color, per WCAG 2.x / Rec. 709.
 * Returns a value in [0,1] where 0 is black and 1 is white.
 *
 * Uses the same linearization as the rest of the library (sRGB companding).
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  return LUM_R * srgbToLinear(r) + LUM_G * srgbToLinear(g) + LUM_B * srgbToLinear(b)
}

/**
 * Gamut-maps a linear RGB triplet into [0,1] by desaturating toward its luminance.
 * Preserves brightness and hue better than hard clamp.
 *
 * Guarantees every output channel lies in [0,1], including degenerate cases where
 * the luminance itself is out of gamut (e.g. all channels equally > 1).
 */
export function gamutMap(r: number, g: number, b: number): [number, number, number] {
  if (r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1) {
    return [r, g, b]
  }

  const lum = LUM_R * r + LUM_G * g + LUM_B * b

  // Find how far each offending channel must desaturate toward luminance to
  // re-enter [0,1]. `t` is the largest such fraction (0 = no desaturation,
  // 1 = fully replaced by luminance).
  let t = 0
  for (const ch of [r, g, b]) {
    if (ch < 0) t = Math.max(t, ch / (ch - lum))
    else if (ch > 1) t = Math.max(t, (ch - 1) / (ch - lum))
  }

  // Clamp to the valid interpolation range. When the luminance is itself out of
  // gamut, desaturation alone cannot recover it — clamp the remainder.
  t = t < 0 ? 0 : t > 1 ? 1 : t
  return [
    clamp01(r + t * (lum - r)),
    clamp01(g + t * (lum - g)),
    clamp01(b + t * (lum - b)),
  ]
}

/** Clamps a value to the closed interval [0,1]. */
function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}
