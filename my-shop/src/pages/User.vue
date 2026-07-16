<template>
  <!-- 已登录 -->
  <van-row v-if="user.isLogin" class="user-info">
    <van-image v-if="user.avatar" round width="100" height="100" :src="user.avatar" />
    <van-image v-else round width="100" height="100" :src="avatar_default" />
    <span class="user-info-name">{{ user.username }}</span>
    <van-button plain type="danger" size="mini" @click="onLogout">退出</van-button>
  </van-row>
  <!-- 未登录 -->
  <van-row v-else class="user-info">
    <van-image round width="100" height="100" :src="avatar_default" />
    <router-link :to="{ name: 'login' }">
      <span class="user-info-name">登录&nbsp;&nbsp;</span>
    </router-link>
    <router-link :to="{ name: 'register' }">
      <span class="user-info-name">注册</span>
    </router-link>
  </van-row>
  <van-row class="user-links">
    <van-col span="6">
      <van-icon name="pending-payment" />
      待付款
    </van-col>
    <van-col span="6">
      <van-icon name="records" :badge="user.isLogin ? '7' : ''" />
      待收货
    </van-col>
    <van-col span="6">
      <van-icon name="tosend" :badge="user.isLogin ? '40' : ''" />
      待评价
    </van-col>
    <van-col span="6">
      <van-icon name="logistics" :badge="user.isLogin ? '1' : ''" />
      退换/售后
    </van-col>
  </van-row>
  <van-cell-group class="user-group my-title">
    <van-cell icon="records" title="全部订单" is-link />
  </van-cell-group>
  <van-cell-group class="my-title">
    <!-- 新增：主题切换按钮 -->
    <van-cell 
      :icon="theme === 'light' ? 'eye' : 'eye-o'" 
      :title="theme === 'light' ? '暗色模式' : '亮色模式'" 
      is-link 
      @click="toggleTheme" 
    />
    <van-cell icon="star-o" title="我的收藏" is-link @click="goToFavorite" />
    <van-cell icon="clock-o" title="浏览历史" is-link @click="goToHistory" />
    <van-cell icon="points" title="我的积分" is-link />
    <van-cell icon="gold-coin-o" title="我的优惠券" is-link />
    <van-cell icon="gift-o" title="我的红包" is-link />
  </van-cell-group>
</template>

<script setup>
import avatar_default from '../assets/images/avatar_default.png'
import router from '../router/index'
import useToken from '../stores/token'
import useUser from '../stores/user'
import { showToast } from 'vant'
import { onMounted, computed } from 'vue'
import { useFavoriteStore } from '../stores/favorite'
// 新增：导入主题store
import { useThemeStore } from '../stores/theme'

const { removeToken, hasToken } = useToken()
const { user, removeUser } = useUser()
const favoriteStore = useFavoriteStore()
// 新增：使用主题store
const themeStore = useThemeStore()

// 新增：计算当前主题
const theme = computed(() => themeStore.theme)

// 组件加载时检查登录状态
onMounted(() => {
  console.log('用户页面加载，登录状态:', user.isLogin)
  console.log('token状态:', hasToken() ? '有token' : '无token')
  console.log('当前主题:', theme.value)
  
  // 如果有token但没有登录状态，尝试重新获取用户信息
  if (hasToken() && !user.isLogin) {
    console.log('有token但未登录，可能需要重新获取用户信息')
    // 这里可以添加重新获取用户信息的逻辑
  }
})

// 退出登录
const onLogout = async () => {
  console.log('用户退出登录')
  removeToken()
  removeUser()
  
  showToast({
    message: '退出成功',
    type: 'success',
    duration: 1000
  })
  
  // 延迟跳转，让用户看到退出提示
  setTimeout(() => {
    router.push({ name: 'user' })
  }, 1000)
}

// 跳转到我的收藏
const goToFavorite = () => {
  router.push('/user/favorite')
}

// 跳转到浏览历史
const goToHistory = () => {
  router.push('/user/history')
}

// 新增：切换主题
const toggleTheme = () => {
  themeStore.toggleTheme()
  showToast({
    message: `已切换到${theme.value === 'light' ? '暗色' : '亮色'}模式`,
    duration: 1000
  })
}
</script>

<style lang="less" scoped>
.user-info {
  padding: 15px;
  background: url('../assets/images/user_head_bg.png') no-repeat;
  background-size: 100%;
  /* 新增：暗色模式下的背景调整 */
  [data-theme="dark"] & {
    background: linear-gradient(135deg, #444444 0%, #2a2a2a 100%);
  }
}
.user-info button {
  margin: 40px 0 0 10px;
}
.user-info-name {
  display: inline-block;
  color: #fff;
  padding: 40px 0 0 10px;
  font-size: 20px;
}

:deep(.van-badge--top-right) {
  top: 4px;
  right: 35px;
  transform: translate(50%, -50%);
}
.user {
  &-group {
    margin-bottom: 15px;
  }
  &-links {
    padding: 15px 0;
    font-size: 12px;
    text-align: center;
    background-color: var(--card-bg);
    border-radius: 8px;
    margin: 10px;
    .van-icon {
      display: block;
      font-size: 24px;
      color: var(--text-color);
    }
    /* 文字颜色 */
    color: var(--text-color);
  }
}
</style>