/**
 * Hex ↔ RGB conversion utilities.
 */

import type { RGB } from "./types"

/** Parses a hex color string (#RGB, #RRGGBB, RGB, RRGGBB) into an RGB object. */
export function hexToRgb(hex: string): RGB {
  let h = hex.replace(/^#/, "")

  if (h.length === 3) {
    h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!
  }

  if (h.length !== 6) {
    throw new Error(`Invalid hex color: "${hex}"`)
  }

  const n = parseInt(h, 16)
  if (isNaN(n)) throw new Error(`Invalid hex color: "${hex}"`)

  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  }
}

/** Converts an RGB object to a 6-digit hex string with # prefix. */
export function rgbToHex(rgb: RGB): string {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r)))
  const g = Math.max(0, Math.min(255, Math.round(rgb.g)))
  const b = Math.max(0, Math.min(255, Math.round(rgb.b)))
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}
