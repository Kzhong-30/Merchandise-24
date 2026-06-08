<script setup lang="ts">
import type { DarkModeConfig } from '../types'
import { ref } from 'vue'

defineProps<{
  configs: DarkModeConfig[]
  activeId: string | null
  currentName: string
}>()

const emit = defineEmits<{
  (e: 'apply', config: DarkModeConfig): void
  (e: 'save', name?: string): void
  (e: 'delete', id: string): void
}>()

const saveModalOpen = ref(false)
const saveName = ref('')
const searchQuery = ref('')

function openSaveModal(currentName: string) {
  saveName.value = currentName
  saveModalOpen.value = true
}

function confirmSave() {
  emit('save', saveName.value.trim())
  saveModalOpen.value = false
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getHostname(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : 'https://' + url).hostname
  } catch {
    return url
  }
}
</script>

<template>
  <div class="config-manager">
    <div class="control-header">
      <h3 class="control-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        保存的配置
        <span class="count">{{ configs.length }}</span>
      </h3>
      <button class="save-btn" @click="openSaveModal(currentName)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        保存当前
      </button>
    </div>

    <div v-if="configs.length > 5" class="search-box">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索配置..."
      />
    </div>

    <div class="config-list">
      <div
        v-for="config in configs.filter(c =>
          !searchQuery ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getHostname(c.url).toLowerCase().includes(searchQuery.toLowerCase())
        )"
        :key="config.id"
        class="config-card"
        :class="{ active: config.id === activeId }"
      >
        <div class="card-main" @click="emit('apply', config)">
          <div class="card-header">
            <div class="favicon">
              <img
                v-if="config.url"
                :src="`https://www.google.com/s2/favicons?domain=${getHostname(config.url)}&sz=64`"
                :onerror="(e: Event) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <span v-if="!config.url">{{ config.name.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="card-title">
              <span class="config-name">{{ config.name }}</span>
              <span class="config-url">{{ getHostname(config.url) }}</span>
            </div>
            <div v-if="config.id === activeId" class="active-indicator">
              <span class="pulse-dot"></span>
              当前
            </div>
          </div>

          <div class="card-tags">
            <span v-if="config.invert" class="tag invert">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              反转
            </span>
            <span v-if="config.brightness !== 100" class="tag">
              亮度 {{ config.brightness }}%
            </span>
            <span v-if="config.contrast !== 100" class="tag">
              对比 {{ config.contrast }}%
            </span>
            <span v-if="config.colorMappings.length > 0" class="tag color-tag">
              {{ config.colorMappings.length }} 配色
            </span>
          </div>

          <div class="card-footer">
            <span class="date">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {{ formatDate(config.updatedAt) }}
            </span>
          </div>
        </div>

        <button
          class="delete-btn"
          @click.stop="emit('delete', config.id)"
          :title="`删除 ${config.name}`"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      <div v-if="configs.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0" class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <p>{{ searchQuery ? '未找到匹配的配置' : '暂无保存的配置' }}</p>
        <span v-if="!searchQuery">调整参数后点击"保存当前"按钮</span>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="saveModalOpen" class="modal-overlay" @click.self="saveModalOpen = false">
          <div class="modal-content">
            <div class="modal-header">
              <h4>保存配置</h4>
              <button class="close-btn" @click="saveModalOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <label>配置名称</label>
              <input
                v-model="saveName"
                type="text"
                placeholder="为这个配置起个名字..."
                @keydown.enter="confirmSave"
                ref="input"
              />
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="saveModalOpen = false">取消</button>
              <button class="btn-primary" :disabled="!saveName.trim()" @click="confirmSave">
                保存
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.config-manager {
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

.count {
  padding: 2px 8px;
  background: var(--bg-elevated);
  border-radius: 10px;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
}

.search-box svg {
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text-primary);
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.config-card {
  display: flex;
  align-items: stretch;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.2s;
}

.config-card:hover {
  border-color: var(--text-muted);
}

.config-card.active {
  border-color: var(--accent-color);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.card-main {
  flex: 1;
  padding: 12px;
  cursor: pointer;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.favicon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  font-weight: 700;
  font-size: 14px;
  color: var(--accent-color);
  flex-shrink: 0;
}

.favicon img {
  width: 24px;
  height: 24px;
}

.card-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.config-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-url {
  font-size: 11px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.active-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: rgba(99, 102, 241, 0.12);
  color: var(--accent-color);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-color);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 500;
}

.tag.invert {
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent-color);
  border-color: rgba(99, 102, 241, 0.2);
}

.tag.color-tag {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}

.card-footer {
  display: flex;
  align-items: center;
}

.date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-muted);
}

.delete-btn {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-left: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

.close-btn:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.modal-body {
  padding: 18px;
}

.modal-body label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.modal-body input {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  outline: none;
  transition: all 0.15s;
  box-sizing: border-box;
}

.modal-body input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

.btn-secondary {
  padding: 8px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover {
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.btn-primary {
  padding: 8px 16px;
  background: var(--accent-color);
  border: 1px solid var(--accent-color);
  color: white;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
