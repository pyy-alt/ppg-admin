# 认证系统详细说明

## 📋 目录
1. [整体架构](#整体架构)
2. [核心组件](#核心组件)
3. [认证流程](#认证流程)
4. [路由守卫](#路由守卫)
5. [状态管理](#状态管理)
6. [存储机制](#存储机制)
7. [错误处理](#错误处理)
8. [待改进点](#待改进点)

---

## 🏗️ 整体架构

认证系统采用 **前后端分离** 的架构：

```
┌─────────────────────────────────────────────────────────┐
│                    前端认证系统                           │
├─────────────────────────────────────────────────────────┤
│  1. 状态管理 (Zustand Store)                            │
│  2. 路由守卫 (TanStack Router)                          │
│  3. Cookie 存储 (浏览器 Cookie)                         │
│  4. 全局错误处理 (TanStack Query)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 核心组件

### 1. 认证状态管理 (`src/stores/auth-store.ts`)

使用 **Zustand** 管理全局认证状态。

#### 数据结构

```typescript
interface AuthUser {
  accountNo: string    // 账户编号
  email: string        // 用户邮箱
  role: string[]       // 用户角色数组（支持多角色）
  exp: number          // Token 过期时间戳
}

interface AuthState {
  auth: {
    user: AuthUser | null           // 用户信息
    accessToken: string             // 访问令牌
    setUser: (user) => void         // 设置用户信息
    setAccessToken: (token) => void // 设置访问令牌
    resetAccessToken: () => void    // 清除访问令牌
    reset: () => void               // 完全重置（清除所有状态）
  }
}
```

#### 关键特性

- ✅ **持久化存储**：`accessToken` 自动保存到 Cookie
- ✅ **初始化**：从 Cookie 读取 `accessToken` 恢复会话
- ✅ **响应式更新**：使用 Zustand hook 自动触发组件重新渲染

#### 方法说明

| 方法 | 功能 | 使用场景 |
|------|------|----------|
| `setUser(user)` | 设置用户信息 | 登录成功后 |
| `setAccessToken(token)` | 设置并保存 Token | 登录成功后 |
| `resetAccessToken()` | 仅清除 Token | 需要重新登录但保留用户信息 |
| `reset()` | 完全清除所有状态 | 登出时 |

---

### 2. Cookie 存储 (`src/lib/cookies.ts`)

#### 存储规范

- **存储位置**：浏览器 Cookie
- **Cookie 名称**：`thisisjustarandomstring`（当前为硬编码，待改进）
- **默认过期时间**：7 天
- **路径**：`/`（全站可用）

#### 为什么使用 Cookie？

根据项目文档要求：
- ✅ 支持跨窗口/标签页共享
- ✅ 浏览器关闭后可能丢失（更安全）
- ✅ 自动随请求发送（便于后端验证）

#### Cookie 操作

```typescript
// 读取
const token = getCookie(ACCESS_TOKEN)

// 写入（自动序列化为 JSON）
setCookie(ACCESS_TOKEN, JSON.stringify(token))

// 删除
removeCookie(ACCESS_TOKEN)
```

---

### 3. 路由守卫 (`src/routes/_authenticated/route.tsx`)

使用 TanStack Router 的 `beforeLoad` 钩子实现路由守卫。

#### 守卫逻辑

```typescript
beforeLoad: ({ location }) => {
  const { auth } = useAuthStore.getState()
  
  if (!auth.accessToken) {
    // 未登录用户访问根路径 /，允许通过（显示 Landing）
    if (location.pathname === '/') {
      return  // 不重定向
    }
    // 未登录访问其他受保护路径，重定向到登录页
    throw redirect({
      to: '/login',
      search: { redirect: location.href }, // 保存原始路径
      replace: true
    })
  }
}
```

#### 组件渲染逻辑

```typescript
component: () => {
  const { auth } = useAuthStore() // 使用 hook 确保响应式
  
  if (!auth.accessToken) {
    return <Outlet /> // 未登录：直接渲染子路由（不显示 Layout）
  }
  return <AuthenticatedLayout /> // 已登录：显示完整布局
}
```

#### 关键点

- ⚠️ **`beforeLoad` 使用 `getState()`**：同步检查，不触发重新渲染
- ✅ **`component` 使用 `useAuthStore()` hook**：响应式更新，状态变化时自动重新渲染

---

### 4. 根路由处理 (`src/routes/_authenticated/index.tsx`)

处理根路径 `/` 的显示逻辑。

```typescript
component: () => {
  const { auth } = useAuthStore()
  
  if (!auth.accessToken) {
    return <Landing />  // 未登录：显示 Landing 页面
  }
  return <Dashboard /> // 已登录：显示 Dashboard
}
```

---

## 🔄 认证流程

### 登录流程

```
1. 用户输入邮箱和密码
   ↓
2. 提交表单 (login.tsx)
   ↓
3. 调用 API（当前为 Mock）
   ↓
4. 登录成功：
   - auth.setUser(mockUser)      // 设置用户信息
   - auth.setAccessToken('token') // 设置并保存 Token 到 Cookie
   ↓
5. 跳转到目标页面：
   - 如果有 redirect 参数 → 跳转到原始页面
   - 否则 → 跳转到 /
   ↓
6. 路由守卫检查：
   - 有 Token → 显示 Dashboard
   - 无 Token → 显示 Landing
```

### 登出流程

```
1. 用户点击 Logout (header.tsx)
   ↓
2. auth.reset() 清除状态：
   - 清除 user
   - 清除 accessToken
   - 删除 Cookie
   ↓
3. 跳转到 /login
   ↓
4. 如果用户访问 /：
   - 路由守卫检查到无 Token
   - 显示 Landing 页面
```

### 会话过期处理

```
1. API 返回 401 错误 (main.tsx)
   ↓
2. TanStack Query 全局错误处理：
   - 显示 "Session expired!" 提示
   - auth.reset() 清除状态
   - 跳转到 /login?redirect=当前路径
   ↓
3. 用户重新登录后自动返回原页面
```

---

## 🛡️ 路由守卫

### 受保护的路由

所有 `/_authenticated/*` 路径下的路由都需要认证：

- `/` → Dashboard（已登录）或 Landing（未登录）
- `/users` → 用户管理
- `/settings/*` → 设置页面
- `/tasks` → 任务管理
- 等等...

### 公开路由

以下路由不需要认证：

- `/login` → 登录页面
- `/forgot-password` → 忘记密码
- `/sign-up` → 注册页面
- `/(errors)/*` → 错误页面

### 守卫策略

| 场景 | 行为 |
|------|------|
| 未登录访问 `/` | ✅ 允许，显示 Landing |
| 未登录访问 `/users` | ❌ 重定向到 `/login?redirect=/users` |
| 已登录访问 `/` | ✅ 显示 Dashboard |
| 已登录访问 `/users` | ✅ 正常显示 |

---

## 💾 状态管理

### Zustand Store 的优势

1. **轻量级**：比 Redux 简单，无需样板代码
2. **TypeScript 支持**：完整的类型推断
3. **响应式**：使用 hook 自动更新组件
4. **持久化**：可配合 Cookie 实现状态持久化

### 状态更新时机

| 操作 | 触发时机 | 状态变化 |
|------|----------|----------|
| 登录 | `setUser()` + `setAccessToken()` | `user` 和 `accessToken` 更新 |
| 登出 | `reset()` | `user` 和 `accessToken` 清空 |
| 刷新页面 | Store 初始化 | 从 Cookie 恢复 `accessToken` |

### 响应式更新

```typescript
// ❌ 错误：不会触发重新渲染
const { auth } = useAuthStore.getState()

// ✅ 正确：状态变化时自动重新渲染
const { auth } = useAuthStore()
```

---

## 🗄️ 存储机制

### Cookie 存储格式

```javascript
// 存储的 Cookie
document.cookie = "thisisjustarandomstring={\"token\":\"xxx\"}; path=/; max-age=604800"

// 读取时
const cookieValue = getCookie('thisisjustarandomstring')
const token = JSON.parse(cookieValue) // 解析 JSON
```

### 存储内容

- ✅ **accessToken**：访问令牌（JWT），存储在 Cookie 中，格式：`{siteToken}_jwt`（如 `audi_jwt`）
- ✅ **语言偏好**：存储在 Cookie 中，键名：`lang`
- ❌ **user 信息**：不存储在 Cookie（仅内存，通过 `sessionGetCurrent()` 获取）

### 安全性考虑

✅ **已实现**：
- Cookie 名称通过环境变量配置（`VITE_SITE_TOKEN`）
- 支持多站点独立 Cookie（`audi_jwt`, `vw_jwt` 等）

⚠️ **待改进**：
- 未设置 `HttpOnly`（JavaScript 可访问，但前端需要读取）
- 未设置 `Secure`（HTTPS 下才传输，生产环境需要）
- 未设置 `SameSite`（CSRF 防护，建议设置为 `Lax` 或 `Strict`）

✅ **改进建议**：
- 生产环境启用 `Secure` 和 `SameSite`
- 考虑使用后端设置的 `HttpOnly` Cookie（需要后端配合）

---

## ⚠️ 错误处理

### 全局错误处理 (`src/main.tsx`)

TanStack Query 的 `queryCache.onError` 处理所有 API 错误：

```typescript
queryCache: new QueryCache({
  onError: (error) => {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        // 会话过期
        toast.error('Session expired!')
        useAuthStore.getState().auth.reset()
        router.navigate({ to: '/login', search: { redirect } })
      }
      if (error.response?.status === 500) {
        // 服务器错误
        toast.error('Internal Server Error!')
        if (import.meta.env.PROD) {
          router.navigate({ to: '/500' })
        }
      }
      if (error.response?.status === 403) {
        // 权限不足（当前未处理）
      }
    }
  }
})
```

### 错误类型

| HTTP 状态码 | 处理方式 | 用户提示 |
|------------|----------|----------|
| 401 | 清除状态，跳转登录 | "Session expired!" |
| 403 | 未处理 | - |
| 500 | 跳转错误页（生产环境） | "Internal Server Error!" |

---

## 🔮 待改进点

### 1. Cookie 配置 ✅ 已实现

```typescript
// ✅ 已改进：使用环境变量和站点标识
import { getJwtCookieName } from '@/config/site'
const cookieName = getJwtCookieName() // 格式：{siteToken}_jwt
```

### 2. 多站点支持 ✅ 已实现

根据文档，已支持 4 个站点，每个站点使用不同的 Cookie 名称：

```typescript
// ✅ 已实现：根据站点标识动态设置 Cookie 名称
// src/config/site.ts
export function getJwtCookieName(): string {
  const siteToken = getSiteToken() // 从 VITE_SITE_TOKEN 读取
  return `${siteToken}_jwt` // 例如：audi_jwt, vw_jwt, audica_jwt, vwca_jwt
}
```

**环境变量配置**：
```bash
# .env
VITE_SITE_TOKEN=audi  # 可选值：audi, vw, audica, vwca
```

### 3. API 集成

当前为 Mock 登录，需要集成真实 API：

```typescript
// ❌ 当前：Mock
await new Promise((resolve) => setTimeout(resolve, 1000))
auth.setAccessToken('mock-token')

// ✅ 改进：真实 API
const response = await AuthenticationApi.sessionCreate({ email, password })
auth.setAccessToken(response.data.jwt)
auth.setUser(response.data.user)
```

### 4. Token 验证

当前没有验证 Token 是否过期：

```typescript
// ✅ 改进：添加 Token 验证
const isTokenValid = (token: string) => {
  try {
    const decoded = jwt.decode(token)
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
```

### 5. 会话检查 ⚠️ 待实现

根据文档，需要调用 `sessionGetCurrent()` 验证会话：

```typescript
// ⚠️ 待实现：在路由守卫中验证会话
beforeLoad: async () => {
  const { auth } = useAuthStore.getState()
  
  // 如果 Cookie 中有 Token，但 React State 中没有，尝试验证会话
  if (!auth.accessToken) {
    try {
      // 调用 API 获取当前会话
      const session = await AuthenticationApi.sessionGetCurrent()
      // 如果成功，说明有有效会话，更新状态
      auth.setUser(session.data.user)
      auth.setAccessToken(session.data.jwt)
    } catch (error) {
      // 404 表示未登录，清除可能存在的无效 Cookie
      if (error.response?.status === 404) {
        auth.reset()
        throw redirect({ to: '/login' })
      }
      // 其他错误（如 401）也清除状态
      if (error.response?.status === 401) {
        auth.reset()
        throw redirect({ to: '/login' })
      }
    }
  }
}
```

**说明**：
- `sessionGetCurrent()` 返回 404 → 未登录
- `sessionGetCurrent()` 返回 200 → 有有效会话，更新状态
- `sessionGetCurrent()` 返回 401 → Token 无效，清除状态

---

## 📝 总结

### 当前实现

✅ **已完成**：
- Zustand 状态管理
- Cookie 持久化存储（支持多站点）
- 路由守卫机制
- 全局错误处理
- 响应式状态更新
- 动态 Cookie 名称（`{siteToken}_jwt`）✅
- 语言偏好存储（Cookie）✅

⚠️ **待改进**：
- 真实 API 集成（`sessionGetCurrent()`）
- Token 验证（JWT 过期检查）
- 会话检查（路由守卫中调用 API）
- Cookie 安全属性（`Secure`, `SameSite`）

### 最佳实践

1. ✅ 使用 hook 而不是 `getState()` 获取状态
2. ✅ 在 `beforeLoad` 中使用 `getState()`（同步检查）
3. ✅ 在 `component` 中使用 hook（响应式更新）
4. ✅ 登出时调用 `reset()` 清除所有状态
5. ✅ 保存 `redirect` 参数以便登录后返回

---

## 🔗 相关文件

- `src/stores/auth-store.ts` - 认证状态管理
- `src/lib/cookies.ts` - Cookie 工具函数
- `src/config/site.ts` - 站点配置（Cookie 名称生成）
- `src/routes/_authenticated/route.tsx` - 路由守卫
- `src/routes/_authenticated/index.tsx` - 根路由处理
- `src/features/auth/login.tsx` - 登录页面
- `src/components/layout/header.tsx` - Header（包含登出逻辑）
- `src/components/sign-out-dialog.tsx` - 登出确认对话框
- `src/components/LanguageDropdown.tsx` - 语言选择（Cookie 存储）
- `src/main.tsx` - 全局错误处理
- `.env.example` - 环境变量示例

