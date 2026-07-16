import { defineStore } from 'pinia'
import { ref } from 'vue'

const useToken = defineStore('token', () => {
  // 存储token值
  const token = ref('')
  
  // 更新token
  const updateToken = (val) => {
    console.log('updateToken被调用，传入值:', val)
    
    if (!val) {
      token.value = ''
      console.log('token已被清空')
      return
    }
    
    // 清理Bearer前缀
    let cleanedToken = val
    if (typeof val === 'string') {
      cleanedToken = val.replace(/^Bearer\s+/i, '').trim()
    }
    
    token.value = cleanedToken
    console.log('token已更新:', cleanedToken ? cleanedToken.substring(0, 20) + '...' : '空')
  }
  
  // 移除token
  const removeToken = () => {
    console.log('removeToken被调用')
    token.value = ''
  }
  
  // 检查是否有token
  const hasToken = () => {
    return !!token.value && token.value !== ''
  }
  
  // 获取token
  const getToken = () => {
    return token.value
  }
  
  return { 
    token,
    updateToken, 
    removeToken,
    hasToken,
    getToken
  }
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'token',
        storage: localStorage,
        serializer: {
          serialize: (state) => {
            try {
              return JSON.stringify({
                token: state.token || ''
              })
            } catch (error) {
              console.error('序列化token失败:', error)
              return JSON.stringify({ token: '' })
            }
          },
          deserialize: (str) => {
            try {
              const parsed = JSON.parse(str)
              return {
                token: parsed.token || ''
              }
            } catch (error) {
              console.error('解析token存储数据失败:', error)
              return { token: '' }
            }
          }
        }
      }
    ]
  }
})

export default useToken