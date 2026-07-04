import { ref, watch } from 'vue'

const STORAGE_KEY = 'mangareader-theme'

/**
 * 主题管理 composable（全局单例模式）
 * 控制亮色/暗色主题切换，持久化到 localStorage
 */
const currentTheme = ref('dark') // 'dark' | 'light'
const isDark = ref(true)

function applyTheme(theme) {
  currentTheme.value = theme
  isDark.value = theme === 'dark'

  // 设置 data-theme 属性（供 theme.css 使用）
  document.documentElement.setAttribute('data-theme', theme)

  // 控制 Element Plus 暗色模式
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  // 持久化
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // localStorage 不可用时静默失败
  }
}

function toggleTheme() {
  const next = currentTheme.value === 'dark' ? 'light' : 'dark'
  applyTheme(next)
}

function initTheme() {
  let theme = 'dark'
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') {
      theme = saved
    }
  } catch {
    // 默认暗色
  }
  applyTheme(theme)
}

export function useTheme() {
  return {
    currentTheme,
    isDark,
    toggleTheme,
    initTheme
  }
}
