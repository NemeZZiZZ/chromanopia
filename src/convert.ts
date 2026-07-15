/**
 * Hex ↔ RGB conversion utilities.
 */

import type { HSL, RGB } from "./types"

/** Matches #RGB, #RGBA, #RRGGBB, #RRGGBBAA (with or without leading #), case-insensitive. */
const HEX_RE = /^#?(?:([0-9a-f]{3})|([0-9a-f]{4})|([0-9a-f]{6})|([0-9a-f]{8}))$/i

/**
 * Parses a hex color string into an RGB object.
 *
 * Accepts `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA` (with or without the leading `#`).
 * The alpha component (if present) is parsed but not returned — `RGB` has no alpha.
 *
 * @throws If the string is not a valid 3/4/6/8-digit hex color.
 */
export function hexToRgb(hex: string): RGB {
  const match = HEX_RE.exec(hex.trim())
  if (!match) throw new Error(`Invalid hex color: "${hex}"`)

  const [, short3, short4, long6, long8] = match

  if (long8) {
    const n = parseInt(long8, 16)
    return { r: (n >>> 24) & 0xff, g: (n >> 16) & 0xff, b: (n >> 8) & 0xff }
  }
  if (long6) {
    const n = parseInt(long6, 16)
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
  }
  if (short4) {
    return {
      r: parseInt(short4[0]! + short4[0]!, 16),
      g: parseInt(short4[1]! + short4[1]!, 16),
      b: parseInt(short4[2]! + short4[2]!, 16),
    }
  }
  // short3
  return {
    r: parseInt(short3![0]! + short3![0]!, 16),
    g: parseInt(short3![1]! + short3![1]!, 16),
    b: parseInt(short3![2]! + short3![2]!, 16),
  }
}

/** Converts an RGB object to a 6-digit hex string with # prefix. */
export function rgbToHex(rgb: RGB): string {
  const r = rgb.r < 0 ? 0 : rgb.r > 255 ? 255 : Math.round(rgb.r)
  const g = rgb.g < 0 ? 0 : rgb.g > 255 ? 255 : Math.round(rgb.g)
  const b = rgb.b < 0 ? 0 : rgb.b > 255 ? 255 : Math.round(rgb.b)
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

/**
 * Converts an RGB color to HSL.
 * - `h`: hue in degrees [0, 360)
 * - `s`, `l`: saturation and lightness as fractions in [0, 1]
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const l = (max + min) / 2

  let h = 0
  let s = 0
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / d + 2) * 60
        break
      default:
        h = ((r - g) / d + 4) * 60
        break
    }
  }
  return { h, s, l }
}

/**
 * Converts an HSL color to RGB.
 * - `h`: hue in degrees [0, 360); values outside are normalized modulo 360
 * - `s`, `l`: saturation and lightness as fractions in [0, 1]
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = ((hsl.h % 360) + 360) % 360 / 360
  const s = hsl.s < 0 ? 0 : hsl.s > 1 ? 1 : hsl.s
  const l = hsl.l < 0 ? 0 : hsl.l > 1 ? 1 : hsl.l

  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  const hue = (t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  return {
    r: Math.round(hue(h + 1 / 3) * 255),
    g: Math.round(hue(h) * 255),
    b: Math.round(hue(h - 1 / 3) * 255),
  }
}

/**
 * Coerces a color in any accepted form into an RGB object.
 *
 * Accepts hex strings (`"#e63946"`, `"F00"`, `"#RRGGBBAA"`), CSS `rgb()`/`rgba()`
 * strings, HSL objects, or RGB objects (returned as-is).
 *
 * @throws If a string cannot be parsed.
 */
export function toRgb(color: string | RGB | HSL): RGB {
  if (typeof color !== "string") {
    // Distinguish RGB ({r,g,b}) from HSL ({h,s,l}) by the presence of `h`.
    if ("h" in color) return hslToRgb(color)
    return { r: color.r, g: color.g, b: color.b }
  }
  return parseCssColor(color)
}

/**
 * Parses a CSS color string into an RGB object.
 * Supports hex (3/4/6/8 digits) and `rgb()` / `rgba()` functional notation,
 * with or without the `#`/alpha, and with whitespace or comma separators.
 *
 * @throws If the string is not a recognized format.
 */
export function parseCssColor(css: string): RGB {
  const s = css.trim()

  if (s.startsWith("#") || HEX_RE.test(s)) {
    return hexToRgb(s)
  }

  // rgb()/rgba() — modern space syntax "rgb(230 57 70 / 0.5)"
  // and legacy comma syntax "rgba(230, 57, 70, 0.5)".
  const fn = s.match(/^rgba?\s*\(([^)]+)\)$/i)
  if (fn) {
    const parts = fn[1]!.split(/[\s,/]+/).filter(Boolean)
    if (parts.length < 3) throw new Error(`Invalid rgb() color: "${css}"`)
    return {
      r: resolveChannel(parts[0]!),
      g: resolveChannel(parts[1]!),
      b: resolveChannel(parts[2]!),
    }
  }

  throw new Error(`Unsupported color format: "${css}"`)
}

/**
 * Resolves an rgb() channel value.
 * `"50%"` → 127.5; raw numbers are taken as 0–255 (legacy form) and clamped.
 * @throws If the channel is not a finite number or percentage.
 */
function resolveChannel(raw: string): number {
  const isPercent = raw.endsWith("%")
  const n = Number(isPercent ? raw.slice(0, -1) : raw)
  if (!Number.isFinite(n)) throw new Error(`Invalid rgb() channel: "${raw}"`)
  const v = isPercent ? (n / 100) * 255 : n
  return v < 0 ? 0 : v > 255 ? 255 : v
}
