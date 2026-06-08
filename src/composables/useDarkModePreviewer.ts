import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { DarkModeConfig, FilterParams, ColorMapping, DetectionResult } from '../types'
import { generateId, normalizeUrl, getDomainFromUrl } from '../utils/colorUtils'
import {
  getAllConfigs,
  saveConfig,
  deleteConfig,
  getActiveConfigId,
  setActiveConfigId,
  getConfigByUrl,
} from '../utils/storage'
import { generateFullDarkModeCSS } from '../utils/cssExport'

export function useDarkModePreviewer() {
  const url = ref('')
  const iframeRef = ref<HTMLIFrameElement | null>(null)
  const isLoading = ref(false)
  const iframeLoaded = ref(false)
  const iframeError = ref<string | null>(null)

  const filterParams = reactive<FilterParams>({
    invert: false,
    brightness: 100,
    contrast: 100,
    hueRotate: 0,
    saturate: 100,
  })

  const colorMappings = ref<ColorMapping[]>([])
  const savedConfigs = ref<DarkModeConfig[]>([])
  const activeConfigId = ref<string | null>(null)
  const currentConfigName = ref('')

  const detectionResult = ref<DetectionResult>({
    hasPrefersColorScheme: false,
    hasDarkClass: false,
    hasDataTheme: false,
    cssVariables: [],
    mediaQueries: [],
  })

  const systemPrefersDark = ref(false)

  const currentUrl = computed(() => normalizeUrl(url.value))
  const currentDomain = computed(() => getDomainFromUrl(url.value))

  const filterStyle = computed(() => {
    const filters: string[] = []
    if (filterParams.invert) filters.push('invert(1) hue-rotate(180deg)')
    if (filterParams.hueRotate !== 0) filters.push(`hue-rotate(${filterParams.hueRotate}deg)`)
    if (filterParams.brightness !== 100) filters.push(`brightness(${filterParams.brightness}%)`)
    if (filterParams.contrast !== 100) filters.push(`contrast(${filterParams.contrast}%)`)
    if (filterParams.saturate !== 100) filters.push(`saturate(${filterParams.saturate}%)`)
    return filters.join(' ')
  })

  const reverseFilterStyle = computed(() => {
    const filters: string[] = []
    if (filterParams.invert) filters.push('invert(1) hue-rotate(180deg)')
    return filters.join(' ')
  })

  const exportedCSS = computed(() => {
    return generateFullDarkModeCSS(filterParams, colorMappings.value, true)
  })

  const exportedCSSClassBased = computed(() => {
    return generateFullDarkModeCSS(filterParams, colorMappings.value, false)
  })

  function loadUrl(inputUrl?: string) {
    if (inputUrl !== undefined) {
      url.value = inputUrl
    }
    if (!url.value.trim()) {
      iframeError.value = '请输入网址'
      return
    }
    const existingConfig = getConfigByUrl(url.value)
    if (existingConfig) {
      applyConfig(existingConfig)
    }
    iframeLoaded.value = false
    iframeError.value = null
    isLoading.value = true
  }

  function onIframeLoad() {
    isLoading.value = false
    iframeLoaded.value = true
    detectDarkModeSupport()
  }

  function onIframeError() {
    isLoading.value = false
    iframeLoaded.value = false
    iframeError.value = '页面加载失败，可能是跨域限制或网址无效'
  }

  function detectDarkModeSupport() {
    try {
      const win = iframeRef.value?.contentWindow
      const doc = iframeRef.value?.contentDocument
      if (!win || !doc) return

      const result: DetectionResult = {
        hasPrefersColorScheme: false,
        hasDarkClass: false,
        hasDataTheme: false,
        cssVariables: [],
        mediaQueries: [],
      }

      const htmlEl = doc.documentElement
      result.hasDarkClass =
        htmlEl.classList.contains('dark') ||
        htmlEl.classList.contains('theme-dark') ||
        doc.body.classList.contains('dark') ||
        doc.body.classList.contains('theme-dark')

      result.hasDataTheme =
        htmlEl.getAttribute('data-theme') === 'dark' ||
        doc.body.getAttribute('data-theme') === 'dark' ||
        htmlEl.hasAttribute('data-bs-theme')

      const styles = doc.styleSheets
      for (let i = 0; i < Math.min(styles.length, 20); i++) {
        try {
          const rules = styles[i].cssRules
          if (!rules) continue
          for (let j = 0; j < Math.min(rules.length, 100); j++) {
            const rule = rules[j]
            if (rule instanceof CSSMediaRule) {
              if (rule.conditionText.includes('prefers-color-scheme')) {
                result.hasPrefersColorScheme = true
                if (!result.mediaQueries.includes(rule.conditionText)) {
                  result.mediaQueries.push(rule.conditionText)
                }
              }
            }
          }
        } catch {
          // CORS issues
        }
      }

      const computedStyle = win.getComputedStyle(htmlEl)
      const vars: string[] = []
      for (let i = 0; i < Math.min(50, computedStyle.length); i++) {
        const prop = computedStyle[i]
        if (prop.startsWith('--')) {
          if (
            prop.toLowerCase().includes('dark') ||
            prop.toLowerCase().includes('bg') ||
            prop.toLowerCase().includes('color') ||
            prop.toLowerCase().includes('theme')
          ) {
            vars.push(prop)
          }
        }
      }
      result.cssVariables = vars.slice(0, 20)

      detectionResult.value = result
    } catch {
      // Silent fail for CORS
    }
  }

  function toggleDarkMode() {
    filterParams.invert = !filterParams.invert
  }

  function resetParams() {
    filterParams.invert = false
    filterParams.brightness = 100
    filterParams.contrast = 100
    filterParams.hueRotate = 0
    filterParams.saturate = 100
  }

  function addColorMapping(fromColor: string = '#ffffff', toColor: string = '#1a1a1a', selector: string = '') {
    colorMappings.value.push({
      id: generateId(),
      fromColor,
      toColor,
      selector,
      enabled: true,
    })
  }

  function removeColorMapping(id: string) {
    colorMappings.value = colorMappings.value.filter((m) => m.id !== id)
  }

  function updateColorMapping(id: string, updates: Partial<ColorMapping>) {
    const mapping = colorMappings.value.find((m) => m.id === id)
    if (mapping) {
      Object.assign(mapping, updates)
    }
  }

  function applyConfig(config: DarkModeConfig) {
    url.value = config.url
    filterParams.invert = config.invert
    filterParams.brightness = config.brightness
    filterParams.contrast = config.contrast
    filterParams.hueRotate = config.hueRotate
    filterParams.saturate = config.saturate
    colorMappings.value = [...config.colorMappings]
    activeConfigId.value = config.id
    currentConfigName.value = config.name
    setActiveConfigId(config.id)
  }

  function saveCurrentConfig(name?: string) {
    const configName = name || currentConfigName.value || `${currentDomain.value} 配置`
    const saved = saveConfig({
      id: activeConfigId.value || undefined,
      name: configName,
      url: currentUrl.value,
      enabled: filterParams.invert,
      invert: filterParams.invert,
      brightness: filterParams.brightness,
      contrast: filterParams.contrast,
      hueRotate: filterParams.hueRotate,
      saturate: filterParams.saturate,
      colorMappings: [...colorMappings.value],
    })
    activeConfigId.value = saved.id
    currentConfigName.value = saved.name
    refreshSavedConfigs()
    return saved
  }

  function deleteSavedConfig(id: string) {
    deleteConfig(id)
    if (activeConfigId.value === id) {
      activeConfigId.value = null
      currentConfigName.value = ''
      setActiveConfigId(null)
    }
    refreshSavedConfigs()
  }

  function refreshSavedConfigs() {
    savedConfigs.value = getAllConfigs().sort((a, b) => b.updatedAt - a.updatedAt)
  }

  function checkSystemPreference() {
    systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', (e) => {
      systemPrefersDark.value = e.matches
    })
  }

  onMounted(() => {
    refreshSavedConfigs()
    checkSystemPreference()
    const savedActiveId = getActiveConfigId()
    if (savedActiveId) {
      const config = savedConfigs.value.find((c) => c.id === savedActiveId)
      if (config) {
        applyConfig(config)
      }
    }
  })

  watch(
    () => [filterParams.invert, filterParams.brightness, filterParams.contrast, filterParams.hueRotate, filterParams.saturate],
    () => {
      if (activeConfigId.value) {
        // Auto-save when config is active
      }
    },
    { deep: true }
  )

  return {
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
    systemPrefersDark,
    currentUrl,
    currentDomain,
    filterStyle,
    reverseFilterStyle,
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
    refreshSavedConfigs,
  }
}
