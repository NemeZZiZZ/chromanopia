<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { simulateBuffer } from '../../../../src/index'
import type { ColorblindType, ColorblindModel } from '../../../../src/index'

const canvasRef = ref<HTMLCanvasElement>()
const fileInput = ref<HTMLInputElement>()
const type = ref<ColorblindType>('protanopia')
const model = ref<ColorblindModel>('machado')
const severity = ref(1)
const hasImage = ref(false)

let originalData: ImageData | null = null

function loadImage(src: string) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const canvas = canvasRef.value!
    const maxW = 600
    const scale = Math.min(1, maxW / img.width)
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    originalData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    hasImage.value = true
    applySimulation()
  }
  img.src = src
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  loadImage(url)
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  const url = URL.createObjectURL(file)
  loadImage(url)
}

function applySimulation() {
  if (!originalData || !canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')!
  const copy = new ImageData(
    new Uint8ClampedArray(originalData.data),
    originalData.width,
    originalData.height,
  )
  simulateBuffer(copy.data, type.value, { model: model.value, severity: severity.value })
  ctx.putImageData(copy, 0, 0)
}

watch([type, model, severity], applySimulation)

onMounted(() => {
  // Load a default sample gradient
  const canvas = canvasRef.value!
  canvas.width = 600
  canvas.height = 200
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 600, 0)
  grad.addColorStop(0, '#e63946')
  grad.addColorStop(0.17, '#f4a261')
  grad.addColorStop(0.33, '#e9c46a')
  grad.addColorStop(0.5, '#2a9d8f')
  grad.addColorStop(0.67, '#264653')
  grad.addColorStop(0.83, '#6a4c93')
  grad.addColorStop(1, '#1982c4')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 600, 200)

  // Add color circles
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
  colors.forEach((c, i) => {
    ctx.beginPath()
    ctx.arc(60 + i * 96, 100, 35, 0, Math.PI * 2)
    ctx.fillStyle = c
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
  })

  originalData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  hasImage.value = true
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
      class="demo-canvas-wrap"
      @dragover.prevent
      @drop="onDrop"
    >
      <canvas ref="canvasRef" />
    </div>
    <p style="font-size: 12px; color: var(--vp-c-text-3); margin-top: 8px;">
      Drag & drop an image or click "Upload image". Processing happens entirely in your browser.
    </p>
  </div>
</template>

<style scoped>
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
