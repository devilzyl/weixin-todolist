/**
 * 主题工具模块
 *
 * 管理浅色/深色主题切换和持久化
 */

const THEME_KEY = 'theme'

/**
 * 获取当前主题设置
 * @returns 'light' | 'dark'
 */
export function getTheme(): 'light' | 'dark' {
  return wx.getStorageSync(THEME_KEY) || 'light'
}

/**
 * 保存主题设置
 * @param theme 主题名称
 */
export function setTheme(theme: 'light' | 'dark'): void {
  wx.setStorageSync(THEME_KEY, theme)
}

/**
 * 切换主题
 * @returns 切换后的主题
 */
export function toggleTheme(): 'light' | 'dark' {
  const current = getTheme()
  const next = current === 'light' ? 'dark' : 'light'
  setTheme(next)
  return next
}

/**
 * 初始化主题设置
 * 设置页面主题样式
 */
export function initTheme(): void {
  const theme = getTheme()
  if (theme === 'dark') {
    wx.setBackgroundColor({ backgroundColor: '#1a1a2e' })
  }
}
