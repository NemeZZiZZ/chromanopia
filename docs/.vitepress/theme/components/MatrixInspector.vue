<script setup lang="ts">
import { ref, computed } from 'vue'
import { getMatrix, isMatrixModel, COLORBLIND_TYPES } from '../../../../src/index'
import type { ColorblindType, ColorblindModel } from '../../../../src/index'

const type = ref<Exclude<ColorblindType, 'none'>>('protanopia')
const model = ref<'vienot' | 'machado'>('machado')
const severity = ref(1)

const typeOptions = Object.entries(COLORBLIND_TYPES)
  .filter(([k]) => k !== 'none') as [Exclude<ColorblindType, 'none'>, any][]

const matrix = computed(() =>
  getMatrix(type.value, { model: model.value, severity: severity.value })
)

const formatted = computed(() => {
  const m = matrix.value
  return [
    [m[0], m[1], m[2]],
    [m[3], m[4], m[5]],
    [m[6], m[7], m[8]],
  ]
})

const rowSums = computed(() =>
  formatted.value.map(row => row.reduce((a, b) => a + b!, 0))
)

const jsCode = computed(() => {
  const m = matrix.value
  return `getMatrix('${type.value}', { model: '${model.value}', severity: ${severity.value} })
// → [${m.map(v => v!.toFixed(6)).join(', ')}]`
})

const glslCode = computed(() => {
  const m = matrix.value
  return `// Column-major for GLSL
mat3 cvd = mat3(
  ${m[0]!.toFixed(6)}, ${m[3]!.toFixed(6)}, ${m[6]!.toFixed(6)},
  ${m[1]!.toFixed(6)}, ${m[4]!.toFixed(6)}, ${m[7]!.toFixed(6)},
  ${m[2]!.toFixed(6)}, ${m[5]!.toFixed(6)}, ${m[8]!.toFixed(6)}
);`
})
</script>

<template>
  <div class="demo-container">
    <div class="demo-controls">
      <label>
        Type
        <select v-model="type">
          <option v-for="[k, v] in typeOptions" :key="k" :value="k">{{ v.label }}</option>
        </select>
      </label>
      <label>
        Model
        <select v-model="model">
          <option value="machado">Machado</option>
          <option value="vienot">Viénot</option>
        </select>
      </label>
      <label>
        Severity
        <input type="range" min="0" max="1" step="0.01" v-model.number="severity" />
        <span class="severity-value">{{ severity.toFixed(2) }}</span>
      </label>
    </div>

    <div class="matrix-visual">
      <table class="matrix-table">
        <thead>
          <tr>
            <th></th>
            <th>R</th>
            <th>G</th>
            <th>B</th>
            <th class="sum-col">Σ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in formatted" :key="i">
            <th>{{ ['R', 'G', 'B'][i] }}'</th>
            <td
              v-for="(val, j) in row"
              :key="j"
              :class="{ negative: val! < 0, dominant: val! > 0.5, zero: Math.abs(val!) < 0.0001 }"
            >
              {{ val!.toFixed(6) }}
            </td>
            <td class="sum-col" :class="{ 'sum-ok': Math.abs(rowSums[i]! - 1) < 0.001 }">
              {{ rowSums[i]!.toFixed(4) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <details style="margin-top: 12px;">
      <summary style="cursor: pointer; font-size: 13px; color: var(--vp-c-text-2);">JavaScript / GLSL snippets</summary>
      <div class="demo-matrix" style="margin-top: 8px;">{{ jsCode }}</div>
      <div class="demo-matrix" style="margin-top: 8px;">{{ glslCode }}</div>
    </details>
  </div>
</template>

<style scoped>
.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
}

.matrix-table th,
.matrix-table td {
  padding: 8px 12px;
  text-align: right;
  border: 1px solid var(--vp-c-divider);
}

.matrix-table th {
  background: var(--vp-c-bg);
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.matrix-table td {
  background: var(--vp-c-bg);
  transition: background 0.2s;
}

.matrix-table td.negative {
  color: #e63946;
  background: rgba(230, 57, 70, 0.05);
}

.matrix-table td.dominant {
  font-weight: 600;
}

.matrix-table td.zero {
  color: var(--vp-c-text-3);
}

.sum-col {
  border-left: 2px solid var(--vp-c-divider) !important;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.sum-ok {
  color: #4caf50 !important;
}
</style>
