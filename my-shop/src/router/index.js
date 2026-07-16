import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home',
    meta: { title: '首页' }
  },
  {
    path: '/home',
    component: () => import('../pages/Home.vue'),
    name: 'home',
    meta: { title: '首页', isTab: true }
  },
  {
    path: '/category',
    component: () => import('../pages/Category.vue'),
    name: 'category',
    meta: { title: '分类', isTab: true, isShowNav: true }
  },
  {
    path: '/message',
    component: () => import('../pages/Message.vue'),
    name: 'message',
    meta: { title: '消息', isTab: true, isShowNav: true }
  },
  {
    path: '/cart',
    component: () => import('../pages/Cart.vue'),
    name: 'cart',
    meta: { title: '购物车', isTab: true, isShowNav: true, isShowBack: true }
  },
  {
    path: '/user',
    component: () => import('../pages/User.vue'),
    name: 'user',
    meta: { title: '我的', isTab: true }
  },
  { 
    path: '/login', 
    component: () => import('../pages/Login.vue'),  
    name: 'login',  
    meta: { title: '登录', isTab: true, isShowNav: true, isShowBack: true }  
  },
  {  
    path: '/register',  
    component: () => import('../pages/Register.vue'),  
    name: 'register',  
    meta: { title: '注册', isTab: true, isShowNav: true, isShowBack: true } 
  },
  {  
    path: '/goodsList/:category_id',
    component: () => import('../pages/GoodsList.vue'),  
    props: true,  
    name: 'goodsList',
    meta: { title: '商品列表', isTab: true, isShowNav: true, isShowBack: true }  
  },
  { 
    path: '/goodsDetail/:id', 
    component: () => import('../pages/GoodsDetail.vue'),  
    props: true,  
    name: 'goodsDetail',  
    meta: { title: '商品详情', isTab: false, isShowNav: true, isShowBack: true }  
  },
  {
    path: '/user/favorite',
    component: () => import('../pages/user/Favorite.vue'),
    name: 'favorite',
    meta: { 
      title: '我的收藏', 
      isTab: false, 
      isShowNav: true, 
      isShowBack: true 
    }
  },
  {
    path: '/user/history',
    component: () => import('../pages/user/History.vue'),
    name: 'history',
    meta: { 
      title: '浏览历史', 
      isTab: false, 
      isShowNav: true, 
      isShowBack: true 
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 只保留标题设置，删除登录检查逻辑
router.beforeEach((to, from, next) => {
  const title = to.meta?.title
  if (title) {
    document.title = title + ' - 微商城'
  }
  next()
})

export default router