import type { DarkModeConfig } from '../types'
import { generateId } from './colorUtils'

const STORAGE_KEY = 'darkmode_previewer_configs'
const ACTIVE_KEY = 'darkmode_previewer_active'

export function getAllConfigs(): DarkModeConfig[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveConfig(config: Omit<DarkModeConfig, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): DarkModeConfig {
  const configs = getAllConfigs()
  const now = Date.now()

  if (config.id) {
    const index = configs.findIndex((c) => c.id === config.id)
    if (index !== -1) {
      configs[index] = {
        ...configs[index],
        ...config,
        id: config.id,
        updatedAt: now,
      } as DarkModeConfig
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
      return configs[index]
    }
  }

  const newConfig: DarkModeConfig = {
    ...config,
    id: config.id || generateId(),
    createdAt: now,
    updatedAt: now,
  } as DarkModeConfig

  configs.push(newConfig)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
  return newConfig
}

export function deleteConfig(id: string): void {
  const configs = getAllConfigs().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}

export function getActiveConfigId(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}

export function setActiveConfigId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id)
  } else {
    localStorage.removeItem(ACTIVE_KEY)
  }
}

export function getConfigByUrl(url: string): DarkModeConfig | undefined {
  const configs = getAllConfigs()
  return configs.find((c) => {
    try {
      const configDomain = new URL(c.url).hostname
      const urlDomain = new URL(url).hostname
      return configDomain === urlDomain
    } catch {
      return c.url === url
    }
  })
}
