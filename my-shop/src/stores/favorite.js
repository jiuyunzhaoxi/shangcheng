import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoriteStore = defineStore('favorite', () => {
  // 从localStorage初始化收藏列表
  const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))
  
  // 添加到收藏
  const addToFavorites = (goods) => {
    // 检查是否已收藏
    const existingIndex = favorites.value.findIndex(item => item.id === goods.id)
    
    if (existingIndex === -1) {
      favorites.value.unshift({
        ...goods,
        addedTime: new Date().getTime()
      })
      saveToLocalStorage()
      return true
    }
    return false
  }
  
  // 移除收藏
  const removeFromFavorites = (id) => {
    const index = favorites.value.findIndex(item => item.id === id)
    if (index !== -1) {
      favorites.value.splice(index, 1)
      saveToLocalStorage()
      return true
    }
    return false
  }
  
  // 切换收藏状态
  const toggleFavorite = (goods) => {
    const isFavorited = isFavorite(goods.id)
    if (isFavorited) {
      removeFromFavorites(goods.id)
      return false
    } else {
      addToFavorites(goods)
      return true
    }
  }
  
  // 检查是否已收藏
  const isFavorite = (id) => {
    return favorites.value.some(item => item.id === id)
  }
  
  // 获取收藏数量
  const favoriteCount = computed(() => favorites.value.length)
  
  // 保存到localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }
  
  // 清空收藏
  const clearFavorites = () => {
    favorites.value = []
    localStorage.removeItem('favorites')
  }
  
  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    favoriteCount,
    clearFavorites
  }
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'favorite',
        storage: localStorage,
      }
    ]
  }
})