<script setup lang="ts">
defineProps<{
  invert: boolean
  brightness: number
  contrast: number
  hueRotate: number
  saturate: number
}>()

const emit = defineEmits<{
  (e: 'update:invert', value: boolean): void
  (e: 'update:brightness', value: number): void
  (e: 'update:contrast', value: number): void
  (e: 'update:hueRotate', value: number): void
  (e: 'update:saturate', value: number): void
  (e: 'toggle'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <div class="filter-controls">
    <div class="control-header">
      <h3 class="control-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        滤镜控制
      </h3>
      <button class="reset-btn" @click="emit('reset')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        重置
      </button>
    </div>

    <div class="toggle-section">
      <div class="toggle-wrapper">
        <span class="toggle-label">暗黑模式开关</span>
        <button
          class="dark-toggle"
          :class="{ active: invert }"
          @click="emit('toggle')"
        >
          <span class="toggle-track">
            <span class="toggle-thumb">
              <svg v-if="invert" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </span>
          </span>
          <span class="toggle-text">{{ invert ? '已开启' : '已关闭' }}</span>
        </button>
      </div>
    </div>

    <div class="sliders-section">
      <div class="slider-group">
        <div class="slider-header">
          <span class="slider-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
            </svg>
            亮度
          </span>
          <span class="slider-value">{{ brightness }}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="150"
          :value="brightness"
          class="custom-slider"
          @input="(e) => emit('update:brightness', Number((e.target as HTMLInputElement).value))"
        />
      </div>

      <div class="slider-group">
        <div class="slider-header">
          <span class="slider-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            对比度
          </span>
          <span class="slider-value">{{ contrast }}%</span>
        </div>
        <input
          type="range"
          min="50"
          max="150"
          :value="contrast"
          class="custom-slider"
          @input="(e) => emit('update:contrast', Number((e.target as HTMLInputElement).value))"
        />
      </div>

      <div class="slider-group">
        <div class="slider-header">
          <span class="slider-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="13.5" cy="6.5" r=".5" />
              <circle cx="17.5" cy="10.5" r=".5" />
              <circle cx="8.5" cy="7.5" r=".5" />
              <circle cx="6.5" cy="12.5" r=".5" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
            </svg>
            色相旋转
          </span>
          <span class="slider-value">{{ hueRotate }}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          :value="hueRotate"
          class="custom-slider hue-slider"
          @input="(e) => emit('update:hueRotate', Number((e.target as HTMLInputElement).value))"
        />
      </div>

      <div class="slider-group">
        <div class="slider-header">
          <span class="slider-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            饱和度
          </span>
          <span class="slider-value">{{ saturate }}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="200"
          :value="saturate"
          class="custom-slider"
          @input="(e) => emit('update:saturate', Number((e.target as HTMLInputElement).value))"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.control-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.control-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.toggle-section {
  padding: 14px;
  background: var(--bg-elevated);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.dark-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}

.toggle-track {
  position: relative;
  width: 52px;
  height: 28px;
  background: var(--border-color);
  border-radius: 14px;
  transition: all 0.2s;
}

.dark-toggle.active .toggle-track {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark-toggle.active .toggle-thumb {
  left: 27px;
  color: #6366f1;
}

.toggle-text {
  font-size: 13px;
  color: var(--text-muted);
  min-width: 50px;
}

.dark-toggle.active .toggle-text {
  color: var(--accent-color);
  font-weight: 500;
}

.sliders-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.slider-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.slider-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-color);
  font-variant-numeric: tabular-nums;
  min-width: 48px;
  text-align: right;
}

.custom-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--border-color);
  outline: none;
  cursor: pointer;
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
  border: 3px solid var(--bg-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.15s;
}

.custom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.custom-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-color);
  cursor: pointer;
  border: 3px solid var(--bg-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.hue-slider {
  background: linear-gradient(
    to right,
    #ff0000 0%,
    #ffff00 17%,
    #00ff00 33%,
    #00ffff 50%,
    #0000ff 67%,
    #ff00ff 83%,
    #ff0000 100%
  );
}
</style>
