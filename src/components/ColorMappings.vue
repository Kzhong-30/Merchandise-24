<script setup lang="ts">
import type { ColorMapping } from '../types'

defineProps<{
  mappings: ColorMapping[]
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'remove', id: string): void
  (e: 'update', id: string, updates: Partial<ColorMapping>): void
}>()

function onCheckboxChange(mappingId: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', mappingId, { enabled: target.checked })
}

function onColorInput(mappingId: string, field: 'fromColor' | 'toColor', event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', mappingId, { [field]: target.value })
}

function onColorChange(mappingId: string, field: 'fromColor' | 'toColor', event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', mappingId, { [field]: target.value })
}

function onSelectorInput(mappingId: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update', mappingId, { selector: target.value })
}
</script>

<template>
  <div class="color-mappings">
    <div class="control-header">
      <h3 class="control-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
        颜色映射
      </h3>
      <button class="add-btn" @click="emit('add')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        添加
      </button>
    </div>

    <div v-if="mappings.length === 0" class="empty-state">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="13.5" cy="6.5" r=".5" />
        <circle cx="17.5" cy="10.5" r=".5" />
        <circle cx="8.5" cy="7.5" r=".5" />
        <circle cx="6.5" cy="12.5" r=".5" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
      <p>暂无颜色映射规则</p>
      <span>点击"添加"创建自定义颜色转换</span>
    </div>

    <div v-else class="mapping-list">
      <div
        v-for="mapping in mappings"
        :key="mapping.id"
        class="mapping-item"
        :class="{ disabled: !mapping.enabled }"
      >
        <div class="mapping-header">
          <label class="mapping-toggle">
            <input
              type="checkbox"
              :checked="mapping.enabled"
              @change="onCheckboxChange(mapping.id, $event)"
            />
            <span class="toggle-box"></span>
          </label>
          <span class="mapping-index">#{{ mappings.indexOf(mapping) + 1 }}</span>
          <button class="delete-btn" @click="emit('remove', mapping.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        <div class="color-row">
          <div class="color-field">
            <label>原色</label>
            <div class="color-input-wrapper">
              <input
                type="color"
                :value="mapping.fromColor"
                @input="onColorInput(mapping.id, 'fromColor', $event)"
              />
              <input
                type="text"
                :value="mapping.fromColor"
                @change="onColorChange(mapping.id, 'fromColor', $event)"
                maxlength="7"
              />
            </div>
            <div class="color-preview" :style="{ backgroundColor: mapping.fromColor }"></div>
          </div>

          <div class="arrow-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>

          <div class="color-field">
            <label>目标色</label>
            <div class="color-input-wrapper">
              <input
                type="color"
                :value="mapping.toColor"
                @input="onColorInput(mapping.id, 'toColor', $event)"
              />
              <input
                type="text"
                :value="mapping.toColor"
                @change="onColorChange(mapping.id, 'toColor', $event)"
                maxlength="7"
              />
            </div>
            <div class="color-preview" :style="{ backgroundColor: mapping.toColor }"></div>
          </div>
        </div>

        <div class="selector-field">
          <label>CSS 选择器（可选）</label>
          <input
            type="text"
            class="selector-input"
            placeholder="例如：.header, h1, #main"
            :value="mapping.selector"
            @input="onSelectorInput(mapping.id, $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-mappings {
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 32px 20px;
  background: var(--bg-elevated);
  border: 1px dashed var(--border-color);
  border-radius: 10px;
  color: var(--text-muted);
}

.empty-state svg {
  opacity: 0.5;
}

.empty-state p {
  margin: 4px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.empty-state span {
  font-size: 12px;
}

.mapping-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mapping-item {
  padding: 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.2s;
}

.mapping-item.disabled {
  opacity: 0.5;
}

.mapping-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.mapping-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.mapping-toggle input {
  display: none;
}

.toggle-box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.mapping-toggle input:checked + .toggle-box {
  background: var(--accent-color);
  border-color: var(--accent-color);
}

.mapping-toggle input:checked + .toggle-box::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
}

.mapping-index {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}

.delete-btn {
  margin-left: auto;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 5px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.color-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.color-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.color-field label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input-wrapper input[type='color'] {
  width: 36px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
}

.color-input-wrapper input[type='color']::-webkit-color-swatch-wrapper {
  padding: 3px;
}

.color-input-wrapper input[type='color']::-webkit-color-swatch {
  border: none;
  border-radius: 3px;
}

.color-input-wrapper input[type='text'] {
  flex: 1;
  padding: 7px 10px;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, monospace;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  outline: none;
  transition: all 0.15s;
}

.color-input-wrapper input[type='text']:focus {
  border-color: var(--accent-color);
}

.color-preview {
  width: 100%;
  height: 24px;
  border-radius: 5px;
  border: 1px solid rgba(128, 128, 128, 0.2);
}

.arrow-icon {
  color: var(--text-muted);
  flex-shrink: 0;
  padding-bottom: 18px;
}

.selector-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selector-field label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.selector-input {
  padding: 8px 10px;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, monospace;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  outline: none;
  transition: all 0.15s;
}

.selector-input:focus {
  border-color: var(--accent-color);
}

.selector-input::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}
</style>
