<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { simulateBuffer } from '../../../../src/index'
import type { ColorblindType, ColorblindModel } from '../../../../src/index'

const containerRef = ref<HTMLDivElement>()
const canvasOriginal = ref<HTMLCanvasElement>()
const canvasSimulated = ref<HTMLCanvasElement>()
const fileInput = ref<HTMLInputElement>()

const split = ref(50)
const isDragging = ref(false)
const type = ref<ColorblindType>('protanopia')
const model = ref<ColorblindModel>('machado')
const severity = ref(1)

let originalData: ImageData | null = null
let canvasW = 600
let canvasH = 300

function loadImage(src: string) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const maxW = containerRef.value?.clientWidth ?? 600
    const scale = Math.min(1, maxW / img.width)
    canvasW = Math.round(img.width * scale)
    canvasH = Math.round(img.height * scale)

    for (const c of [canvasOriginal.value!, canvasSimulated.value!]) {
      c.width = canvasW
      c.height = canvasH
    }

    const ctxOrig = canvasOriginal.value!.getContext('2d')!
    ctxOrig.drawImage(img, 0, 0, canvasW, canvasH)
    originalData = ctxOrig.getImageData(0, 0, canvasW, canvasH)

    applySimulation()
  }
  img.src = src
}

function drawDefaultSample() {
  const maxW = containerRef.value?.clientWidth ?? 600
  canvasW = maxW
  canvasH = Math.round(maxW * 0.45)

  for (const c of [canvasOriginal.value!, canvasSimulated.value!]) {
    c.width = canvasW
    c.height = canvasH
  }

  const ctx = canvasOriginal.value!.getContext('2d')!

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, canvasH * 0.6)
  sky.addColorStop(0, '#4a90d9')
  sky.addColorStop(1, '#87ceeb')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, canvasW, canvasH * 0.6)

  // Ground
  const ground = ctx.createLinearGradient(0, canvasH * 0.55, 0, canvasH)
  ground.addColorStop(0, '#4caf50')
  ground.addColorStop(1, '#2e7d32')
  ctx.fillStyle = ground
  ctx.fillRect(0, canvasH * 0.55, canvasW, canvasH * 0.45)

  // Sun
  ctx.beginPath()
  ctx.arc(canvasW * 0.8, canvasH * 0.2, 30, 0, Math.PI * 2)
  ctx.fillStyle = '#fdd835'
  ctx.fill()

  // Flowers
  const flowerColors = ['#e63946', '#f4a261', '#e040fb', '#ff6f00', '#d32f2f']
  for (let i = 0; i < 20; i++) {
    const fx = Math.random() * canvasW
    const fy = canvasH * 0.58 + Math.random() * canvasH * 0.35
    ctx.beginPath()
    ctx.arc(fx, fy, 5 + Math.random() * 4, 0, Math.PI * 2)
    ctx.fillStyle = flowerColors[i % flowerColors.length]!
    ctx.fill()
  }

  // Trees
  const treePositions = [canvasW * 0.15, canvasW * 0.4, canvasW * 0.65]
  for (const tx of treePositions) {
    // Trunk
    ctx.fillStyle = '#5d4037'
    ctx.fillRect(tx - 6, canvasH * 0.35, 12, canvasH * 0.22)
    // Canopy
    ctx.beginPath()
    ctx.arc(tx, canvasH * 0.32, 28, 0, Math.PI * 2)
    ctx.fillStyle = '#388e3c'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(tx - 15, canvasH * 0.36, 20, 0, Math.PI * 2)
    ctx.fillStyle = '#43a047'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(tx + 15, canvasH * 0.36, 20, 0, Math.PI * 2)
    ctx.fillStyle = '#2e7d32'
    ctx.fill()
  }

  // Rainbow
  const rainbowColors = ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#264653', '#6a4c93']
  for (let i = 0; i < rainbowColors.length; i++) {
    ctx.beginPath()
    ctx.arc(canvasW * 0.5, canvasH * 0.65, 120 - i * 8, Math.PI, 0)
    ctx.strokeStyle = rainbowColors[i]!
    ctx.lineWidth = 7
    ctx.stroke()
  }

  // Color bar at bottom
  const barH = 24
  const barY = canvasH - barH
  const barColors = ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#264653', '#6a4c93', '#1982c4']
  const segW = canvasW / barColors.length
  barColors.forEach((c, i) => {
    ctx.fillStyle = c
    ctx.fillRect(i * segW, barY, segW, barH)
  })

  originalData = ctx.getImageData(0, 0, canvasW, canvasH)
  applySimulation()
}

function applySimulation() {
  if (!originalData || !canvasSimulated.value) return
  const ctx = canvasSimulated.value.getContext('2d')!
  const copy = new ImageData(
    new Uint8ClampedArray(originalData.data),
    originalData.width,
    originalData.height,
  )
  simulateBuffer(copy.data, type.value, { model: model.value, severity: severity.value })
  ctx.putImageData(copy, 0, 0)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  loadImage(URL.createObjectURL(file))
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  loadImage(URL.createObjectURL(file))
}

// Split handle dragging
function onPointerDown(e: PointerEvent) {
  isDragging.value = true
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  updateSplit(e)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  updateSplit(e)
}

function onPointerUp() {
  isDragging.value = false
}

function updateSplit(e: PointerEvent) {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  const x = e.clientX - rect.left
  split.value = Math.max(2, Math.min(98, (x / rect.width) * 100))
}

const clipOriginal = computed(() => `inset(0 ${100 - split.value}% 0 0)`)
const clipSimulated = computed(() => `inset(0 0 0 ${split.value}%)`)
const handleLeft = computed(() => `${split.value}%`)

watch([type, model, severity], applySimulation)

onMounted(() => {
  drawDefaultSample()
})
</script>

<template>
  <div class="demo-container">
    <div class="demo-controls">
      <label>
        Type
        <select v-model="type">
          <option value="none">Normal Vision</option>
          <option value="protanopia">Protanopia</option>
          <option value="protanomaly">Protanomaly</option>
          <option value="deuteranopia">Deuteranopia</option>
          <option value="deuteranomaly">Deuteranomaly</option>
          <option value="tritanopia">Tritanopia</option>
          <option value="tritanomaly">Tritanomaly</option>
          <option value="achromatopsia">Achromatopsia</option>
          <option value="achromatomaly">Achromatomaly</option>
        </select>
      </label>
      <label>
        Model
        <select v-model="model">
          <option value="machado">Machado</option>
          <option value="vienot">Viénot</option>
          <option value="brettel">Brettel</option>
        </select>
      </label>
      <label>
        Severity
        <input type="range" min="0" max="1" step="0.01" v-model.number="severity" />
        <span class="severity-value">{{ severity.toFixed(2) }}</span>
      </label>
      <button class="upload-btn" @click="fileInput?.click()">
        Upload image
      </button>
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
    </div>

    <div
      ref="containerRef"
      class="split-container"
      @dragover.prevent
      @drop="onDrop"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
    >
      <!-- Original layer -->
      <div class="split-pane" :style="{ clipPath: clipOriginal }">
        <canvas ref="canvasOriginal" />
        <div class="split-label split-label-left">Original</div>
      </div>

      <!-- Simulated layer -->
      <div class="split-pane" :style="{ clipPath: clipSimulated }">
        <canvas ref="canvasSimulated" />
        <div class="split-label split-label-right">Simulated</div>
      </div>

      <!-- Drag handle -->
      <div
        class="split-handle"
        :style="{ left: handleLeft }"
        @pointerdown="onPointerDown"
      >
        <div class="split-handle-line" />
        <div class="split-handle-grip">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <rect x="3" y="4" width="2" height="16" rx="1" fill="currentColor"/>
            <rect x="7" y="2" width="2" height="20" rx="1" fill="currentColor"/>
            <rect x="11" y="4" width="2" height="16" rx="1" fill="currentColor"/>
          </svg>
        </div>
      </div>
    </div>

    <p class="split-hint">
      Drag the handle to compare. Drop an image to use your own.
    </p>
  </div>
</template>

<style scoped>
.split-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  cursor: col-resize;
  user-select: none;
  touch-action: none;
}

.split-pane {
  position: absolute;
  inset: 0;
}

.split-pane:first-child {
  position: relative;
}

.split-pane canvas {
  display: block;
  width: 100%;
  height: auto;
}

.split-label {
  position: absolute;
  top: 10px;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

.split-label-left { left: 10px; }
.split-label-right { right: 10px; }

.split-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 32px;
  transform: translateX(-50%);
  cursor: col-resize;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.split-handle-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}

.split-handle-grip {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
  color: #999;
  transition: color 0.15s, box-shadow 0.15s;
}

.split-handle:hover .split-handle-grip,
.split-handle:active .split-handle-grip {
  color: var(--vp-c-brand-1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.split-hint {
  font-size: 12px;
  color: var(--vp-c-text-3);
  margin-top: 8px;
  text-align: center;
}

.upload-btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: var(--vp-c-brand-1);
  color: #fff;
}
</style>
