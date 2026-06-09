export interface DarkModeConfig {
  id: string
  name: string
  url: string
  enabled: boolean
  invert: boolean
  brightness: number
  contrast: number
  hueRotate: number
  saturate: number
  colorMappings: ColorMapping[]
  createdAt: number
  updatedAt: number
}

export type ColorMappingApplyTo = 'both' | 'color' | 'background'

export interface ColorMapping {
  id: string
  fromColor: string
  toColor: string
  selector: string
  enabled: boolean
  applyTo: ColorMappingApplyTo
}

export interface FilterParams {
  invert: boolean
  brightness: number
  contrast: number
  hueRotate: number
  saturate: number
}

export interface DetectionResult {
  hasPrefersColorScheme: boolean
  hasDarkClass: boolean
  hasDataTheme: boolean
  cssVariables: string[]
  mediaQueries: string[]
}
