import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const useCart = defineStore('cart', () => {
  const cart = ref([])
  
  // 添加到购物车
  const addToCart = (goods) => {
    console.log('添加到购物车:', goods)
    const item = cart.value.find(item => String(item.id) === String(goods.id))
    if (item) {
      item.num += (goods.num || 1)
      console.log('商品已存在，更新数量:', item.num)
    } else {
      cart.value.push({
        id: goods.id,
        name: goods.name || `商品${goods.id}`,
        price: goods.price || 0,
        picture: goods.picture || '',
        num: goods.num || 1,
        checked: goods.checked !== false, // 默认选中
        stock: goods.stock || 99
      })
      console.log('新增商品到购物车')
    }
    return cart.value
  }
  
  // 从购物车移除
  const removeCart = (id) => {
    console.log('removeCart 被调用，要删除的商品ID:', id)
    console.log('删除前的购物车:', cart.value)
    
    const itemId = String(id)
    const index = cart.value.findIndex(item => String(item.id) === itemId)
    
    if (index !== -1) {
      cart.value.splice(index, 1)
      console.log('商品删除成功，删除后的购物车:', cart.value)
      return true
    } else {
      console.log('未找到要删除的商品')
      return false
    }
  }
  
  // 更新购物车商品
  const updateCartItem = (id, updates) => {
    const item = cart.value.find(item => String(item.id) === String(id))
    if (item) {
      Object.assign(item, updates)
      console.log('更新商品:', id, updates)
      return true
    }
    return false
  }
  
  // 批量更新购物车
  const updateCart = (newCart) => {
    cart.value = newCart
  }
  
  // 获取购物车商品数量（用于徽章）- 计算属性
  const cartCount = computed(() => {
    if (!cart.value || cart.value.length === 0) return 0
    let sum = 0
    cart.value.forEach(item => {
      sum += item.num || 0
    })
    console.log('购物车数量计算:', sum, 'items:', cart.value)
    return sum
  })
  
  // 获取购物车中所有商品的ID
  const getCartIds = () => {
    if (!cart.value || cart.value.length === 0) return []
    return cart.value.map(item => String(item.id))
  }
  
  // 获取选中的商品ID
  const getSelectedIds = () => {
    if (!cart.value || cart.value.length === 0) return []
    return cart.value.filter(item => item.checked).map(item => String(item.id))
  }
  
  // 获取选中商品的总价
  const selectedTotalPrice = computed(() => {
    if (!cart.value || cart.value.length === 0) return 0
    return cart.value.reduce((total, item) => {
      if (item.checked) {
        return total + (item.price || 0) * (item.num || 1)
      }
      return total
    }, 0)
  })
  
  // 获取选中商品的数量
  const selectedCount = computed(() => {
    if (!cart.value || cart.value.length === 0) return 0
    return cart.value.reduce((count, item) => {
      if (item.checked) {
        return count + (item.num || 1)
      }
      return count
    }, 0)
  })
  
  // 是否全选
  const isAllChecked = computed(() => {
    if (!cart.value || cart.value.length === 0) return false
    return cart.value.every(item => item.checked)
  })
  
  // 全选/取消全选
  const toggleAllChecked = (checked) => {
    if (!cart.value) return
    cart.value.forEach(item => {
      item.checked = checked
    })
  }
  
  // 清空购物车
  const clearCart = () => {
    cart.value = []
  }
  
  // 获取购物车总商品数
  const totalItems = computed(() => {
    if (!cart.value || cart.value.length === 0) return 0
    return cart.value.length
  })
  
  return { 
    // 响应式数据
    cart,
    
    // 操作方法
    addToCart, 
    removeCart, 
    updateCartItem,
    updateCart,
    toggleAllChecked,
    clearCart,
    getCartIds,
    getSelectedIds,
    
    // 计算属性
    cartCount,
    selectedTotalPrice,
    selectedCount,
    isAllChecked,
    totalItems
  }
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'cart',
        storage: localStorage,
        paths: ['cart']
      }
    ]
  }
})

export default useCart