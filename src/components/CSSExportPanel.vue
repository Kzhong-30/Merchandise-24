<script setup lang="ts">
import { ref } from 'vue'
import { copyToClipboard, downloadCSS } from '../utils/cssExport'
import { getDomainFromUrl } from '../utils/colorUtils'

const props = defineProps<{
  cssMediaQuery: string
  cssClassBased: string
  currentUrl: string
}>()

const activeTab = ref<'media' | 'class'>('media')
const copied = ref(false)
const copiedVariant = ref<'media' | 'class'>('media')

function setActiveTab(tab: 'media' | 'class') {
  activeTab.value = tab
}

function getActiveCSS() {
  return activeTab.value === 'media' ? props.cssMediaQuery : props.cssClassBased
}

async function onCopy() {
  const variant = activeTab.value
  const ok = await copyToClipboard(getActiveCSS())
  if (ok) {
    copied.value = true
    copiedVariant.value = variant
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

function onDownload() {
  const domain = getDomainFromUrl(props.currentUrl) || 'dark-mode'
  const suffix = activeTab.value === 'media' ? 'media' : 'class'
  downloadCSS(getActiveCSS(), `${domain}-${suffix}-dark-mode.css`)
}
</script>

<template>
  <div class="export-panel">
    <div class="control-header">
      <h3 class="control-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        CSS 代码导出
      </h3>
      <div class="export-actions">
        <button class="action-btn copy" :class="{ success: copied && copiedVariant === activeTab }" @click="onCopy">
          <svg v-if="copied && copiedVariant === activeTab" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {{ copied && copiedVariant === activeTab ? '已复制' : '复制' }}
        </button>
        <button class="action-btn download" @click="onDownload">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          下载
        </button>
      </div>
    </div>

    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'media' }"
        @click="setActiveTab('media')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
        </svg>
        媒体查询模式
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'class' }"
        @click="setActiveTab('class')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 18l6-6-6-6" />
          <path d="M8 6l-6 6 6 6" />
        </svg>
        .dark class 模式
      </button>
    </div>

    <div class="hint">
      <svg v-if="activeTab === 'media'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span v-if="activeTab === 'media'">
        跟随系统设置自动切换，无需 JS。使用 <code>@media (prefers-color-scheme: dark)</code>
      </span>
      <span v-else>
        通过在 <code>&lt;html&gt;</code> 添加 <code>.dark</code> class 手动控制，配合 JS 切换主题
      </span>
    </div>

    <div class="code-wrapper">
      <pre class="code-block"><code>{{ getActiveCSS() }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.export-panel {
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

.export-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bg-elevated);
}

.action-btn.copy {
  color: var(--text-secondary);
}

.action-btn.copy:hover {
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.action-btn.copy.success {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.3);
}

.action-btn.download {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.action-btn.download:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-elevated);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 5px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.tab:hover {
  color: var(--text-secondary);
}

.tab.active {
  background: var(--bg-primary);
  color: var(--accent-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(99, 102, 241, 0.06);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 7px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.hint svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--accent-color);
}

.hint code {
  padding: 1px 6px;
  background: var(--bg-primary);
  border-radius: 4px;
  font-size: 11px;
  color: var(--accent-color);
  font-family: 'SF Mono', Monaco, monospace;
}

.code-wrapper {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: #0d1117;
}

.code-block {
  margin: 0;
  padding: 16px;
  max-height: 360px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.6;
  font-family: 'SF Mono', 'Fira Code', Monaco, monospace;
  color: #c9d1d9;
}

.code-block code {
  white-space: pre;
}
</style>
