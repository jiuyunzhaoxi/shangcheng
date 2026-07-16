import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 默认主题为light（亮色）
  const theme = ref(localStorage.getItem('theme') || 'light')
  
  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  // 监听主题变化，保存到localStorage并应用到html标签
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, { immediate: true })
  
  return {
    theme,
    toggleTheme
  }
})