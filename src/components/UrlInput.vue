<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    emit('submit')
  }
}

function focusInput() {
  inputRef.value?.focus()
}

defineExpose({ focusInput })
</script>

<template>
  <div class="url-input-wrapper">
    <div class="url-scheme">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    </div>
    <input
      ref="inputRef"
      type="text"
      class="url-input"
      placeholder="输入网址，例如：example.com 或 https://example.com"
      :value="modelValue"
      @input="onInput"
      @keydown="onKeydown"
    />
    <button
      class="url-submit-btn"
      :disabled="!modelValue.trim() || loading"
      @click="emit('submit')"
    >
      <svg v-if="loading" class="spinner" width="18" height="18" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4" stroke-dashoffset="15.7" />
      </svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      <span>{{ loading ? '加载中' : '加载' }}</span>
    </button>
  </div>
</template>

<style scoped>
.url-input-wrapper {
  display: flex;
  align-items: stretch;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s;
}

.url-input-wrapper:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.url-scheme {
  display: flex;
  align-items: center;
  padding: 0 14px;
  color: var(--text-muted);
  border-right: 1px solid var(--border-color);
  background: var(--bg-elevated);
}

.url-input {
  flex: 1;
  padding: 14px 16px;
  font-size: 15px;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
}

.url-input::placeholder {
  color: var(--text-muted);
}

.url-submit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  background: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.url-submit-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.url-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
