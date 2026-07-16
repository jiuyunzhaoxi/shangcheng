<template>
  <div class="favorite-page">
    <van-nav-bar
      title="我的收藏"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />
    
    <div class="favorite-list">
      <van-empty
        v-if="favorites.length === 0"
        description="你还没有收藏任何商品哦~"
        image="https://img.yzcdn.cn/vant/custom-empty-image.png"
      >
        <van-button round type="primary" @click="$router.push('/home')">
          去逛逛
        </van-button>
      </van-empty>
      
      <div v-else>
        <van-card
          v-for="item in favorites"
          :key="item.id"
          :price="item.price"
          :title="item.name"
          :thumb="item.picture"
        >
          <template #footer>
            <van-button 
              size="mini" 
              type="primary" 
              @click="goToDetail(item.id)"
            >
              查看详情
            </van-button>
            <van-button 
              size="mini" 
              type="danger" 
              @click="removeFavorite(item.id)"
            >
              取消收藏
            </van-button>
          </template>
          <template #tags>
            <div class="favorite-time">
              收藏于：{{ formatTime(item.addedTime) }}
            </div>
          </template>
        </van-card>
        
        <div class="clear-all">
          <van-button 
            plain 
            type="danger" 
            size="small" 
            @click="clearAllFavorites"
          >
            清空收藏
          </van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog, showToast } from 'vant'
import { useFavoriteStore } from '../../stores/favorite'

const router = useRouter()
const favoriteStore = useFavoriteStore()

const favorites = computed(() => favoriteStore.favorites)

// 跳转到商品详情
const goToDetail = (id) => {
  router.push({ name: 'goodsDetail', params: { id } })
}

// 移除收藏
const removeFavorite = (id) => {
  showDialog({
    title: '提示',
    message: '确定要取消收藏吗？',
    showCancelButton: true,
  }).then(() => {
    favoriteStore.removeFromFavorites(id)
    showToast('已取消收藏')
  })
}

// 清空所有收藏
const clearAllFavorites = () => {
  showDialog({
    title: '警告',
    message: '确定要清空所有收藏吗？',
    showCancelButton: true,
  }).then(() => {
    favoriteStore.clearFavorites()
    showToast('已清空收藏')
  })
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}
</script>

<style scoped>
.favorite-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.favorite-list {
  padding: 10px;
}

.clear-all {
  text-align: center;
  margin: 20px 0;
  padding: 10px;
}

.favorite-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

:deep(.van-card) {
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.van-card__footer) {
  text-align: right;
}

:deep(.van-card__footer button) {
  margin-left: 5px;
}
</style>