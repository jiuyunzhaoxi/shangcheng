import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  // 从localStorage初始化历史记录
  const historyList = ref(JSON.parse(localStorage.getItem('viewHistory') || '[]'))
  
  // 最大历史记录数量
  const MAX_HISTORY = 20
  
  // 添加浏览记录
  const addToHistory = (goods) => {
    // 去重：如果已存在，先移除
    const existingIndex = historyList.value.findIndex(item => item.id === goods.id)
    if (existingIndex !== -1) {
      historyList.value.splice(existingIndex, 1)
    }
    
    // 添加新记录到开头
    historyList.value.unshift({
      id: goods.id,
      name: goods.name,
      picture: goods.picture,
      price: goods.price,
      viewTime: new Date().getTime(),
      viewDate: new Date().toLocaleDateString()
    })
    
    // 限制数量
    if (historyList.value.length > MAX_HISTORY) {
      historyList.value = historyList.value.slice(0, MAX_HISTORY)
    }
    
    saveToLocalStorage()
  }
  
  // 清空历史记录
  const clearHistory = () => {
    historyList.value = []
    localStorage.removeItem('viewHistory')
  }
  
  // 删除单个历史记录
  const removeFromHistory = (id) => {
    const index = historyList.value.findIndex(item => item.id === id)
    if (index !== -1) {
      historyList.value.splice(index, 1)
      saveToLocalStorage()
      return true
    }
    return false
  }
  
  // 获取历史记录数量
  const historyCount = computed(() => historyList.value.length)
  
  // 保存到localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('viewHistory', JSON.stringify(historyList.value))
  }
  
  return {
    historyList,
    addToHistory,
    clearHistory,
    removeFromHistory,
    historyCount
  }
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'history',
        storage: localStorage,
      }
    ]
  }
})