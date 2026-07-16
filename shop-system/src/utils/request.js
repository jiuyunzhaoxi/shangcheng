import axios from 'axios'
import useToken from '../stores/token'
import { ElLoading } from 'element-plus'
import config from '../config'
import notification from './notification'
import router from '../router'

const baseURL = config.baseURL || config.RL || ''

let loadingInstance = null

const service = axios.create({ baseURL })

service.interceptors.request.use(cfg => {
  loadingInstance = ElLoading.service()
  const store = useToken()
  const token = (store && (store.token?.value ?? store.token)) || null
  if (token) {
    cfg.headers = cfg.headers || {}
    cfg.headers.jwt = token
  }
  return cfg
}, error => {
  if (loadingInstance) loadingInstance.close()
  return Promise.reject(error)
})

service.interceptors.response.use(
  response => {
    if (loadingInstance) loadingInstance.close()
    const { errno, data, errmsg } = response.data || {}
    if (errno === 0) {
      if (errmsg) {
        notification({ message: errmsg, type: 'success' })
      }
      return data || true
    }
    notification({ message: errmsg || '请求出错', type: 'error' })
    if (errno === 2) {
      router.push({ name: 'login' })
    }
    return Promise.resolve(false)
  },
  error => {
    if (loadingInstance) loadingInstance.close()
    notification({ message: '请求失败', type: 'error' })
    console.error(error)
    return Promise.reject(error)
  }
)

export default service