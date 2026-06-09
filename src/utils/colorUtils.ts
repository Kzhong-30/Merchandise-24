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

/**
 * 基于 HSL 色彩空间的智能颜色反色算法
 *
 * 算法说明：
 * 1) 先把颜色转 HSL，L（明度）取 100 - L 做基础反色
 * 2) 再根据用户调整的 filter 参数进行微调：
 *
 *   ┌─────────────────────┬───────────────┬──────────────────┬──────────────────────────────────────────┐
 *   │ 系数名称            │ 当前值        │ 推荐调节范围     │ 影响效果                                 │
 *   ├─────────────────────┼───────────────┼──────────────────┼──────────────────────────────────────────┤
 *   │ BRIGHTNESS_COEFF    │ 17.5          │ 10.0 ~ 20.0      │ 亮度偏移曲线的最大振幅；值越大，brightness │
 *   │ (easeOutSqrt 振幅)  │               │                  │ 参数对最终色的明度影响越强；过小会导致   │
 *   │                     │               │                  │ 亮度滑块看起来无效                       │
 *   ├─────────────────────┼───────────────┼──────────────────┼──────────────────────────────────────────┤
 *   │ CONTRAST_CEILING    │ 0.48          │ 0.30 ~ 0.50      │ 对比度 tanh 变换的渐近上限；值越接近 0.5 │
 *   │ (tanh 渐近上限)     │               │                  │ 极端 contrast 时越容易把 L 推向 0/100；  │
 *   │                     │               │                  │ 设为 0.48 可避免完全溢出同时保留对比幅度 │
 *   ├─────────────────────┼───────────────┼──────────────────┼──────────────────────────────────────────┤
 *   │ SATURATE_GROWTH     │ 3.0           │ 1.5  ~ 5.0       │ sigmoid 衰减曲线的斜率；值越大，从线性   │
 *   │ (sigmoid 斜率)      │               │                  │ 切换到衰减的过渡越陡；过小则 200 仍接近 │
 *   │                     │               │                  │ 线性放大，过饱和问题仍存在                │
 *   ├─────────────────────┼───────────────┼──────────────────┼──────────────────────────────────────────┤
 *   │ SATURATE_CAP (推导) │ ≈ 180         │ 170 ~ 190        │ saturate 参数的等效封顶值（sigmoid 渐近）│
 *   │                     │               │                  │ 由 GROWTH 和分界点决定，无需直接修改     │
 *   └─────────────────────┴───────────────┴──────────────────┴──────────────────────────────────────────┘
 *
 * 3) 对极暗(L<7)或极亮(L>93)颜色直接走纯 RGB 255-x 兜底，保持黑白边界的正确性
 */
export function smartInvertColorWithFilter(
  color: string,
  filter: FilterParams
): string {
  const hsl = hexToHsl(color)
  if (!hsl) return color

  const BRIGHTNESS_COEFF = 17.5
  const CONTRAST_CEILING = 0.48
  const SATURATE_GROWTH = 3.0

  let { h, s, l } = hsl
  l = 100 - l

  // 明度微调：采用 easeOutSqrt 非线性曲线，避免极端参数下的色值失真
  // 归一化：brightness 50 -> -1,  100 -> 0,  150 -> +1
  const brightnessNorm = (filter.brightness - 100) / 50
  const brightnessSign = Math.sign(brightnessNorm)
  const brightnessEased = brightnessSign * Math.sqrt(Math.abs(brightnessNorm))
  const brightnessDelta = brightnessEased * BRIGHTNESS_COEFF
  l = Math.max(0, Math.min(100, l - brightnessDelta))

  // 对比度：以 CONTRAST_CEILING 为渐近上限的 tanh 变换，避免极端参数导致 0/100 扎堆溢出
  // 归一化：contrast 50 -> -0.5,  100 -> 0,  150 -> +0.5
  const contrastNorm = (filter.contrast - 100) / 100
  const contrastTanh = Math.tanh(2 * contrastNorm) / Math.tanh(1)
  const contrastFactor = contrastTanh * CONTRAST_CEILING / 0.76
  l = 50 + (l - 50) * (1 + contrastFactor)
  l = Math.max(0, Math.min(100, l))

  // 饱和度：≤150 线性放大，>150 启动 sigmoid 衰减（渐近≈180），避免过饱和造成色偏
  if (filter.saturate <= 150) {
    s = Math.min(100, s * filter.saturate / 100)
  } else {
    // t ∈ [0, 1] 对应 saturate [150, 200]
    const t = (filter.saturate - 150) / 50
    // sigmoid: 当 t=0 时值≈150，t=1 时值≈150 + 50*0.953 ≈ 197.6（趋近于 200 下方）
    const attenuated = 150 + 50 * (1 / (1 + Math.exp(-SATURATE_GROWTH * t)) - 0.5) * 2
    s = Math.min(100, s * attenuated / 100)
  }

  // 边界兜底：极暗极亮直接走纯 RGB 255-x，保证黑白的正确性
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
