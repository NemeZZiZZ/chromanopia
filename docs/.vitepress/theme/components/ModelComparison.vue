<script setup lang="ts">
import { ref, computed } from 'vue'
import { simulate, getMatrix, isMatrixModel, COLORBLIND_TYPES } from '../../../../src/index'
import type { ColorblindType, ColorblindModel } from '../../../../src/index'

const color = ref('#e63946')
const type = ref<Exclude<ColorblindType, 'none'>>('protanopia')
const severity = ref(1)

const models: { id: ColorblindModel; label: string; year: number; method: string }[] = [
  { id: 'vienot', label: 'Viénot', year: 1999, method: '3×3 matrix, non-negative' },
  { id: 'machado', label: 'Machado', year: 2009, method: '3×3 spectral-shift matrix' },
  { id: 'brettel', label: 'Brettel', year: 1997, method: 'Per-pixel CIE xyY projection' },
]

const typeOptions = Object.entries(COLORBLIND_TYPES)
  .filter(([k]) => k !== 'none') as [Exclude<ColorblindType, 'none'>, any][]

const comparison = computed(() =>
  models.map(m => {
    const hex = simulate(color.value, type.value, { model: m.id, severity: severity.value })
    let matrix: string | null = null
    if (isMatrixModel(m.id)) {
      const mat = getMatrix(type.value, { model: m.id, severity: severity.value })
      matrix = formatMatrix(mat)
    }
    return { ...m, hex, matrix }
  })
)

function formatMatrix(m: number[]): string {
  const rows = [
    `[ ${m[0]!.toFixed(6)}, ${m[1]!.toFixed(6)}, ${m[2]!.toFixed(6)} ]`,
    `[ ${m[3]!.toFixed(6)}, ${m[4]!.toFixed(6)}, ${m[5]!.toFixed(6)} ]`,
    `[ ${m[6]!.toFixed(6)}, ${m[7]!.toFixed(6)}, ${m[8]!.toFixed(6)} ]`,
  ]
  return rows.join('\n')
}
</script>

<template>
  <div class="demo-container">
    <div class="demo-controls">
      <label>
        Color
        <input type="color" v-model="color" />
        <code>{{ color }}</code>
      </label>
      <label>
        Type
        <select v-model="type">
          <option v-for="[k, v] in typeOptions" :key="k" :value="k">{{ v.label }}</option>
        </select>
      </label>
      <label>
        Severity
        <input type="range" min="0" max="1" step="0.01" v-model.number="severity" />
        <span class="severity-value">{{ severity.toFixed(2) }}</span>
      </label>
    </div>

    <div class="comparison-grid">
      <div v-for="m in comparison" :key="m.id" class="comparison-card">
        <div class="comparison-header">
          <div class="comparison-swatch-row">
            <div class="comparison-swatch-original" :style="{ background: color }" />
            <span class="comparison-arrow">→</span>
            <div class="comparison-swatch-result" :style="{ background: m.hex }" />
          </div>
        </div>
        <div class="comparison-info">
          <strong>{{ m.label }}</strong> <span class="comparison-year">({{ m.year }})</span>
          <div class="comparison-method">{{ m.method }}</div>
          <div class="comparison-hex">{{ m.hex }}</div>
        </div>
        <div v-if="m.matrix" class="demo-matrix">{{ m.matrix }}</div>
        <div v-else class="demo-matrix" style="color: var(--vp-c-text-3); font-style: italic;">
          Per-pixel projection (no single matrix)
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.comparison-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  background: var(--vp-c-bg);
}

.comparison-swatch-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.comparison-swatch-original,
.comparison-swatch-result {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
}

.comparison-arrow {
  font-size: 18px;
  color: var(--vp-c-text-3);
}

.comparison-info strong {
  font-size: 15px;
}

.comparison-year {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.comparison-method {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin: 4px 0 8px;
}

.comparison-hex {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-brand-1);
  margin-bottom: 8px;
}
</style>
