<script setup lang="ts">
import { ref } from 'vue'
import { useDarkModePreviewer } from './composables/useDarkModePreviewer'
import UrlInput from './components/UrlInput.vue'
import FilterControls from './components/FilterControls.vue'
import ColorMappings from './components/ColorMappings.vue'
import DetectionPanel from './components/DetectionPanel.vue'
import CSSExportPanel from './components/CSSExportPanel.vue'
import ConfigManager from './components/ConfigManager.vue'

const {
  url,
  iframeRef,
  isLoading,
  iframeLoaded,
  iframeError,
  filterParams,
  colorMappings,
  savedConfigs,
  activeConfigId,
  currentConfigName,
  detectionResult,
  detectionCorsLimited,
  systemPrefersDark,
  currentUrl,
  filterStyle,
  exportedCSS,
  exportedCSSClassBased,
  loadUrl,
  onIframeLoad,
  onIframeError,
  toggleDarkMode,
  resetParams,
  addColorMapping,
  removeColorMapping,
  updateColorMapping,
  applyConfig,
  saveCurrentConfig,
  deleteSavedConfig,
} = useDarkModePreviewer()

const activePanel = ref<'controls' | 'detection' | 'export' | 'configs'>('controls')

const panels = [
  { id: 'controls', name: '控制', icon: 'settings' },
  { id: 'detection', name: '检测', icon: 'search' },
  { id: 'export', name: '导出', icon: 'code' },
  { id: 'configs', name: '配置', icon: 'save' },
] as const

const quickUrls = [
  { name: '示例', url: 'example.com' },
  { name: 'MDN', url: 'developer.mozilla.org' },
  { name: '维基百科', url: 'zh.wikipedia.org' },
  { name: 'GitHub', url: 'github.com' },
]

function useQuickUrl(urlStr: string) {
  loadUrl(urlStr)
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
          </div>
          <div class="logo-text">
            <h1>Dark Previewer</h1>
            <span>暗黑模式预览工具</span>
          </div>
        </div>
      </div>

      <div class="header-center">
        <UrlInput
          v-model="url"
          :loading="isLoading"
          @submit="loadUrl()"
        />
      </div>

      <div class="header-right">
        <div class="system-indicator" :class="{ dark: systemPrefersDark }" :title="`系统主题: ${systemPrefersDark ? '深色' : '浅色'}`">
          <svg v-if="systemPrefersDark" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        </div>
        <button
          class="quick-toggle"
          :class="{ active: filterParams.invert }"
          @click="toggleDarkMode"
          :title="filterParams.invert ? '关闭暗黑模式' : '开启暗黑模式'"
        >
          <svg v-if="!filterParams.invert" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <span>{{ filterParams.invert ? '亮色' : '暗黑' }}</span>
        </button>
      </div>
    </header>

    <div class="app-body">
      <div class="preview-area">
        <div v-if="!url.trim()" class="empty-preview">
          <div class="empty-content">
            <div class="empty-illustration">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h2>输入网址开始预览</h2>
            <p>在上方输入框中输入你想要预览暗黑模式效果的网站</p>
            <div class="quick-links">
              <span class="quick-label">快速尝试：</span>
              <button
                v-for="q in quickUrls"
                :key="q.url"
                class="quick-link"
                @click="useQuickUrl(q.url)"
              >
                {{ q.name }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="iframe-container-wrapper">
          <div class="preview-toolbar">
            <div class="preview-url">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span :title="currentUrl">{{ currentUrl }}</span>
            </div>
            <div class="preview-status">
              <div v-if="isLoading" class="status loading">
                <span class="loader"></span>
                加载中...
              </div>
              <div v-else-if="iframeLoaded" class="status ready">
                <span class="status-dot"></span>
                已加载
              </div>
              <div v-else-if="iframeError" class="status error">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {{ iframeError }}
              </div>
            </div>
            <button
              class="refresh-btn"
              :disabled="isLoading"
              @click="loadUrl()"
              title="刷新"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :style="{ animation: isLoading ? 'spin 0.8s linear infinite' : 'none' }">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </div>

          <div
            class="iframe-container"
            :style="{ filter: filterStyle }"
          >
            <iframe
              v-if="currentUrl"
              :key="currentUrl"
              ref="iframeRef"
              :src="currentUrl"
              class="preview-iframe"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              @load="onIframeLoad"
              @error="onIframeError"
              referrerpolicy="no-referrer"
            />
          </div>

          <div v-if="filterParams.invert && iframeLoaded" class="filter-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>使用 CSS filter 外层反转模拟暗黑模式。<strong>跨域场景下iframe内部图片/视频无法单独反向还原</strong>，请配合导出的CSS代码在同域环境中验证完整效果。</span>
          </div>
        </div>
      </div>

      <aside class="side-panel">
        <nav class="panel-tabs">
          <button
            v-for="panel in panels"
            :key="panel.id"
            class="panel-tab"
            :class="{ active: activePanel === panel.id }"
            @click="activePanel = panel.id"
          >
            <svg v-if="panel.icon === 'settings'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <svg v-else-if="panel.icon === 'search'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <svg v-else-if="panel.icon === 'code'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <svg v-else-if="panel.icon === 'save'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {{ panel.name }}
          </button>
        </nav>

        <div class="panel-content">
          <div v-show="activePanel === 'controls'" class="panel-section">
            <FilterControls
              :invert="filterParams.invert"
              :brightness="filterParams.brightness"
              :contrast="filterParams.contrast"
              :hue-rotate="filterParams.hueRotate"
              :saturate="filterParams.saturate"
              @update:invert="filterParams.invert = $event"
              @update:brightness="filterParams.brightness = $event"
              @update:contrast="filterParams.contrast = $event"
              @update:hue-rotate="filterParams.hueRotate = $event"
              @update:saturate="filterParams.saturate = $event"
              @toggle="toggleDarkMode"
              @reset="resetParams"
            />

            <div class="divider"></div>

            <ColorMappings
              :mappings="colorMappings"
              @add="addColorMapping()"
              @remove="removeColorMapping"
              @update="updateColorMapping"
            />
          </div>

          <div v-show="activePanel === 'detection'" class="panel-section">
            <DetectionPanel
              :result="detectionResult"
              :system-prefers-dark="systemPrefersDark"
              :cors-limited="detectionCorsLimited"
            />
          </div>

          <div v-show="activePanel === 'export'" class="panel-section">
            <CSSExportPanel
              :css-media-query="exportedCSS"
              :css-class-based="exportedCSSClassBased"
              :current-url="currentUrl"
            />
          </div>

          <div v-show="activePanel === 'configs'" class="panel-section">
            <ConfigManager
              :configs="savedConfigs"
              :active-id="activeConfigId"
              :current-name="currentConfigName"
              @apply="applyConfig"
              @save="(name?: string) => saveCurrentConfig(name)"
              @delete="deleteSavedConfig"
            />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style>
:root {
  --bg-primary: #0f1218;
  --bg-secondary: #161a23;
  --bg-elevated: #1d2330;
  --bg-input: #1a1f2b;
  --border-color: #2a3142;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --accent-color: #6366f1;
  --accent-hover: #4f46e5;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  width: 100vw;
}
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: var(--bg-primary);
}

.app-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.header-left {
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.logo-text h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text span {
  font-size: 11px;
  color: var(--text-muted);
}

.header-center {
  flex: 1;
  max-width: 700px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.system-indicator {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: #f59e0b;
  transition: all 0.2s;
}

.system-indicator.dark {
  color: var(--accent-color);
}

.quick-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-toggle:hover {
  border-color: var(--text-muted);
}

.quick-toggle.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-primary);
}

.empty-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-content {
  max-width: 480px;
  text-align: center;
}

.empty-illustration {
  display: inline-flex;
  padding: 24px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  color: var(--accent-color);
  margin-bottom: 24px;
}

.empty-content h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.empty-content > p {
  margin: 0 0 24px;
  color: var(--text-muted);
  font-size: 14px;
}

.quick-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.quick-label {
  font-size: 12px;
  color: var(--text-muted);
}

.quick-link {
  padding: 6px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.quick-link:hover {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.iframe-container-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.preview-url {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.preview-url span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 11px;
}

.preview-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.status.loading {
  background: rgba(99, 102, 241, 0.1);
  color: var(--accent-color);
}

.status.ready {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.status.error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
}

.loader {
  width: 10px;
  height: 10px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: currentColor;
  border-radius: 50%;
}

.refresh-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.refresh-btn:hover:not(:disabled) {
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.iframe-container {
  flex: 1;
  position: relative;
  background: white;
  overflow: hidden;
  transition: filter 0.3s ease;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.filter-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(99, 102, 241, 0.08);
  border-top: 1px solid rgba(99, 102, 241, 0.2);
  color: var(--text-secondary);
  font-size: 12px;
  flex-shrink: 0;
}

.filter-hint svg {
  color: var(--accent-color);
  flex-shrink: 0;
}

.side-panel {
  width: 380px;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  flex-shrink: 0;
}

.panel-tabs {
  display: flex;
  padding: 8px;
  gap: 4px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--bg-secondary);
}

.panel-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  background: transparent;
  border: none;
  border-radius: 7px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.panel-tab:hover {
  color: var(--text-secondary);
  background: var(--bg-elevated);
}

.panel-tab.active {
  background: var(--bg-primary);
  color: var(--accent-color);
  box-shadow: inset 0 0 0 1px var(--border-color);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 18px;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
