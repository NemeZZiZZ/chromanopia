<script setup lang="ts">
import { ref, computed } from 'vue'
import { simulate, COLORBLIND_TYPES } from '../../../../src/index'
import type { ColorblindType, ColorblindModel } from '../../../../src/index'

const color = ref('#e63946')
const model = ref<ColorblindModel>('machado')
const severity = ref(1)

const types = Object.entries(COLORBLIND_TYPES) as [ColorblindType, typeof COLORBLIND_TYPES[ColorblindType]][]

const results = computed(() =>
  types.map(([type, info]) => ({
    type,
    label: info.label,
    description: info.description,
    hex: type === 'none' ? color.value : simulate(color.value, type, { model: model.value, severity: severity.value }),
  }))
)
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
        Model
        <select v-model="model">
          <option value="machado">Machado (2009)</option>
          <option value="vienot">Viénot (1999)</option>
          <option value="brettel">Brettel (1997)</option>
        </select>
      </label>
      <label>
        Severity
        <input type="range" min="0" max="1" step="0.01" v-model.number="severity" />
        <span class="severity-value">{{ severity.toFixed(2) }}</span>
      </label>
    </div>
    <div class="demo-grid demo-grid-3">
      <div v-for="r in results" :key="r.type" class="demo-swatch">
        <div class="demo-color-box" :style="{ background: r.hex }" />
        <span class="demo-label">{{ r.label }}</span>
        <span class="demo-sublabel">{{ r.hex }}</span>
      </div>
    </div>
  </div>
</template>
