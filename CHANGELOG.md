# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-07-15

### Fixed

- **`gamutMap()` could return values outside `[0,1]`** for degenerate inputs (e.g. `gamutMap(1.5, 1.5, 0)` returned `1.39`). The function now clamps the final result so the documented "into `[0,1]`" postcondition always holds, even when the luminance itself is out of gamut.
- **`hexToRgb()` silently accepted partially-invalid hex** like `#12gggg` (the `parseInt` prefix parsed `0x12` and discarded the rest). It now validates the full string with a regex.
- **`simulate(color, "none")` returned the same object reference** for RGB input, so mutating the result mutated the caller's input. It now returns a fresh copy (strings are unchanged, as before).
- Corrected inaccurate example output values in `README.md`, `docs/api/simulate.md`, and the `getting-started` guide across all six languages (en/ja/ru/zh/sr/es). The `getMatrix` example in the guide also used a `machado` call with a `vienot`-style result; both are now consistent.
- Loosened the "row sums = 1.0" comment on the Viénot matrices to "≈ 1.0", matching the rounding of the published coefficients.

### Added

- **Accessibility helpers** (new `accessibility` module):
  - `contrastRatio(a, b)` — WCAG 2.x contrast ratio in `[1, 21]`, accepts hex/`rgb()`/RGB objects.
  - `colorDistance(a, b)` — Euclidean sRGB distance between two colors.
  - `isDistinguishable(a, b, type, options?, threshold?)` — checks whether two colors remain distinguishable after simulating a deficiency.
  - `relativeLuminance(r, g, b)` — WCAG / Rec. 709 relative luminance.
- **Batch API**: `simulatePalette(colors, type, options?)` simulates a whole palette in one call, preserving each element's type, without per-color allocation.
- **Color conversion utilities**:
  - `rgbToHsl` / `hslToRgb` — HSL round-trip.
  - `toRgb(color)` — coerces hex / `rgb()` / RGB / HSL into an RGB object.
  - `parseCssColor(css)` — parses hex (3/4/6/8 digit) and `rgb()`/`rgba()` (legacy comma and modern space syntax, with `%` channels).
- `hexToRgb` now accepts 4-digit (`#RGBA`) and 8-digit (`#RRGGBBAA`) hex; the alpha component is parsed but dropped.
- `HSL` type exported alongside `RGB`.

### Changed

- Documented previously-implicit `severity` behavior: for the Brettel model with anomaly types the effective strength is scaled by `1.75 / 2.75 ≈ 0.636` (Brettel/Wickline convention), and achromatopsia/achromatomaly always fall back to the Rec. 709 luminance matrix regardless of `model`.
- Fixed the `exports` map: the `require` condition pointed at `./dist/index.d.cts`, which was never generated, leaving TypeScript consumers under CJS without type declarations. Both conditions now resolve to the generated `./dist/index.d.ts`.

## [0.1.1]

- Documentation internationalization (en/ja/ru/zh/sr/es).

## [0.1.0]

- Initial release. Three models (Viénot, Machado, Brettel), eight deficiency types, sRGB linearization, gamut mapping, single-color / pixel-buffer / raw-matrix APIs.
