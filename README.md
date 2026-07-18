# 商城系统 (shangcheng)

基于 Vue 3 + ThinkJS 构建的全栈商城系统，包含用户端、管理后台和后端 API 服务。

## 项目结构

```
shangcheng/
├── my-shop/          # 用户端（Vue 3 + Vite）
├── shop-system/      # 管理后台（Vue 3 + Vite）
└── shop-backend/     # 后端 API（ThinkJS）
```

## 技术栈

| 模块 | 技术栈 |
|------|--------|
| **用户端 (my-shop)** | Vue 3, Vite, Vue Router, Pinia |
| **管理后台 (shop-system)** | Vue 3, Vite, Vue Router, Pinia |
| **后端 API (shop-backend)** | ThinkJS, MySQL |

## 功能模块

### 用户端 (my-shop)

- 用户登录 / 注册
- 商品浏览（首页、分类、列表、详情）
- 购物车管理
- 个人中心

### 管理后台 (shop-system)

- 管理员登录
- 商品管理（增删改查）
- 分类管理（增删改查）
- 管理员管理

### 后端 API (shop-backend)

提供 RESTful API 接口，包含以下模块：

- **管理员接口**：登录、修改密码、修改头像
- **分类接口**：列表、新增、编辑、删除
- **商品接口**：列表、新增、编辑、删除
- **首页接口**：登录、注册、用户信息、分类列表、商品列表、商品详情、购物车

详细接口文档请参考 [API文档.md](shop-backend/API文档.md)。

## 快速开始

### 环境要求

- Node.js (建议 v14 及以上)
- MySQL (建议 v5.7 及以上)

### 1. 后端服务 (shop-backend)

```bash
cd shop-backend
npm install
npm start
```

生产环境部署（使用 PM2）：

```bash
pm2 startOrReload pm2.json
```

### 2. 用户端 (my-shop)

```bash
cd my-shop
npm install
npm run dev
```

### 3. 管理后台 (shop-system)

```bash
cd shop-system
npm install
npm run dev
```

## 数据库配置

后端服务需要配置 MySQL 数据库，请根据实际情况修改 `shop-backend/src/config/` 下的数据库配置文件。

项目根目录下提供了 `data.sql` 文件，可用于初始化数据库表结构。

## API 接口概览

| 接口 | 方法 | 说明 |
|------|------|------|
| `/admin/login` | POST | 管理员登录 |
| `/admin/admin` | GET | 管理员列表 |
| `/admin/admin/changePassword` | POST | 修改密码 |
| `/admin/admin/changeAvatar` | POST | 修改头像 |
| `/admin/category/list` | GET | 分类列表 |
| `/admin/category/add` | POST | 新增分类 |
| `/admin/category/save` | POST | 编辑分类 |
| `/admin/category/del` | POST | 删除分类 |
| `/admin/goods/list` | GET | 商品列表 |
| `/admin/goods/add` | POST | 新增商品 |
| `/admin/goods/save` | POST | 编辑商品 |
| `/admin/goods/del` | POST | 删除商品 |
| `/admin/upload/picture` | POST | 图片上传 |
| `/home/login` | POST | 用户登录 |
| `/home/register` | POST | 用户注册 |
| `/home/user` | GET | 用户信息 |
| `/home/category/list` | GET | 分类列表 |
| `/home/goods/list` | GET | 商品列表 |
| `/home/goods/detail` | GET | 商品详情 |
| `/home/goods/album` | GET | 商品相册 |
| `/home/goods/cart` | GET | 购物车 |

## 注意事项

- 项目目前处于开发初期阶段，部分功能可能尚未完善
- 图片上传接口支持多种类型：`admin_avatar`（管理员头像）、`category_picture`（分类图）、`goods_picture`（商品图）、`goods_album`（商品轮播图）、`goods_description`（商品描述图）




