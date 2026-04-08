/**
 * All supported color vision deficiency types.
 * `"none"` represents normal vision (identity / no-op).
 */
export type ColorblindType =
  | "none"
  | "protanopia"
  | "protanomaly"
  | "deuteranopia"
  | "deuteranomaly"
  | "tritanopia"
  | "tritanomaly"
  | "achromatopsia"
  | "achromatomaly"

/**
 * Available simulation models.
 * - `"vienot"` — Viénot, Brettel & Mollon (1999). Fast 3×3 matrix, non-negative values.
 * - `"machado"` — Machado, Oliveira & Fernandes (2009). Spectral-shift 3×3 matrix, most popular.
 * - `"brettel"` — Brettel, Viénot & Mollon (1997). Per-pixel CIE xyY projection, most accurate.
 */
export type ColorblindModel = "vienot" | "machado" | "brettel"

/** Simulation options. */
export interface SimulateOptions {
  /** Simulation model. Default: `"machado"`. */
  model?: ColorblindModel
  /** Deficiency severity from 0 (none) to 1 (full). Default: `1`. */
  severity?: number
}

/** RGB color as an object with 0–255 integer channels. */
export interface RGB {
  r: number
  g: number
  b: number
}

/** A 3×3 color matrix as a flat 9-element tuple in row-major order. */
export type Matrix3x3 = [
  number, number, number,
  number, number, number,
  number, number, number,
]

/** Metadata for a deficiency type. */
export interface DeficiencyInfo {
  label: string
  description: string
  /** Representative color preview (hex). */
  color: string
}

/** Metadata for a simulation model. */
export interface ModelInfo {
  label: string
  description: string
}

/** Registry of all deficiency types with metadata. */
export const COLORBLIND_TYPES: Record<ColorblindType, DeficiencyInfo> = {
  none: {
    label: "Normal Vision",
    description: "No color vision deficiency",
    color: "#e63946",
  },
  protanopia: {
    label: "Protanopia",
    description: "Red-blind, cannot perceive red light",
    color: "#9b9a43",
  },
  protanomaly: {
    label: "Protanomaly",
    description: "Red-weak, reduced sensitivity to red",
    color: "#c67344",
  },
  deuteranopia: {
    label: "Deuteranopia",
    description: "Green-blind, cannot perceive green light",
    color: "#a5b242",
  },
  deuteranomaly: {
    label: "Deuteranomaly",
    description: "Green-weak, reduced sensitivity to green",
    color: "#c36644",
  },
  tritanopia: {
    label: "Tritanopia",
    description: "Blue-blind, cannot perceive blue light",
    color: "#dd4040",
  },
  tritanomaly: {
    label: "Tritanomaly",
    description: "Blue-weak, reduced sensitivity to blue",
    color: "#e03c44",
  },
  achromatopsia: {
    label: "Achromatopsia",
    description: "Total color blindness, sees only grayscale",
    color: "#6e6e6e",
  },
  achromatomaly: {
    label: "Achromatomaly",
    description: "Partial color blindness, reduced color perception",
    color: "#a5565c",
  },
}

/** Registry of all simulation models with metadata. */
export const COLORBLIND_MODELS: Record<ColorblindModel, ModelInfo> = {
  vienot: {
    label: "Viénot",
    description: "Simplified 3×3 matrix (1999), fast and widely used",
  },
  machado: {
    label: "Machado",
    description: "Spectral-shift 3×3 matrix (2009), more accurate",
  },
  brettel: {
    label: "Brettel",
    description: "Confusion-point projection in CIE xyY (1997), most accurate, slower",
  },
}
