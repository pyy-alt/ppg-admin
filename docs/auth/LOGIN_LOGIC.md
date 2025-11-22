# 当前登录逻辑说明

## 📋 当前实现状态

### 1. 登录流程 (`src/features/auth/login.tsx`)

**当前实现（Mock）：**
```typescript
1. 用户输入 email 和 password
2. 提交表单 → 模拟延迟 1 秒
3. 创建 mockUser 对象（硬编码数据）
4. 保存到 auth store：
   - auth.setUser(mockUser)  // 内存
   - auth.setAccessToken('mock-token')  // Cookie
5. 重定向到目标页面
```

**问题：**
- ❌ 未调用真实 API (`AuthenticationApi::login`)
- ❌ 未调用 `AuthenticationApi::sessionLogout()` 清除之前会话
- ❌ 使用硬编码的 mock 数据

### 2. 认证存储 (`src/stores/auth-store.ts`)

**当前实现：**
```typescript
- Cookie Key: 'thisisjustarandomstring'
- 存储格式: JSON.stringify(accessToken)
- user: 存储在内存中
```

**问题：**
- ❌ Cookie 格式不符合规范（应该是 `xxx_jwt`，xxx 是站点标识）
- ❌ 未实现 Session 对象管理
- ❌ 未从 `AuthenticationApi::sessionGetCurrent()` 获取 Session

### 3. 路由守卫 (`src/routes/_authenticated/route.tsx`)

**当前实现：**
```typescript
- 检查 accessToken 是否存在
- 未登录 → 重定向到 /login
```

**问题：**
- ❌ 未检查 React State 中的 Session
- ❌ 未调用 `AuthenticationApi::sessionGetCurrent()` 验证会话
- ❌ 404 错误处理不完整

### 4. 登出逻辑 (`src/components/layout/header.tsx`)

**当前实现：**
```typescript
handleLogout() {
  router.navigate({ to: '/login' })
}
```

**问题：**
- ❌ 未调用 `AuthenticationApi::logout()`
- ❌ 未清除登录状态 (`auth.reset()`)
- ❌ 未重定向到 `/`（应该重定向到 `/`）

### 5. 全局错误处理 (`src/main.tsx`)

**当前实现：**
- ✅ 401 错误 → 清除状态 → 跳转登录（已实现）

---

## 🔧 需要改进的地方

### 1. 集成 OAS Client

**需要：**
- 安装并配置 OAS Client React
- 生成 API 客户端代码（使用 `support/codegen.sh`）
- 配置 API 基础 URL：`https://audi-api.ppg.dev.quasidea.com`

### 2. 更新认证存储

**需要修改：**
```typescript
// 当前
const ACCESS_TOKEN = 'thisisjustarandomstring'

// 应该改为
const SITE_TOKEN = 'audi' // 从 .env 获取
const JWT_COOKIE_NAME = `${SITE_TOKEN}_jwt`
```

### 3. 实现 Session 管理

**需要：**
- 添加 Session 接口定义
- 实现 `getCurrentSession()` 方法（调用 `AuthenticationApi::sessionGetCurrent()`）
- 在路由守卫中使用 Session 验证

### 4. 更新登录逻辑

**需要：**
```typescript
// 登录前
await AuthenticationApi.sessionLogout()

// 登录
const response = await AuthenticationApi.login({ email, password })
// JWT 会自动存储在 Cookie 中（格式：xxx_jwt）

// 获取 Session
const session = await AuthenticationApi.sessionGetCurrent()
auth.setUser(session)
```

### 5. 更新登出逻辑

**需要：**
```typescript
await AuthenticationApi.logout()
auth.reset()
router.navigate({ to: '/' })
```

### 6. 更新路由守卫

**需要：**
```typescript
// 1. 检查 React State 中的 Session
if (auth.user) {
  return // 已登录
}

// 2. 调用 API 验证
try {
  const session = await AuthenticationApi.sessionGetCurrent()
  auth.setUser(session)
  return // 已登录
} catch (error) {
  if (error.status === 404) {
    // 未登录，重定向
    throw redirect({ to: '/login', search: { redirect: location.href } })
  }
}
```

### 7. 多站点支持

**需要：**
- 创建 `.env` 文件配置站点标识
- 根据站点标识动态设置 Cookie 名称
- 根据站点标识设置品牌 Logo 和配色

---

## 📝 下一步行动

1. **安装 OAS Client**（如果还没有）
2. **生成 API 客户端代码**
3. **更新认证存储**（Cookie 格式、Session 管理）
4. **更新登录逻辑**（调用真实 API）
5. **更新登出逻辑**（调用 API + 清除状态）
6. **更新路由守卫**（Session 验证）
7. **实现多站点支持**（.env 配置）

