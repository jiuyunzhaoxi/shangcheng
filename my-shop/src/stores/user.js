import { defineStore } from 'pinia'
import { reactive } from 'vue'

const useUser = defineStore(
  'user',
  () => {
    const defaultUser = {
      isLogin: false,
      username: '',
      avatar: ''
    }

    const user = reactive({ ...defaultUser })

    const updateUser = (options) => {
      console.log('更新用户信息:', options)
      Object.assign(user, options)
      return user
    }

    const removeUser = () => {
      console.log('清除用户信息')
      Object.assign(user, defaultUser)
      return user
    }

    return { user, updateUser, removeUser }
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'user',
          storage: localStorage,
          paths: ['user'] // 明确指定持久化的路径
        }
      ]
    }
  }
)

export default useUser