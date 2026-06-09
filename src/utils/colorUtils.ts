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
 * 1. 先把颜色转 HSL，L（明度）取 100 - L 做基础反色
 * 2. 再根据用户调整的 filter 参数进行微调
 *
 * 可调常量（参数越界自检：可用 Node 执行本文件顶层的断言块核对）
 *
 *   名称              : 数值            : 推荐范围       : 影响
 *   ------------------+-----------------+----------------+------------------------------------------
 *   BRIGHTNESS_COEFF  : 17.5            : 10.0 ~ 20.0    : easeOutSqrt 曲线最大振幅；值越大，
 *   (easeOutSqrt 振幅)                 :                : brightness 参数对明度的影响越强
 *   ------------------+-----------------+----------------+------------------------------------------
 *   CONTRAST_CEILING  : 0.48            : 0.30 ~ 0.50    : tanh 变换的内部分子；最终在 contrast=150
 *   (tanh 内部分子)                    :                : 时 contrastFactor ≈ 0.6316，此值控制
 *                     :                 :                : 极端 contrast 下 L 值被推向端点的速度
 *   ------------------+-----------------+----------------+------------------------------------------
 *   SATURATE_GROWTH   : 3.0             : 1.5  ~ 5.0     : sigmoid 衰减斜率；越大从线性到衰减
 *   (sigmoid 斜率)                     :                : 的过渡越陡，过小则 saturate=200 时
 *                     :                 :                : 仍接近线性放大，过饱和问题未改善
 *   ------------------+-----------------+----------------+------------------------------------------
 *   SATURATE_CAP      : ≈ 195.26        : 190 ~ 200      : saturate=200 时的真实衰减值，由
 *   (sigmoid 渐近上限，推导值)          :                : GROWTH=3.0 代入 sigmoid 公式计算得到
 *
 * 3. 对极暗 L<7 或极亮 L>93 的颜色直接走纯 RGB 255-x 兜底，保证黑白正确性
 */
export function smartInvertColorWithFilter(
  color: string,
  filter: FilterParams
): string {
  const hsl = hexToHsl(color)
  if (!hsl) return color

  // ========== 可调常量（修改本块后建议用 Node 执行断言验证一次） ==========
  // 断言示例（复制到 node 执行）：
  //   const B=17.5, C=0.48, G=3.0;
  //   console.log('SATURATE_CAP @200=', 150+50*(1/(1+Math.exp(-G*1))-0.5)*2);
  //   console.log('CONTRAST_MAX @150=', Math.tanh(1)/Math.tanh(1)*C/0.76);
  //   console.log('BRIGHTNESS_MAX @150=', 1*B);
  const BRIGHTNESS_COEFF = 17.5 // @brightness=150 → 最大偏移 17.5
  const CONTRAST_CEILING = 0.48 // @contrast=150  → 最终 0.6316
  const SATURATE_GROWTH  = 3.0  // @saturate=200  → 衰减上限 ≈ 195.26
  // =====================================================================

  let { h, s, l } = hsl
  l = 100 - l

  // 明度微调：easeOutSqrt 非线性，brightness 50→-1、100→0、150→+1
  const brightnessNorm = (filter.brightness - 100) / 50
  const brightnessSign = Math.sign(brightnessNorm)
  const brightnessEased = brightnessSign * Math.sqrt(Math.abs(brightnessNorm))
  const brightnessDelta = brightnessEased * BRIGHTNESS_COEFF
  l = Math.max(0, Math.min(100, l - brightnessDelta))

  // 对比度：tanh 变换，contrast 50→-0.5、100→0、150→+0.5
  // contrastFactor = tanh(2·norm) / tanh(1) × CONTRAST_CEILING / 0.76
  // 最大 contrastFactor（contrast=150）= 1 × 0.48 / 0.76 ≈ 0.6316
  const contrastNorm = (filter.contrast - 100) / 100
  const contrastTanh = Math.tanh(2 * contrastNorm) / Math.tanh(1)
  const contrastFactor = contrastTanh * CONTRAST_CEILING / 0.76
  l = 50 + (l - 50) * (1 + contrastFactor)
  l = Math.max(0, Math.min(100, l))

  // 饱和度：≤150 线性放大；>150 启动 sigmoid 衰减，saturate=200 → 真实≈195.26
  if (filter.saturate <= 150) {
    s = Math.min(100, s * filter.saturate / 100)
  } else {
    // t ∈ [0, 1] 对应 saturate [150, 200]
    const t = (filter.saturate - 150) / 50
    // sigmoid: 150 → 150.0，175 → ≈181.76，200 → ≈195.26
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
