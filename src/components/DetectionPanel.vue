<script setup lang="ts">
import { computed } from 'vue'
import type { DetectionResult } from '../types'

const props = defineProps<{
  result: DetectionResult
  systemPrefersDark: boolean
  corsLimited: boolean
}>()

const supportScore = computed(() => {
  let score = 0
  if (props.result.hasPrefersColorScheme) score += 40
  if (props.result.hasDarkClass) score += 30
  if (props.result.hasDataTheme) score += 15
  score += Math.min(props.result.cssVariables.length * 1.5, 15)
  return Math.min(Math.round(score), 100)
})

const supportLevel = computed(() => {
  const s = supportScore.value
  if (s >= 80) return '优秀'
  if (s >= 60) return '良好'
  if (s >= 30) return '一般'
  return '较弱'
})
</script>

<template>
  <div class="detection-panel">
    <div v-if="corsLimited" class="cors-warning">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div class="cors-warning-text">
        <strong>跨域安全策略限制</strong>
        <span>因目标站点跨域安全策略，本次检测结果可能不准确（CSS样式表、class属性等无法完整读取）</span>
      </div>
    </div>

    <div class="control-header">
      <h3 class="control-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        暗黑模式检测
      </h3>
      <div class="system-badge" :class="{ dark: systemPrefersDark }">
        <svg v-if="systemPrefersDark" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5" />
        </svg>
        系统: {{ systemPrefersDark ? '暗色' : '亮色' }}
      </div>
    </div>

    <div class="detection-grid">
      <div class="detection-item">
        <div class="item-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6v6H9z" />
          </svg>
        </div>
        <div class="item-content">
          <span class="item-label">prefers-color-scheme</span>
          <span class="item-desc">CSS 媒体查询适配</span>
        </div>
        <div class="status-badge" :class="{ positive: result.hasPrefersColorScheme }">
          {{ result.hasPrefersColorScheme ? '已支持' : '未检测到' }}
        </div>
      </div>

      <div class="detection-item">
        <div class="item-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <div class="item-content">
          <span class="item-label">.dark / .theme-dark</span>
          <span class="item-desc">class 类名切换</span>
        </div>
        <div class="status-badge" :class="{ positive: result.hasDarkClass }">
          {{ result.hasDarkClass ? '已检测到' : '未检测到' }}
        </div>
      </div>

      <div class="detection-item">
        <div class="item-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7V4h16v3" />
            <path d="M9 20h6" />
            <path d="M12 4v16" />
          </svg>
        </div>
        <div class="item-content">
          <span class="item-label">data-theme 属性</span>
          <span class="item-desc">data-theme / data-bs-theme</span>
        </div>
        <div class="status-badge" :class="{ positive: result.hasDataTheme }">
          {{ result.hasDataTheme ? '已检测到' : '未检测到' }}
        </div>
      </div>
    </div>

    <div v-if="result.cssVariables.length > 0" class="css-vars-section">
      <div class="section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
        相关 CSS 变量 ({{ result.cssVariables.length }})
      </div>
      <div class="vars-list">
        <span v-for="v in result.cssVariables" :key="v" class="var-tag">{{ v }}</span>
      </div>
    </div>

    <div v-if="result.mediaQueries.length > 0" class="media-section">
      <div class="section-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        媒体查询
      </div>
      <div class="query-list">
        <code v-for="q in result.mediaQueries.slice(0, 5)" :key="q" class="query-code">{{ q }}</code>
      </div>
    </div>

    <div class="support-summary">
      <div class="summary-score">
        <div class="score-ring" :style="{ '--score': supportScore }">
          <span>{{ supportScore }}%</span>
        </div>
        <div class="score-label">
          <strong>{{ supportLevel }}</strong>
          <span>暗黑模式适配度</span>
        </div>
      </div>
      <div class="summary-tips">
        <div v-if="supportScore >= 60" class="tip positive">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          网站已具备较好的暗黑模式原生支持
        </div>
        <div v-else class="tip warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          建议使用本工具的滤镜功能模拟暗黑效果
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detection-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cors-warning {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
}

.cors-warning svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.cors-warning-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  line-height: 1.5;
}

.cors-warning-text strong {
  font-size: 12px;
  font-weight: 600;
}

.cors-warning-text span {
  color: #fca5a5;
  font-size: 11px;
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

.system-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.system-badge.dark {
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent-color);
}

.detection-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detection-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.15s;
}

.detection-item:hover {
  border-color: var(--text-muted);
}

.item-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  border-radius: 8px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.item-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.item-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.status-badge {
  padding: 4px 10px;
  background: rgba(156, 163, 175, 0.15);
  color: var(--text-muted);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.status-badge.positive {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.css-vars-section,
.media-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.vars-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.var-tag {
  padding: 4px 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 11px;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--accent-color);
}

.query-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 120px;
  overflow-y: auto;
}

.query-code {
  padding: 6px 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  font-size: 11px;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow-x: auto;
}

.support-summary {
  padding: 14px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 10px;
}

.summary-score {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 12px;
}

.score-ring {
  --score: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(
    var(--accent-color) calc(var(--score) * 1%),
    var(--border-color) calc(var(--score) * 1%)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.score-ring::before {
  content: '';
  position: absolute;
  inset: 4px;
  background: var(--bg-primary);
  border-radius: 50%;
}

.score-ring span {
  position: relative;
  z-index: 1;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.score-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.score-label strong {
  font-size: 18px;
  color: var(--text-primary);
}

.score-label span {
  font-size: 12px;
  color: var(--text-muted);
}

.summary-tips .tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
}

.tip.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.tip.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
</style>
