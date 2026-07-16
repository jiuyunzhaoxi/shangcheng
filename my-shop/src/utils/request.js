import axios from 'axios';
import config from '../config';
import router from '../router';
import { showLoadingToast, showToast, closeToast } from 'vant';

const baseURL = config.baseURL;
const service = axios.create({ 
  baseURL,
  timeout: 10000
});

// 创建一个变量来存储token实例，避免循环依赖
let tokenStoreInstance = null;

// 初始化token store
const initializeTokenStore = async () => {
  if (!tokenStoreInstance) {
    try {
      const module = await import('../stores/token');
      const useToken = module.default;
      tokenStoreInstance = useToken();
    } catch (error) {
      console.error('初始化token store失败:', error);
      return null;
    }
  }
  return tokenStoreInstance;
};

// 请求拦截器
service.interceptors.request.use(
  async config => {
    console.log('发起请求:', config.url, config.method);
    
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      loadingType: 'spinner',
      duration: 0
    });
    
    try {
      // 获取token store实例
      const tokenStore = await initializeTokenStore();
      
      if (tokenStore && tokenStore.token && tokenStore.token !== '') {
        console.log('设置token到请求头:', tokenStore.token);
        config.headers = config.headers || {};
        config.headers.jwt = tokenStore.token;
      } else {
        console.log('未找到有效token');
      }
    } catch (error) {
      console.error('请求拦截器错误:', error);
    }
    
    return config;
  },
  error => {
    closeToast();
    console.error('请求发送失败:', error);
    showToast({ message: '请求发送失败', type: 'fail' });
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    closeToast();
    
    console.log('API响应成功:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    
    const resp = response.data || {};
    
    // 检查是否为标准API响应格式
    if (resp.errno !== undefined) {
      const { errno, data, errmsg = '' } = resp;
      
      if (errno === 0) {
        if (errmsg) {
          showToast({ message: errmsg, type: 'success' });
        }
        return data === undefined ? true : data;
      }
      
      // 处理token过期或未登录
      if (errno === 2) {
        console.log('token过期或未登录，跳转到登录页');
        showToast({ 
          message: '登录已过期，请重新登录', 
          type: 'fail',
          duration: 2000
        });
        
        // 延迟跳转，避免toast被立即关闭
        setTimeout(() => {
          // 清空token
          initializeTokenStore().then(tokenStore => {
            if (tokenStore) {
              tokenStore.removeToken();
            }
          });
          
          // 跳转到登录页
          if (router.currentRoute.value.name !== 'login') {
            router.push({ 
              name: 'login',
              query: { redirect: router.currentRoute.value.fullPath }
            });
          }
        }, 1500);
        
        return Promise.reject(new Error('登录已过期'));
      }
      
      showToast({ message: errmsg || '请求出错', type: 'error' });
      return Promise.reject(new Error(errmsg || `API错误: ${errno}`));
    } else {
      // 非标准格式，直接返回原始数据
      return resp;
    }
  },
  error => {
    closeToast();
    
    console.error('=== 请求失败详情 ===');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
      console.error('请求URL:', error.config?.url);
      
      let message = '请求失败';
      const status = error.response.status;
      
      switch (status) {
        case 400:
          message = '请求参数错误';
          break;
        case 401:
          message = '未授权，请重新登录';
          // 清空token并跳转到登录页
          initializeTokenStore().then(tokenStore => {
            if (tokenStore) {
              tokenStore.removeToken();
            }
          });
          
          // 延迟跳转
          setTimeout(() => {
            if (router.currentRoute.value.name !== 'login') {
              router.push({ 
                name: 'login',
                query: { redirect: router.currentRoute.value.fullPath }
              });
            }
          }, 1500);
          break;
        case 403:
          message = '没有权限访问';
          break;
        case 404:
          message = '接口不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        case 502:
        case 503:
        case 504:
          message = '服务器暂时不可用';
          break;
        default:
          if (status >= 500) {
            message = '服务器错误';
          } else if (status >= 400) {
            message = '客户端错误';
          }
      }
      
      showToast({ 
        message: message, 
        type: 'fail',
        duration: 3000
      });
      
    } else if (error.request) {
      console.error('请求已发送但无响应:', error.request);
      showToast({ 
        message: '网络连接失败，请检查网络', 
        type: 'fail',
        duration: 3000
      });
    } else {
      console.error('请求配置错误:', error.message);
      showToast({ 
        message: '请求配置错误: ' + error.message, 
        type: 'fail',
        duration: 3000
      });
    }
    
    console.error('=====================');
    
    return Promise.reject(error);
  }
);

export default service;