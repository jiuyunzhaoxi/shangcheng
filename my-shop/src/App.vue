<template>
  <van-nav-bar
    :title="$route.meta?.title || ''"
    v-show="$route.meta?.isShowNav"
    @click-left="onClickLeft"
    :left-arrow="$route.meta?.isShowBack"
    fixed
    placeholder
    style="height: 46px"
  />
  
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" :key="$route.fullPath" />
    </keep-alive>
  </router-view>
  
  <tab-bar v-if="isShowTabbar"></tab-bar>
</template>

<script setup>
import TabBar from './components/TabBar.vue'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch, onMounted, computed } from 'vue'
import { getUser } from './api'
import useUser from './stores/user'
import useToken from './stores/token'
import { showToast } from 'vant'
// 新增：导入主题store
import { useThemeStore } from './stores/theme'

const route = useRoute()
const router = useRouter()

const { user, updateUser } = useUser()
const { token, hasToken } = useToken()

// 新增：使用主题store（只需要引入，不需要调用任何方法）
useThemeStore()

// 使用计算属性而不是响应式变量+watch
const isShowTabbar = computed(() => {
  // 如果meta中没有isTab字段，默认显示（兼容性处理）
  if (route.meta?.isTab === undefined) {
    return true
  }
  return route.meta?.isTab !== false
})

onMounted(async () => {
  console.log('App初始化，检查登录状态')
  console.log('token状态:', hasToken() ? '有token' : '无token')
  console.log('用户登录状态:', user.isLogin)
  
  // 如果有token但用户信息为空，尝试重新获取用户信息
  if (hasToken() && !user.isLogin) {
    console.log('有token但用户未登录，尝试获取用户信息')
    try {
      await loadUser()
    } catch (error) {
      console.error('自动登录失败:', error)
      // 如果自动登录失败，清除token
      if (error.message.includes('过期') || error.message.includes('未登录')) {
        const tokenStore = useToken()
        tokenStore.removeToken()
        updateUser({ isLogin: false, username: '', avatar: '' })
      }
    }
  } else if (!hasToken() && user.isLogin) {
    // 如果无token但有登录状态，清除登录状态
    console.log('无token但有登录状态，清除登录状态')
    updateUser({ isLogin: false, username: '', avatar: '' })
  }
})

const loadUser = async () => {
  try {
    const data = await getUser()
    if (data) {
      updateUser({
        isLogin: true,
        username: data.username || '',
        avatar: data.avatar || ''
      })
      console.log('用户信息加载成功:', data.username)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    showToast({
      message: '获取用户信息失败',
      type: 'fail'
    })
    throw error
  }
}

const onClickLeft = () => {
  // 检查是否可以返回
  if (router.options.history.state.back) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<style scoped>
/* 如果有需要样式可以在这里添加 */
</style>

<style>
/* 全局样式 */
/* 新增：CSS变量定义 */
:root {
  --bg-color: #ffffff;
  --text-color: #2c3e50;
  --border-color: #ebedf0;
  --card-bg: #ffffff;
}

[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #f0f0f0;
  --border-color: #333333;
  --card-bg: #2a2a2a;
}

/* 应用主题 */
#app {
  color: var(--text-color);
  line-height: 24px;
  background-color: var(--bg-color);
  transition: background-color 0.3s, color 0.3s;
}

/* 导航栏主题适配 */
.van-nav-bar {
  --van-nav-bar-background: #ff8000;
  --van-nav-bar-title-text-color: #fff;
  --van-nav-bar-icon-color: #fff;
}

/* 暗色模式下的导航栏 */
[data-theme="dark"] .van-nav-bar {
  --van-nav-bar-background: #444444;
}

/* 单元格主题适配 */
.van-cell {
  background-color: var(--card-bg);
  color: var(--text-color);
}

/* 卡片主题适配 */
.van-card {
  background-color: var(--card-bg);
  color: var(--text-color);
}

/* 网格项主题适配 */
.van-grid-item__content {
  background-color: var(--card-bg);
}

/* Tabbar主题适配 */
.van-tabbar {
  background-color: var(--card-bg);
  border-top: 1px solid var(--border-color);
}

/* 基础样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: var(--bg-color);
}

/* 确保路由视图正确显示 */
.router-view {
  min-height: calc(100vh - 96px);
}

/* 修复TabBar样式 */
.van-tabbar {
  z-index: 999;
}
</style>