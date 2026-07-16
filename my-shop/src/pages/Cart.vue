<template>
  <div class="cart">
    <!-- 页面标题 -->
    <div class="cart-title">
      <h2>购物车</h2>
    </div>
    
    <div class="cart-container">
      <!-- 空购物车状态 -->
      <van-empty 
        v-if="goodsList.length === 0 && !loading" 
        description="购物车目前还没有商品" 
        :image="cartEmptyImage"
      >
        <router-link :to="{ name: 'category' }">
          <van-button round type="danger" class="bottom-button">去购物</van-button>
        </router-link>
      </van-empty>
      
      <!-- 购物车列表 -->
      <div v-for="item in goodsList" :key="item.id" class="list">
        <van-swipe-cell 
          :before-close="beforeClose"
          :name="item.id"
          ref="swipeCells"
        >
          <div class="list-content">
            <!-- 复选框 -->
            <div class="checkbox">
              <van-checkbox 
                :name="item.id" 
                v-model="item.cart.checked" 
                @change="onCheck(item.id)" 
                checked-color="#f11a27"
              ></van-checkbox>
            </div>
            
            <!-- 商品图片 -->
            <div class="image">
              <router-link :to="{ name: 'goodsDetail', params: { id: item.id } }">
                <van-image 
                  width="80" 
                  height="80" 
                  :src="item.picture || '/images/banner1.jpg'" 
                  fit="cover"
                  :alt="item.name"
                />
              </router-link>
            </div>
            
            <!-- 商品信息 -->
            <div class="goods-info">
              <div class="goods-name">{{ item.name || '商品' + item.id }}</div>
              <div class="goods-spec" v-if="item.spec">{{ item.spec }}</div>
              
              <div class="bottom">
                <div class="price">
                  <span class="currency">¥</span>
                  <span class="amount">{{ item.price || 0 }}</span>
                </div>
                
                <van-stepper 
                  v-model="item.cart.num" 
                  theme="round" 
                  button-size="24" 
                  :min="1"
                  :max="item.stock || 99"
                  disable-input 
                  @change="(value) => onStepperChange(item.id, value)"
                  class="stepper"
                />
              </div>
            </div>
          </div>
          
          <!-- 左滑删除 -->
          <template #right>
            <van-button 
              square 
              icon="delete" 
              type="danger" 
              class="delete-button" 
              @click.stop="onConfirmDelete(item.id)"
            >
              删除
            </van-button>
          </template>
        </van-swipe-cell>
      </div>
      
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <van-loading type="spinner" size="24px" />
        <div class="loading-text">加载中...</div>
      </div>
    </div>
    
    <!-- 结算栏 -->
    <van-submit-bar 
      v-if="goodsList.length > 0" 
      :price="total * 100" 
      button-text="去结算" 
      button-type="primary" 
      @submit="onSubmit" 
      class="settlement"
    >
      <van-checkbox 
        v-model="allChecked" 
        checked-color="#f11a27" 
        @click="onCheckAll"
      >
        全选
      </van-checkbox>
      
      <template #tip v-if="selectedCount > 0">
        已选择 {{ selectedCount }} 件商品
      </template>
    </van-submit-bar>

    <!-- 确认删除对话框 -->
    <van-dialog
      v-model:show="showDeleteDialog"
      title="确认删除"
      show-cancel-button
      @confirm="confirmDelete"
      @cancel="cancelDelete"
      :close-on-click-overlay="false"
    >
      <div class="dialog-content">
        <p>确定要删除这个商品吗？</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { getCartList } from '../api'
import useCart from '../stores/cart'
import { showToast, Dialog } from 'vant'
import cartEmptyImage from '../assets/images/cart_empty.png'
import { storeToRefs } from 'pinia'

// 导入cart store
const cartStore = useCart()
// 使用storeToRefs保持响应式
const { cart } = storeToRefs(cartStore)
// 解构方法
const { removeCart, updateCartItem, getCartIds, toggleAllChecked } = cartStore

const goodsList = ref([])
const allChecked = ref(false)
const loading = ref(false)
const showDeleteDialog = ref(false)
const deletingItemId = ref(null)
const swipeCells = ref([])

// 监听购物车变化
watch(cart, () => {
  console.log('购物车store变化，重新加载数据')
  loadCart()
}, { deep: true })

// 计算总价 - 修复NaN问题
const total = computed(() => {
  if (goodsList.value.length === 0) return 0
  
  let sum = 0
  goodsList.value.forEach(item => {
    if (item.cart?.checked) {
      // 确保价格和数量都是数字
      const price = Number(item.price) || 0
      const num = Number(item.cart.num) || 1
      if (!isNaN(price) && !isNaN(num)) {
        sum += price * num
      }
    }
  })
  
  // 保留两位小数
  const formattedSum = Number(sum.toFixed(2))
  console.log('计算总金额:', formattedSum, '元')
  return formattedSum
})

// 计算已选商品数量
const selectedCount = computed(() => {
  if (goodsList.value.length === 0) return 0
  
  let count = 0
  goodsList.value.forEach(item => {
    if (item.cart?.checked) {
      count += Number(item.cart.num) || 1
    }
  })
  return count
})

onMounted(async () => {
  console.log('购物车页面挂载')
  await loadCart()
  checkAllStatus()
})

// 加载购物车数据
const loadCart = async () => {
  console.log('开始加载购物车数据...')
  loading.value = true
  
  try {
    // 获取购物车中所有商品的ID
    const ids = getCartIds()
    console.log('购物车商品ID:', ids)
    
    if (ids.length === 0) {
      goodsList.value = []
      console.log('购物车为空')
      loading.value = false
      return
    }
    
    // 调用API获取商品详情
    console.log('调用API获取商品详情...')
    const data = await getCartList({ ids: ids.join(',') })
    console.log('API返回数据:', data)
    
    // 合并购物车store中的数量信息
    if (data && data.length > 0) {
      goodsList.value = data.map(goods => {
        const cartItem = cart.value.find(item => String(item.id) === String(goods.id))
        console.log(`商品${goods.id}在购物车中的信息:`, cartItem)
        
        // 确保价格是数字类型
        const price = Number(goods.price) || 0
        
        return {
          ...goods,
          price: price, // 确保价格是数字
          cart: {
            num: cartItem?.num || 1,
            checked: cartItem?.checked !== false // 默认选中
          }
        }
      })
    } else {
      // API返回空数据，使用store数据
      console.log('API返回空数据，使用store数据')
      goodsList.value = cart.value.map(item => ({
        id: item.id,
        name: item.name || `商品${item.id}`,
        price: Number(item.price) || 99.99, // 确保是数字
        picture: item.picture || '/images/banner1.jpg',
        stock: item.stock || 99,
        cart: {
          num: item.num || 1,
          checked: item.checked !== false
        }
      }))
    }
    
    console.log('最终购物车列表:', goodsList.value)
    
  } catch (error) {
    console.error('加载购物车失败:', error)
    
    // 如果API失败，使用store中的基础数据
    if (cart.value && cart.value.length > 0) {
      console.log('使用store数据作为回退')
      goodsList.value = cart.value.map(item => ({
        id: item.id,
        name: item.name || `商品${item.id}`,
        price: Number(item.price) || 99.99, // 确保是数字
        picture: item.picture || '/images/banner1.jpg',
        stock: item.stock || 99,
        cart: {
          num: item.num || 1,
          checked: item.checked !== false
        }
      }))
    } else {
      goodsList.value = []
    }
    
    showToast({
      message: '加载购物车失败',
      type: 'fail'
    })
  } finally {
    loading.value = false
    console.log('购物车加载完成，商品数量:', goodsList.value.length)
  }
}

// 左滑删除前的确认
const beforeClose = ({ position, instance, name }) => {
  console.log('左滑删除事件:', position, name)
  
  if (position === 'right') {
    // 显示确认对话框
    deletingItemId.value = name
    showDeleteDialog.value = true
    
    // 阻止自动关闭
    return false
  }
  
  // 其他方向自动关闭
  instance.close()
}

// 确认删除商品
const confirmDelete = () => {
  if (!deletingItemId.value) return
  
  console.log('确认删除商品:', deletingItemId.value)
  
  // 从列表中移除
  goodsList.value = goodsList.value.filter(goods => String(goods.id) !== String(deletingItemId.value))
  
  // 从store中移除
  removeCart(deletingItemId.value)
  
  // 关闭所有打开的swipe-cell
  closeAllSwipeCells()
  
  showToast({
    message: '删除成功',
    type: 'success',
    duration: 1500
  })
  
  // 重置状态
  deletingItemId.value = null
  showDeleteDialog.value = false
  
  // 更新全选状态
  checkAllStatus()
}

// 取消删除
const cancelDelete = () => {
  console.log('取消删除')
  deletingItemId.value = null
  showDeleteDialog.value = false
  
  // 关闭所有打开的swipe-cell
  closeAllSwipeCells()
}

// 关闭所有打开的swipe-cell
const closeAllSwipeCells = () => {
  nextTick(() => {
    if (swipeCells.value && swipeCells.value.length > 0) {
      swipeCells.value.forEach(cell => {
        if (cell && cell.close) {
          cell.close()
        }
      })
    }
  })
}

// 直接点击删除按钮（备用方法）
const onConfirmDelete = (id) => {
  console.log('直接点击删除按钮:', id)
  deletingItemId.value = id
  showDeleteDialog.value = true
}

// 全选/取消全选
const onCheckAll = () => {
  console.log('全选状态:', allChecked.value)
  goodsList.value.forEach(item => {
    if (item.cart) {
      item.cart.checked = allChecked.value
      updateCartItem(item.id, { checked: allChecked.value })
    }
  })
  
  // 更新store的全选状态
  toggleAllChecked(allChecked.value)
}

// 检查全选状态
const checkAllStatus = () => {
  const hasItems = goodsList.value.length > 0
  const allSelected = hasItems && goodsList.value.every(item => item.cart?.checked)
  allChecked.value = allSelected
  console.log('全选状态检查:', allSelected, '商品数量:', goodsList.value.length)
}

// 单个商品选择状态变化
const onCheck = (id) => {
  console.log('商品选择变化:', id)
  const item = goodsList.value.find(item => String(item.id) === String(id))
  if (item && item.cart) {
    updateCartItem(id, { checked: item.cart.checked })
  }
  checkAllStatus()
}

// 数量变化
const onStepperChange = (id, num) => {
  console.log('商品数量变化:', id, '数量:', num)
  updateCartItem(id, { num })
}

// 去结算
const onSubmit = () => {
  const selectedItems = goodsList.value.filter(item => item.cart?.checked)
  if (selectedItems.length === 0) {
    showToast({
      message: '请选择要结算的商品',
      type: 'warning'
    })
    return
  }
  
  console.log('结算商品:', selectedItems)
  console.log('总金额:', total.value)
  
  showToast({
    message: `结算 ${selectedCount.value} 件商品，总金额: ¥${total.value}`,
    duration: 3000
  })
  
  // 这里可以跳转到订单确认页面
  // router.push({ name: 'orderConfirm' })
}
</script>

<style lang="less" scoped>
.cart {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 100px;
  
  .cart-title {
    padding: 15px;
    background: white;
    border-bottom: 1px solid #f0f0f0;
    
    h2 {
      margin: 0;
      font-size: 18px;
      color: #333;
      text-align: center;
      font-weight: bold;
    }
  }
  
  .cart-container {
    padding: 10px;
    
    .list {
      margin-bottom: 10px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      background: white;
      
      .list-content {
        display: flex;
        align-items: center;
        padding: 12px;
        min-height: 104px;
        
        .checkbox {
          flex-shrink: 0;
          margin-right: 10px;
          
          :deep(.van-checkbox) {
            transform: scale(1.2);
          }
        }
        
        .image {
          flex-shrink: 0;
          margin-right: 12px;
          
          a {
            display: block;
          }
          
          .van-image {
            border-radius: 8px;
            overflow: hidden;
          }
        }
        
        .goods-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 80px;
          
          .goods-name {
            font-size: 15px;
            color: #333;
            line-height: 1.4;
            font-weight: 500;
            margin-bottom: 4px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .goods-spec {
            font-size: 12px;
            color: #999;
            margin-bottom: 8px;
          }
          
          .bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .price {
              color: #e82519;
              font-weight: bold;
              
              .currency {
                font-size: 12px;
              }
              
              .amount {
                font-size: 18px;
              }
            }
            
            .stepper {
              :deep(.van-stepper__plus),
              :deep(.van-stepper__minus) {
                width: 24px;
                height: 24px;
              }
              
              :deep(.van-stepper__input) {
                width: 28px;
                font-size: 14px;
              }
            }
          }
        }
      }
      
      .delete-button {
        width: 70px;
        height: 100%;
        font-size: 14px;
        border-radius: 0;
      }
    }
    
    .loading-container {
      text-align: center;
      padding: 40px 0;
      
      .loading-text {
        margin-top: 10px;
        color: #999;
        font-size: 14px;
      }
    }
    
    .bottom-button {
      width: 160px;
      height: 44px;
      margin-top: 20px;
    }
  }
  
  .settlement {
    :deep(.van-submit-bar) {
      bottom: 50px;
    }
    
    :deep(.van-submit-bar__tip) {
      font-size: 12px;
      color: #666;
    }
  }
  
  .dialog-content {
    padding: 20px 10px;
    text-align: center;
    
    p {
      margin: 0;
      font-size: 16px;
      color: #333;
    }
  }
}

// 响应式调整
@media (max-width: 320px) {
  .cart {
    .list {
      .list-content {
        .goods-info {
          .goods-name {
            font-size: 14px;
          }
          
          .price {
            .amount {
              font-size: 16px;
            }
          }
        }
      }
    }
  }
}
</style>