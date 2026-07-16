<template>
  <div class="goods-list">
    <div class="goods-item" v-for="item in goodsList" :key="item.id">
      <router-link :to="{ name: 'goodsDetail', params: { id: item.id } }">
        <van-image
          width="150"
          height="150"
          :src="item.picture"
          :alt="item.name"
        />
        <h3 class="title">{{ item.name }}<span class="small">{{ item.spec }}</span></h3>
        <p class="info">
          <span class="price">¥{{ item.price }}</span>
          <span class="sell">剩余 {{ item.stock }} 件</span>
        </p>
      </router-link>
    </div>
    
    <!-- 加载更多按钮 -->
    <div class="load-more-container" v-if="goodsList.length > 0">
      <van-button 
        class="more" 
        :disabled="is_last || loading" 
        v-if="!is_last" 
        size="large" 
        type="primary" 
        plain 
        hairline 
        @click="getMore"
        :loading="loading"
      >
        {{ loading ? '加载中...' : '加载更多' }}
      </van-button>
      <div class="no-more" v-else>没有更多商品了</div>
    </div>
    
    <!-- 空状态 -->
    <van-empty v-if="goodsList.length === 0 && !loading" description="暂无商品">
      <router-link :to="{ name: 'category' }">
        <van-button round type="primary">去逛逛</van-button>
      </router-link>
    </van-empty>
    
    <!-- 加载中 -->
    <van-loading v-if="loading && goodsList.length === 0" class="loading" />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { getGoodsList } from '../api'
import { showToast } from 'vant'

const props = defineProps({
  category_id: String
})

const goodsList = ref([])
const is_last = ref(false)
const loading = ref(false)
let last_id = '0'

// 监听 category_id 变化时重新加载
watch(() => props.category_id, () => {
  resetList()
  loadGoodList()
})

onMounted(() => {
  loadGoodList()
})

// 重置列表
const resetList = () => {
  goodsList.value = []
  last_id = '0'
  is_last.value = false
}

const loadGoodList = async () => {
  if (loading.value || is_last.value) return
  
  loading.value = true
  try {
    let params = {
      last_id,
      category_id: props.category_id,
      pagesize: 8 // 增加到8条，更好的用户体验
    }
    
    const data = await getGoodsList(params)
    
    if (data && data.length > 0) {
      goodsList.value = [...goodsList.value, ...data]
      last_id = data[data.length - 1].id
      
      // 如果返回的数据少于请求的页大小，说明已经是最后一页
      if (data.length < params.pagesize) {
        is_last.value = true
      }
    } else if (goodsList.value.length > 0) {
      is_last.value = true
    } else {
      // 首次加载无数据
      showToast({
        message: '暂无商品',
        type: 'warning'
      })
    }
  } catch (error) {
    console.error('加载商品列表失败:', error)
    showToast({
      message: '加载失败',
      type: 'fail'
    })
  } finally {
    loading.value = false
  }
}

const getMore = () => {
  if (!loading.value && !is_last.value) {
    loadGoodList()
  }
}
</script>

<style lang="less" scoped>
.goods-list {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 5px;
  clear: both;
  min-height: 200px;
  
  .goods-item {
    width: calc(50% - 10px);
    margin: 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    padding: 10px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.98);
    }
    
    a {
      text-decoration: none;
      color: inherit;
      display: block;
    }
    
    .van-image {
      border-radius: 6px;
      overflow: hidden;
    }
    
    .title {
      text-align: left;
      font-size: 14px;
      color: #333;
      margin: 8px 0 0;
      padding: 0;
      font-weight: normal;
      line-height: 1.4;
      height: 40px;
      overflow: hidden;
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      
      .small {
        font-size: 12px;
        padding-left: 4px;
        color: #999;
        display: block;
        margin-top: 2px;
      }
    }
    
    .info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding: 0;
      
      .price {
        color: #ff4444;
        font-weight: bold;
        font-size: 16px;
        
        &::before {
          content: '¥';
          font-size: 12px;
        }
      }
      
      .sell {
        font-size: 12px;
        color: #999;
      }
    }
  }
  
  .load-more-container {
    width: 100%;
    margin: 20px 0;
    text-align: center;
    
    .more {
      width: 200px;
      margin: 0 auto;
    }
    
    .no-more {
      color: #999;
      font-size: 14px;
      padding: 10px 0;
    }
  }
  
  .loading {
    width: 100%;
    text-align: center;
    padding: 40px 0;
  }
}

// 响应式调整
@media (min-width: 768px) {
  .goods-list {
    .goods-item {
      width: calc(33.33% - 10px);
    }
  }
}

@media (min-width: 1024px) {
  .goods-list {
    .goods-item {
      width: calc(25% - 10px);
    }
  }
}
</style>