<template>
  <div class="history-page">
    <van-nav-bar
      title="浏览历史"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />
    
    <div class="history-list">
      <van-empty
        v-if="historyList.length === 0"
        description="你还没有浏览记录哦~"
        image="https://img.yzcdn.cn/vant/custom-empty-image.png"
      >
        <van-button round type="primary" @click="$router.push('/home')">
          去逛逛
        </van-button>
      </van-empty>
      
      <div v-else>
        <div class="history-header">
          <span>最近浏览的商品</span>
          <van-button 
            size="mini" 
            plain 
            type="danger" 
            @click="clearAllHistory"
          >
            清空历史
          </van-button>
        </div>
        
        <div class="history-items">
          <div 
            v-for="item in historyList" 
            :key="item.id" 
            class="history-item"
          >
            <div class="item-left" @click="goToDetail(item.id)">
              <van-image
                width="80"
                height="80"
                :src="item.picture"
                radius="5"
              />
            </div>
            <div class="item-right" @click="goToDetail(item.id)">
              <div class="item-title">{{ item.name }}</div>
              <div class="item-price">¥{{ item.price }}</div>
              <div class="item-time">{{ item.viewDate }}</div>
            </div>
            <div class="item-actions">
              <van-icon 
                name="close" 
                size="16" 
                color="#999" 
                @click="removeHistory(item.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { showDialog, showToast } from 'vant'
import { useHistoryStore } from '../../stores/history'

const router = useRouter()
const historyStore = useHistoryStore()

const historyList = computed(() => historyStore.historyList)

// 跳转到商品详情
const goToDetail = (id) => {
  router.push({ name: 'goodsDetail', params: { id } })
}

// 删除单个历史记录
const removeHistory = (id) => {
  historyStore.removeFromHistory(id)
  showToast('已删除')
}

// 清空所有历史记录
const clearAllHistory = () => {
  showDialog({
    title: '警告',
    message: '确定要清空所有浏览历史吗？',
    showCancelButton: true,
  }).then(() => {
    historyStore.clearHistory()
    showToast('已清空浏览历史')
  })
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.history-list {
  padding: 10px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 5px;
  font-size: 14px;
  color: #666;
}

.history-items {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.history-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
}

.history-item:last-child {
  border-bottom: none;
}

.item-left {
  flex-shrink: 0;
  margin-right: 12px;
}

.item-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-price {
  color: #ff4444;
  font-weight: bold;
  font-size: 16px;
  margin-top: 5px;
}

.item-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
}
</style>