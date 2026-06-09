import type { FilterParams } from '../types'

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      })
      .join('')
  )
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsl(rgb.r, rgb.g, rgb.b)
}

export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

export function invertColor(color: string): string {
  const rgb = hexToRgb(color)
  if (!rgb) return color
  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b)
}

export function invertColorSmart(color: string): string {
  const rgb = hexToRgb(color)
  if (!rgb) return color

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  if (hsl.l < 10 || hsl.l > 90) {
    return invertColor(color)
  }

  const newL = 100 - hsl.l
  const newRgb = hslToRgb(hsl.h, hsl.s, newL)
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

export function smartInvertColorWithFilter(
  color: string,
  filter: FilterParams
): string {
  const hsl = hexToHsl(color)
  if (!hsl) return color

  let { h, s, l } = hsl
  l = 100 - l

  if (l < 5) l = 5
  if (l > 95) l = 95

  const brightnessDelta = (filter.brightness - 100) / 100 * 25
  l = Math.max(0, Math.min(100, l - brightnessDelta))

  const contrastT = (filter.contrast - 100) / 100
  l = 50 + (l - 50) * (1 + contrastT)
  l = Math.max(0, Math.min(100, l))

  s = Math.min(100, s * filter.saturate / 100)

  if (l < 7 || l > 93) {
    return invertColor(color)
  }

  return hslToHex(h, s, l)
}

export function isLightColor(color: string): boolean {
  const rgb = hexToRgb(color)
  if (!rgb) return true
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function normalizeUrl(url: string): string {
  if (!url) return ''
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url
  }
  return url
}

export function getDomainFromUrl(url: string): string {
  try {
    const u = new URL(normalizeUrl(url))
    return u.hostname
  } catch {
    return url
  }
}
