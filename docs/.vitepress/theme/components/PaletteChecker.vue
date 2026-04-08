<script setup lang="ts">
import { ref, computed } from 'vue'
import { simulate, COLORBLIND_TYPES } from '../../../../src/index'
import type { ColorblindType, ColorblindModel } from '../../../../src/index'

const model = ref<ColorblindModel>('machado')
const colorsText = ref('#e63946, #f4a261, #e9c46a, #2a9d8f, #264653')

const presets = [
  { name: 'Brand', colors: '#e63946, #f4a261, #e9c46a, #2a9d8f, #264653' },
  { name: 'Traffic light', colors: '#d32f2f, #fbc02d, #388e3c' },
  { name: 'Chart', colors: '#1f77b4, #ff7f0e, #2ca02c, #d62728, #9467bd, #8c564b' },
  { name: 'Status', colors: '#4caf50, #ff9800, #f44336, #2196f3, #9e9e9e' },
  { name: 'Categorical', colors: '#e41a1c, #377eb8, #4daf4a, #984ea3, #ff7f00' },
]

const colors = computed(() =>
  colorsText.value
    .split(',')
    .map(c => c.trim())
    .filter(c => /^#?[0-9a-fA-F]{3,6}$/.test(c))
    .map(c => c.startsWith('#') ? c : `#${c}`)
)

const types = Object.entries(COLORBLIND_TYPES) as [ColorblindType, any][]

const rows = computed(() =>
  types.map(([type, info]) => ({
    type,
    label: info.label,
    colors: colors.value.map(c =>
      type === 'none' ? c : simulate(c, type, { model: model.value })
    ),
  }))
)

function contrastRatio(hex1: string, hex2: string): number {
  const lum = (hex: string) => {
    const n = parseInt(hex.replace('#', ''), 16)
    const r = ((n >> 16) & 0xff) / 255
    const g = ((n >> 8) & 0xff) / 255
    const b = (n & 0xff) / 255
    const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  }
  const l1 = lum(hex1)
  const l2 = lum(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

const minContrasts = computed(() =>
  rows.value.map(row => {
    let minC = Infinity
    for (let i = 0; i < row.colors.length; i++) {
      for (let j = i + 1; j < row.colors.length; j++) {
        const c = contrastRatio(row.colors[i]!, row.colors[j]!)
        if (c < minC) minC = c
      }
    }
    return minC === Infinity ? 0 : minC
  })
)
</script>

<template>
  <div class="demo-container">
    <div class="demo-controls">
      <label style="flex: 1;">
        Colors (comma-separated hex)
        <input
          type="text"
          v-model="colorsText"
          style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); font-size: 13px;"
        />
      </label>
      <label>
        Model
        <select v-model="model">
          <option value="machado">Machado</option>
          <option value="vienot">Viénot</option>
          <option value="brettel">Brettel</option>
        </select>
      </label>
    </div>

    <div class="presets">
      <span style="font-size: 12px; color: var(--vp-c-text-3);">Presets:</span>
      <button
        v-for="p in presets"
        :key="p.name"
        class="preset-btn"
        @click="colorsText = p.colors"
      >{{ p.name }}</button>
    </div>

    <div class="palette-table">
      <div v-for="(row, i) in rows" :key="row.type" class="palette-row-wrap">
        <div class="palette-label">
          <span class="demo-label">{{ row.label }}</span>
          <span class="contrast-badge" :class="{ warn: minContrasts[i]! < 2, ok: minContrasts[i]! >= 3 }">
            {{ minContrasts[i]!.toFixed(1) }}:1
          </span>
        </div>
        <div class="demo-palette-row">
          <div
            v-for="(c, j) in row.colors"
            :key="j"
            class="demo-palette-cell"
            :style="{ background: c }"
            :title="c"
          />
        </div>
      </div>
    </div>

    <p style="font-size: 12px; color: var(--vp-c-text-3); margin-top: 12px;">
      The ratio badge shows the minimum pairwise contrast between colors in each row.
      <span style="color: #4caf50;">Green (≥3:1)</span> = easily distinguishable,
      <span style="color: #f44336;">Red (&lt;2:1)</span> = may be confusing.
    </p>
  </div>
</template>

<style scoped>
.presets {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.preset-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.palette-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.palette-row-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.palette-label {
  min-width: 140px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contrast-badge {
  font-size: 11px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--vp-c-bg);
  width: fit-content;
}

.contrast-badge.warn { color: #f44336; background: rgba(244, 67, 54, 0.1); }
.contrast-badge.ok { color: #4caf50; background: rgba(76, 175, 80, 0.1); }

.demo-palette-row {
  flex: 1;
}

.demo-palette-cell {
  min-height: 32px;
}
</style>
