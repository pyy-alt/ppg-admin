# Token 存储流程详解

## ✅ 是的，Token 会自动存储到 Cookie

无论 Token 来自 Mock 还是真实后端 API，只要调用 `auth.setAccessToken(token)`，**都会自动保存到 Cookie 中**。

---

## 🔄 完整流程

### 当前实现（Mock）

```typescript
// src/features/auth/login.tsx
const handleLogin = async () => {
  // 1. Mock API 调用
  await new Promise((resolve) => setTimeout(resolve, 1000))
  
  // 2. 设置用户信息（仅内存）
  auth.setUser(mockUser)
  
  // 3. 设置 Token（自动保存到 Cookie）
  auth.setAccessToken('mock-token')
  // 👆 这一步会自动调用 setCookie()
}
```

### 真实 API 调用（后续实现）

```typescript
// src/features/auth/login.tsx
const handleLogin = async () => {
  try {
    // 1. 调用真实后端 API
    const response = await AuthenticationApi.sessionCreate({
      email,
      password
    })
    
    // 2. 设置用户信息（从 API 返回）
    auth.setUser(response.data.user)
    
    // 3. 设置 Token（自动保存到 Cookie）
    auth.setAccessToken(response.data.jwt)
    // 👆 这一步会自动调用 setCookie()
    // Cookie 名称：{siteToken}_jwt（如 audi_jwt）
    
    // 4. 跳转
    navigate({ to: '/' })
  } catch (error) {
    toast.error('Login failed')
  }
}
```

---

## 🔍 内部实现原理

### `setAccessToken` 方法详解

```typescript
// src/stores/auth-store.ts
setAccessToken: (accessToken) =>
  set((state) => {
    // 1. 动态获取 Cookie 名称
    const cookieName = getAccessTokenCookieName()
    //    例如：如果 VITE_SITE_TOKEN=audi，则 cookieName = 'audi_jwt'
    
    // 2. 自动保存到 Cookie
    setCookie(cookieName, JSON.stringify(accessToken))
    //    例如：setCookie('audi_jwt', JSON.stringify('eyJhbGci...'))
    //    结果：document.cookie = 'audi_jwt="eyJhbGci..."; path=/; max-age=604800'
    
    // 3. 更新 React State
    return { ...state, auth: { ...state.auth, accessToken } }
  })
```

**关键点**：
- ✅ **自动保存**：调用 `setAccessToken` 时，无需手动操作 Cookie
- ✅ **动态名称**：Cookie 名称根据站点标识自动生成
- ✅ **JSON 序列化**：Token 会被序列化为 JSON 字符串存储

---

## 📋 不同场景的 Token 存储

### 场景 1：登录时

```typescript
// 用户登录
const response = await api.login({ email, password })

// Token 自动保存到 Cookie
auth.setAccessToken(response.data.jwt)
// Cookie: audi_jwt="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 场景 2：会话恢复时

```typescript
// 调用 sessionGetCurrent() 验证会话
const session = await AuthenticationApi.sessionGetCurrent()

// Token 自动保存到 Cookie（更新）
auth.setAccessToken(session.data.jwt)
// Cookie: audi_jwt="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."（更新）
```

### 场景 3：Token 刷新时

```typescript
// Token 过期，刷新 Token
const response = await api.refreshToken()

// 新 Token 自动保存到 Cookie（替换旧的）
auth.setAccessToken(response.data.newJwt)
// Cookie: audi_jwt="新的token..."（替换）
```

### 场景 4：登出时

```typescript
// 登出
auth.reset()
// 自动删除 Cookie
// Cookie: audi_jwt 被删除
```

---

## 🎯 实际使用示例

### 示例 1：登录页面（真实 API）

```typescript
// src/features/auth/login.tsx
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticationApi } from '@/api' // 假设的 API 客户端

export function Login() {
  const { auth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 1. 调用后端 API 登录
      const response = await AuthenticationApi.sessionCreate({
        email,
        password
      })
      
      // 2. 后端返回的数据结构（假设）
      // {
      //   data: {
      //     user: {
      //       accountNo: 'ACC001',
      //       email: 'user@example.com',
      //       role: ['user'],
      //       exp: 1234567890
      //     },
      //     jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      //   }
      // }
      
      // 3. 设置用户信息（仅内存，不存储到 Cookie）
      auth.setUser(response.data.user)
      
      // 4. 设置 Token（自动保存到 Cookie）
      auth.setAccessToken(response.data.jwt)
      // 👆 这一步会：
      //    - 获取 Cookie 名称（如 'audi_jwt'）
      //    - 将 Token 序列化为 JSON
      //    - 保存到 Cookie
      //    - 更新 React State
      
      // 5. 跳转到目标页面
      navigate({ to: '/' })
    } catch (error) {
      toast.error('Login failed')
    }
  }
}
```

### 示例 2：会话验证（路由守卫）

```typescript
// src/routes/_authenticated/route.tsx
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()
    
    // 如果 React State 中没有 Token，尝试验证会话
    if (!auth.accessToken) {
      try {
        // 调用 API 获取当前会话
        const session = await AuthenticationApi.sessionGetCurrent()
        
        // 如果成功，说明有有效会话
        // 设置用户信息
        auth.setUser(session.data.user)
        
        // 设置 Token（自动保存到 Cookie）
        auth.setAccessToken(session.data.jwt)
        // 👆 自动保存到 Cookie: audi_jwt="..."
        
      } catch (error) {
        // 404 表示未登录
        if (error.response?.status === 404) {
          auth.reset() // 清除可能存在的无效 Cookie
          throw redirect({ to: '/login' })
        }
      }
    }
  }
})
```

---

## 🔐 Cookie 存储详情

### Cookie 格式

```javascript
// Cookie 名称
audi_jwt  // 格式：{siteToken}_jwt

// Cookie 值（JSON 字符串）
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

// 完整 Cookie 字符串
audi_jwt="eyJhbGci..."; path=/; max-age=604800
```

### Cookie 属性

- **名称**：`{siteToken}_jwt`（如 `audi_jwt`）
- **值**：Token 的 JSON 字符串形式
- **路径**：`/`（全站可用）
- **过期时间**：7 天（`max-age=604800`）

---

## ⚠️ 注意事项

### 1. Token 格式

后端返回的 Token 可能是：
- **字符串**：`"eyJhbGci..."`
- **对象**：`{ jwt: "eyJhbGci...", refreshToken: "xxx" }`

当前实现会将其序列化为 JSON 存储：

```typescript
// 如果 Token 是字符串
auth.setAccessToken('eyJhbGci...')
// Cookie: audi_jwt='"eyJhbGci..."'

// 如果 Token 是对象
auth.setAccessToken({ jwt: 'eyJhbGci...', refreshToken: 'xxx' })
// Cookie: audi_jwt='{"jwt":"eyJhbGci...","refreshToken":"xxx"}'
```

### 2. 读取 Token

从 Cookie 读取时会自动解析：

```typescript
// Store 初始化时
const cookieState = getCookie('audi_jwt')
// 例如：'"eyJhbGci..."' 或 '{"jwt":"eyJhbGci..."}'

const initToken = cookieState ? JSON.parse(cookieState) : ''
// 解析后：'eyJhbGci...' 或 {jwt: 'eyJhbGci...', refreshToken: 'xxx'}
```

### 3. 多站点隔离

不同站点使用不同的 Cookie：

```javascript
// Audi US 站点
audi_jwt="token1..."

// VW US 站点
vw_jwt="token2..."

// 互不干扰 ✅
```

---

## 📊 流程图

```
┌─────────────────────────────────────────────────────────┐
│               Token 存储完整流程                         │
└─────────────────────────────────────────────────────────┘

1. 用户登录
   ↓
2. 调用后端 API
   AuthenticationApi.sessionCreate({ email, password })
   ↓
3. 后端返回 Token
   { data: { jwt: "eyJhbGci...", user: {...} } }
   ↓
4. 调用 auth.setAccessToken(response.data.jwt)
   ↓
5. 自动执行：
   ├─ 获取 Cookie 名称（如 'audi_jwt'）
   ├─ 序列化 Token（JSON.stringify）
   ├─ 保存到 Cookie（setCookie）
   └─ 更新 React State
   ↓
6. Cookie 已保存 ✅
   document.cookie = 'audi_jwt="eyJhbGci..."; path=/; max-age=604800'
   ↓
7. 页面刷新时自动恢复
   ├─ Store 初始化
   ├─ 读取 Cookie（getCookie）
   ├─ 解析 Token（JSON.parse）
   └─ 恢复登录状态 ✅
```

---

## ✅ 总结

### 关键点

1. ✅ **自动保存**：调用 `auth.setAccessToken(token)` 时，Token 会自动保存到 Cookie
2. ✅ **动态名称**：Cookie 名称根据站点标识自动生成（`{siteToken}_jwt`）
3. ✅ **无需手动操作**：不需要手动调用 `setCookie`，Store 会自动处理
4. ✅ **持久化**：Token 保存在 Cookie 中，页面刷新后自动恢复

### 使用方式

```typescript
// 无论 Token 来自哪里，使用方式都一样
const response = await api.login(...)
auth.setAccessToken(response.data.jwt)  // 自动保存到 Cookie ✅
```

### 相关文件

- `src/stores/auth-store.ts` - Token 存储逻辑
- `src/lib/cookies.ts` - Cookie 工具函数
- `src/config/site.ts` - Cookie 名称生成

