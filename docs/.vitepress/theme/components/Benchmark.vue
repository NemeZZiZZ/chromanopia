<script setup lang="ts">
import { ref, computed } from 'vue'
import { simulateBuffer, getMatrix } from '../../../../src/index'
import type { ColorblindType, ColorblindModel } from '../../../../src/index'

interface BenchResult {
  label: string
  resolution: string
  pixels: number
  model: ColorblindModel
  type: ColorblindType
  time: number
  opsPerSec: number
  mpixPerSec: number
}

const results = ref<BenchResult[]>([])
const isRunning = ref(false)
const progress = ref('')

const resolutions = [
  { label: 'VGA', w: 640, h: 480 },
  { label: 'HD', w: 1280, h: 720 },
  { label: 'Full HD', w: 1920, h: 1080 },
  { label: '4K', w: 3840, h: 2160 },
]

const models: ColorblindModel[] = ['vienot', 'machado', 'brettel']
const benchType: ColorblindType = 'protanopia'

function createTestBuffer(w: number, h: number): Uint8ClampedArray {
  const buf = new Uint8ClampedArray(w * h * 4)
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = Math.random() * 255
    buf[i + 1] = Math.random() * 255
    buf[i + 2] = Math.random() * 255
    buf[i + 3] = 255
  }
  return buf
}

async function runBenchmark() {
  isRunning.value = true
  results.value = []

  // Warmup
  progress.value = 'Warming up...'
  await tick()
  const warmBuf = createTestBuffer(64, 64)
  for (let i = 0; i < 50; i++) {
    simulateBuffer(warmBuf, 'protanopia', { model: 'machado' })
  }

  for (const res of resolutions) {
    for (const model of models) {
      progress.value = `${res.label} / ${model}...`
      await tick()

      const buf = createTestBuffer(res.w, res.h)
      const pixels = res.w * res.h

      // Determine iterations: aim for ~500ms total
      const single = measureOnce(buf, benchType, model)
      const iterations = Math.max(3, Math.min(100, Math.ceil(500 / Math.max(single, 0.1))))

      // Actual measurement
      const times: number[] = []
      for (let i = 0; i < iterations; i++) {
        times.push(measureOnce(buf, benchType, model))
      }
      times.sort((a, b) => a - b)

      // Median
      const median = times[Math.floor(times.length / 2)]!

      results.value.push({
        label: res.label,
        resolution: `${res.w}×${res.h}`,
        pixels,
        model,
        type: benchType,
        time: median,
        opsPerSec: 1000 / median,
        mpixPerSec: (pixels / 1e6) / (median / 1000),
      })
    }
  }

  progress.value = ''
  isRunning.value = false
}

function measureOnce(buf: Uint8ClampedArray, type: ColorblindType, model: ColorblindModel): number {
  const copy = new Uint8ClampedArray(buf)
  const start = performance.now()
  simulateBuffer(copy, type, { model })
  return performance.now() - start
}

function tick(): Promise<void> {
  return new Promise(r => setTimeout(r, 1))
}

const grouped = computed(() => {
  const map = new Map<string, BenchResult[]>()
  for (const r of results.value) {
    const key = r.label
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return [...map.entries()]
})

function fmtTime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`
  if (ms < 100) return `${ms.toFixed(1)}ms`
  return `${ms.toFixed(0)}ms`
}

function fmtMpix(v: number): string {
  return `${v.toFixed(1)} Mpix/s`
}

function barWidth(ms: number): string {
  const maxMs = Math.max(...results.value.map(r => r.time), 1)
  return `${Math.max(3, (ms / maxMs) * 100)}%`
}

function barColor(model: ColorblindModel): string {
  if (model === 'vienot') return '#2a9d8f'
  if (model === 'machado') return '#e9c46a'
  return '#e63946'
}
</script>

<template>
  <div class="demo-container">
    <div class="bench-header">
      <button class="bench-btn" :disabled="isRunning" @click="runBenchmark">
        {{ isRunning ? progress : 'Run Benchmark' }}
      </button>
      <span v-if="!results.length && !isRunning" class="bench-note">
        Measures simulateBuffer() performance for protanopia across resolutions and models.
        Runs in your browser — results depend on your hardware.
      </span>
    </div>

    <div v-if="results.length" class="bench-results">
      <div v-for="[label, items] in grouped" :key="label" class="bench-group">
        <div class="bench-group-header">
          <strong>{{ label }}</strong>
          <span class="bench-resolution">{{ items[0]!.resolution }} ({{ (items[0]!.pixels / 1e6).toFixed(1) }}M px)</span>
        </div>
        <div v-for="r in items" :key="r.model" class="bench-row">
          <div class="bench-model">{{ r.model }}</div>
          <div class="bench-bar-wrap">
            <div class="bench-bar" :style="{ width: barWidth(r.time), background: barColor(r.model) }" />
          </div>
          <div class="bench-value">{{ fmtTime(r.time) }}</div>
          <div class="bench-throughput">{{ fmtMpix(r.mpixPerSec) }}</div>
        </div>
      </div>
    </div>

    <div v-if="results.length" class="bench-legend">
      <span><span class="legend-dot" style="background:#2a9d8f" /> Viénot (fastest)</span>
      <span><span class="legend-dot" style="background:#e9c46a" /> Machado</span>
      <span><span class="legend-dot" style="background:#e63946" /> Brettel (most accurate)</span>
    </div>
  </div>
</template>

<style scoped>
.bench-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.bench-btn {
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  min-width: 160px;
}

.bench-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}

.bench-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.bench-note {
  font-size: 12px;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}

.bench-results {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bench-group-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.bench-group-header strong {
  font-size: 14px;
}

.bench-resolution {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}

.bench-row {
  display: grid;
  grid-template-columns: 80px 1fr 70px 110px;
  align-items: center;
  gap: 8px;
  height: 28px;
}

.bench-model {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.bench-bar-wrap {
  height: 18px;
  background: var(--vp-c-bg);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}

.bench-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.bench-value {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 600;
  text-align: right;
}

.bench-throughput {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
  text-align: right;
}

.bench-legend {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  flex-wrap: wrap;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
</style>
