<template>
  <div class="login-container">
    <div class="login-header">
      <h2>登录微商城</h2>
    </div>
    
    <van-form @submit="submitForm" @failed="onFailed" ref="ruleFormRef" :model="form">
      <van-cell-group>
        <van-field
          v-model="form.username"
          label="账号："
          placeholder="请输入账号"
          clearable
          name="username"
          :rules="usernameRules"
          left-icon="user-o"
        ></van-field>
      </van-cell-group>
      <van-cell-group>
        <van-field
          v-model="form.password"
          label="密码："
          placeholder="请输入密码"
          name="password"
          clearable
          type="password"
          :rules="passwordRules"
          left-icon="lock-o"
        ></van-field>
      </van-cell-group>
      <div style="margin: 20px 16px;">
        <van-button 
          block 
          round 
          type="primary" 
          native-type="submit"
          :loading="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </van-button>
      </div>
    </van-form>
    
    <div class="login-footer">
      <router-link :to="{ name: 'register' }">
        还没有账号？立即注册
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { login, getUser } from '../api'
import useToken from '../stores/token'
import useUser from '../stores/user'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const { updateToken } = useToken()
const { updateUser } = useUser()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: 'demo1',
  password: '123456'
})
const ruleFormRef = ref()
const loading = ref(false)

// 定义验证规则
const usernameRules = ref([
  { required: true, message: '用户名不能为空', trigger: 'onBlur' },
  { pattern: /^\w{3,16}$/, message: '用户名长度为3-16个字符', trigger: 'onBlur' }
])
const passwordRules = ref([
  { required: true, message: '密码不能为空', trigger: 'onBlur' },
  { pattern: /^\w{6,24}$/, message: '密码必须为6-24位英文字母或数字', trigger: 'onBlur' }
])

// 检查是否已登录
onMounted(() => {
  console.log('登录页面加载')
  // 如果有重定向参数，保存起来
  if (route.query.redirect) {
    console.log('有重定向参数:', route.query.redirect)
  }
})

// 表单提交函数
const submitForm = async (values) => {
  console.log('开始登录，表单数据:', values)
  loading.value = true
  
  try {
    const data = await login(values)
    console.log('登录API返回:', data)
    
    if (data && data.token) {
      console.log('登录成功，更新token')
      updateToken(data.token)
      
      // 获取用户信息
      console.log('获取用户信息...')
      const user = await getUser()
      console.log('用户信息:', user)
      
      updateUser({
        isLogin: true,
        username: user.username,
        avatar: user.avatar || ''
      })
      
      showToast({
        message: '登录成功',
        type: 'success',
        duration: 1000
      })
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        // 如果有重定向参数，跳转到原页面
        if (route.query.redirect) {
          console.log('跳转到重定向页面:', route.query.redirect)
          router.push(route.query.redirect)
        } else {
          router.push({ name: 'user' })
        }
      }, 1000)
    } else {
      showToast({
        message: '登录失败，请检查用户名和密码',
        type: 'fail'
      })
    }
  } catch (error) {
    console.error('登录过程出错:', error)
    showToast({
      message: error.message || '登录失败，请重试',
      type: 'fail'
    })
  } finally {
    loading.value = false
  }
}

const onFailed = errorInfo => {
  console.log('表单验证失败:', errorInfo)
}
</script>

<style lang="less" scoped>
.login-container {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  .login-header {
    text-align: center;
    margin: 40px 0 60px;
    
    h2 {
      color: #333;
      font-size: 24px;
      font-weight: bold;
    }
  }
  
  .login-footer {
    text-align: center;
    margin-top: 30px;
    
    a {
      color: #1989fa;
      text-decoration: none;
      font-size: 14px;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

:deep(.van-field__left-icon) {
  margin-right: 8px;
}

:deep(.van-cell-group) {
  margin-bottom: 20px;
}

:deep(.van-button) {
  font-size: 16px;
  height: 44px;
}
</style>