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
  const v = Math.max(0, Math.min(1, c))
  return v <= 0.0031308
    ? Math.round(v * 12.92 * 255)
    : Math.round((1.055 * v ** (1 / 2.4) - 0.055) * 255)
}

/**
 * Gamut-maps a linear RGB triplet into [0,1] by desaturating toward its luminance.
 * Preserves brightness and hue better than hard clamp.
 */
export function gamutMap(r: number, g: number, b: number): [number, number, number] {
  if (r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1) {
    return [r, g, b]
  }

  const lum = LUM_R * r + LUM_G * g + LUM_B * b

  let t = 0
  for (const ch of [r, g, b]) {
    if (ch < 0) t = Math.max(t, ch / (ch - lum))
    else if (ch > 1) t = Math.max(t, (ch - 1) / (ch - lum))
  }

  t = Math.min(t, 1)
  return [
    r + t * (lum - r),
    g + t * (lum - g),
    b + t * (lum - b),
  ]
}
