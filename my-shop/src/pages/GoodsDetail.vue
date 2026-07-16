<template>
  <div class="goods" v-if="!isNotFound">
    <!-- 收藏按钮 -->
    <div class="favorite-btn" @click="toggleFavorite">
      <van-icon 
        :name="isFavorited ? 'star' : 'star-o'" 
        :color="isFavorited ? '#ff6b6b' : '#999'" 
        size="24"
      />
    </div>
    
    <van-swipe class="goods-swipe" :autoplay="3000">
      <van-swipe-item v-for="item in album" :key="item.id">
        <img :src="item.picture" height="414">
      </van-swipe-item>
    </van-swipe>
    
    <!-- 商品信息部分 -->
    <van-cell-group>
      <van-cell>
        <template #title>
          <span class="goods-top">新品</span>
          <div class="goods-price">
            <span class="small">￥</span>
            {{ goods.price }}
            <span class="spec">{{ goods.spec }}</span>
          </div>
          <div class="goods-title">
            <span class="small"> {{ goods.name }}</span>
          </div>
        </template>
      </van-cell>
      <van-cell class="goods-express">
        <template #title>
          <van-col span="10">运费：10</van-col>
          <van-col span="14">剩余：{{ goods.stock }}</van-col>
        </template>
      </van-cell>
    </van-cell-group>
    
    <van-cell-group class="goods-cell-group">
      <van-cell>
        <template #title>
          <span class="van-cell-text">发货 陕西宝鸡</span>
        </template>
      </van-cell>
      <van-cell>
        <template #title>
          <span class="van-cell-text">保障 坏单包赔·假一赔四·极速退款</span>
        </template>
      </van-cell>
      <van-cell>
        <template #title>
          <span class="van-cell-text">参数 品牌：枝纯 价格：100-200</span>
        </template>
      </van-cell>
    </van-cell-group>
    
    <div class="goods-cell-title">
      —— 宝贝详情 ——
    </div>
    <div class="goods-description" v-html="goods.description"></div>
    
    <!-- 底部按钮-->
    <van-action-bar>
      <van-action-bar-icon icon="chat-o" text="客服" @click="sorry" />
      <van-action-bar-icon 
        icon="star-o" 
        :text="isFavorited ? '已收藏' : '收藏'" 
        @click="toggleFavorite" 
      />
      <van-action-bar-icon icon="cart-o" :badge="cartCount" text="购物车" @click="onClickCart" />
      <van-action-bar-button type="warning" text="加入购物车" @click="addCart" />
      <van-action-bar-button type="danger" text="立即购买" @click="sorry" />
    </van-action-bar>
  </div>
  
  <div class="goods-not-found" v-else>商品不存在</div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { getGoodsAlbum, getGoodsDetail } from '../api'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import useCart from '../stores/cart'
import { storeToRefs } from 'pinia'
import { useFavoriteStore } from '../stores/favorite'
import { useHistoryStore } from '../stores/history'

const goods = reactive({})
const album = ref([])
const isNotFound = ref(false)
const router = useRouter()

// 正确导入cart store，使用storeToRefs保持响应式
const cartStore = useCart()
const { cartCount } = storeToRefs(cartStore)
const { addToCart } = cartStore

// 导入收藏和历史store
const favoriteStore = useFavoriteStore()
const historyStore = useHistoryStore()

const props = defineProps({
  id: String
})

// 检查是否已收藏
const isFavorited = computed(() => {
  return favoriteStore.isFavorite(props.id)
})

// 切换收藏状态
const toggleFavorite = () => {
  if (!goods.id) {
    showToast({
      message: '商品信息未加载完成',
      type: 'fail'
    })
    return
  }
  
  const goodsData = {
    id: goods.id,
    name: goods.name,
    picture: goods.picture || '',
    price: goods.price,
    spec: goods.spec
  }
  
  const added = favoriteStore.toggleFavorite(goodsData)
  if (added) {
    showToast({
      message: '已添加到收藏',
      icon: 'star',
      type: 'success'
    })
  } else {
    showToast('已取消收藏')
  }
}

// 加载商品详情
const loadGoodsDetail = async () => {
  try {
    const data1 = await getGoodsDetail({ id: props.id })
    if (!data1.id) {
      isNotFound.value = true
      return
    }
    
    const data2 = await getGoodsAlbum({ goods_id: props.id })
    if (data2.length === 0 && data1.picture !== '') {
      data2.push({ picture: data1.picture })
    }
    
    Object.assign(goods, data1)
    console.log('商品详情加载完成:', goods)
    album.value = data2
    
    // 商品加载成功后，添加到浏览历史
    const historyData = {
      id: goods.id,
      name: goods.name,
      picture: goods.picture || '',
      price: goods.price
    }
    historyStore.addToHistory(historyData)
  } catch (error) {
    console.error('加载商品详情失败:', error)
    isNotFound.value = true
    showToast({
      message: '加载商品详情失败',
      type: 'fail'
    })
  }
}

onMounted(() => {
  loadGoodsDetail()
})

// 抱歉提示
const sorry = () => {
  showToast('暂无后续逻辑~')
}

// 点击购物车
const onClickCart = () => {
  router.push({ name: 'cart' })
}

// 添加到购物车
const addCart = () => {
  if (!goods.id) {
    showToast({
      message: '商品信息未加载完成',
      type: 'fail'
    })
    return
  }
  
  const cartItem = {
    id: goods.id,
    name: goods.name,
    price: goods.price,
    num: 1,
    checked: true
  }
  
  console.log('准备添加到购物车:', cartItem)
  addToCart(cartItem)
  
  showToast({
    message: '添加成功',
    type: 'success',
    duration: 1500
  })
}
</script>

<style lang="less" scoped>
.goods {
  text-align: center;
  padding-bottom: 50px;
  position: relative;
  
  .favorite-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .goods-swipe {
    img {
      width: 100%;
      display: block;
    }
  }
  
  .goods-top {
    display: block;
    width: 30px;
    padding: 0 5px;
    border-radius: 10px;
    color: #fff;
    background-color: #f44;
  }
  
  .goods-title {
    text-align: left;
    
    .small {
      font-size: 14px;
    }
  }
  
  .goods-price {
    color: #f44;
    text-align: left;
    font-size: 20px;
    
    .small {
      font-size: 12px;
    }
    
    .spec {
      font-size: 12px;
      color: #999;
    }
  }
  
  .goods-cell-title {
    padding: 20px 0;
  }
  
  .goods-description {
    width: 95%;
    margin: 0 auto;
    padding-bottom: 20px;
    font-size: 14px;
    
    :deep(img) {
      max-width: 100%;
      height: auto;
      display: block;
    }
  }
  
  &-express {
    color: #999;
    font-size: 12px;
    padding: 5px 15px;
    
    :deep(.van-col) {
      float: left;
    }
    
    :deep(.van-col--14) {
      width: 58%;
    }
  }
  
  .goods-cell-group {
    :deep(.van-cell__title span) {
      float: left;
    }
  }
  
  :deep(.van-cell:after) {
    border: none;
  }
}

.goods-not-found {
  padding-top: 48px;
  text-align: center;
  font-size: 28px;
}
</style>