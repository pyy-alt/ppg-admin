# 浏览器存储规范实现详解

## 📋 目录
1. [客户规范要求](#客户规范要求)
2. [实现方案](#实现方案)
3. [代码详解](#代码详解)
4. [工作流程](#工作流程)
5. [配置说明](#配置说明)
6. [使用示例](#使用示例)
7. [常见问题](#常见问题)

---

## 📝 客户规范要求

根据客户文档，浏览器存储规范如下：

| 存储方式 | 用途 | 说明 |
|----------|------|------|
| **LocalStorage** | 禁止使用 | 数据在浏览器关闭后仍保留 |
| **Cookie** | 推荐使用 | 数据在浏览器关闭后可能丢失，但支持跨窗口/标签页共享 |
| | **Web App** | 存储用户选择的语言 |
| | **API App** | 存储当前登录用户的 JWT（对应 React State 中的 Session 对象），格式为：`xxx_jwt`（`xxx` 为站点标识，如 `audi_jwt`） |
| **SessionStorage** | 禁止使用 | 每个标签页独立，刷新保留，关闭丢失 |
| **React State** | 推荐使用 | 数据刷新即丢失 |
| | 存储 Session 对象 | 通过 `AuthenticationApi::sessionGetCurrent()` 获取。若返回 404，表示未登录 |

---

## 🎯 实现方案

### 核心设计思路

1. **多站点支持**：通过环境变量 `VITE_SITE_TOKEN` 动态生成 Cookie 名称
2. **统一管理**：创建 `src/config/site.ts` 集中管理站点配置
3. **规范存储**：JWT 存储在 Cookie 中，格式为 `{siteToken}_jwt`
4. **语言偏好**：存储在 Cookie 中，键名为 `lang`

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    存储架构                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐            │
│  │ 环境变量      │         │ 站点配置      │            │
│  │ VITE_SITE_   │ ──────> │ site.ts      │            │
│  │ TOKEN=audi   │         │              │            │
│  └──────────────┘         └──────────────┘            │
│                                │                        │
│                                │ 生成 Cookie 名称       │
│                                ▼                        │
│  ┌──────────────────────────────────────┐            │
│  │  Cookie 存储                          │            │
│  │  ┌─────────────┐  ┌─────────────┐   │            │
│  │  │ audi_jwt    │  │ lang        │   │            │
│  │  │ (JWT Token) │  │ (语言偏好)   │   │            │
│  │  └─────────────┘  └─────────────┘   │            │
│  └──────────────────────────────────────┘            │
│                                │                        │
│                                │ 读取/写入              │
│                                ▼                        │
│  ┌──────────────────────────────────────┐            │
│  │  React State (Zustand)               │            │
│  │  ┌─────────────┐  ┌─────────────┐   │            │
│  │  │ user        │  │ accessToken │   │            │
│  │  │ (Session)   │  │ (JWT)       │   │            │
│  │  └─────────────┘  └─────────────┘   │            │
│  └──────────────────────────────────────┘            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 代码详解

### 1. 站点配置 (`src/config/site.ts`)

这是新增的核心配置文件，负责管理站点相关的配置。

```typescript
/**
 * 站点配置
 * 根据环境变量获取当前站点标识
 */

/**
 * 获取站点标识 (Site Token)
 * 从环境变量 VITE_SITE_TOKEN 读取，默认为 'audi'
 */
export function getSiteToken(): string {
  return import.meta.env.VITE_SITE_TOKEN || 'audi'
}
```

**工作原理**：
- 使用 Vite 的环境变量系统 `import.meta.env`
- 如果未设置环境变量，默认使用 `'audi'`
- 支持的值：`audi`, `vw`, `audica`, `vwca`

```typescript
/**
 * 获取 JWT Cookie 名称
 * 格式：{siteToken}_jwt
 * 例如：audi_jwt, vw_jwt, audica_jwt, vwca_jwt
 */
export function getJwtCookieName(): string {
  const siteToken = getSiteToken()
  return `${siteToken}_jwt`
}
```

**工作原理**：
- 动态生成 Cookie 名称
- 格式：`{siteToken}_jwt`
- 示例：
  - `VITE_SITE_TOKEN=audi` → Cookie 名称：`audi_jwt`
  - `VITE_SITE_TOKEN=vw` → Cookie 名称：`vw_jwt`

```typescript
/**
 * 获取语言 Cookie 名称
 */
export function getLanguageCookieName(): string {
  return 'lang'
}
```

**说明**：
- 语言偏好使用固定的 Cookie 名称 `lang`
- 所有站点共享同一个语言偏好（如果需要站点独立，可以改为 `${siteToken}_lang`）

---

### 2. 认证状态管理 (`src/stores/auth-store.ts`)

#### 改进前 vs 改进后

**改进前**：
```typescript
const ACCESS_TOKEN = 'thisisjustarandomstring'  // ❌ 硬编码

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)  // ❌ 固定名称
  // ...
})
```

**改进后**：
```typescript
import { getJwtCookieName } from '@/config/site'

// 动态获取 JWT Cookie 名称（格式：xxx_jwt，如 audi_jwt）
const getAccessTokenCookieName = () => getJwtCookieName()

export const useAuthStore = create<AuthState>()((set) => {
  // 动态获取 Cookie 名称
  const cookieName = getAccessTokenCookieName()  // ✅ 动态名称
  const cookieState = getCookie(cookieName)
  // ...
})
```

#### 详细解析

**初始化阶段**：
```typescript
export const useAuthStore = create<AuthState>()((set) => {
  // 1. 动态获取 Cookie 名称
  const cookieName = getAccessTokenCookieName()
  //   例如：如果 VITE_SITE_TOKEN=audi，则 cookieName = 'audi_jwt'
  
  // 2. 从 Cookie 读取 Token
  const cookieState = getCookie(cookieName)
  //   如果 Cookie 存在，读取值；否则返回 undefined
  
  // 3. 解析 Token（Cookie 中存储的是 JSON 字符串）
  const initToken = cookieState ? JSON.parse(cookieState) : ''
  //   如果 Cookie 存在，解析 JSON；否则使用空字符串
  
  return {
    auth: {
      accessToken: initToken,  // 初始化 Token
      // ...
    }
  }
})
```

**设置 Token 时**：
```typescript
setAccessToken: (accessToken) =>
  set((state) => {
    // 1. 动态获取 Cookie 名称
    const cookieName = getAccessTokenCookieName()
    
    // 2. 将 Token 序列化为 JSON 并保存到 Cookie
    setCookie(cookieName, JSON.stringify(accessToken))
    //   例如：setCookie('audi_jwt', '{"token":"xxx"}')
    
    // 3. 更新 React State
    return { ...state, auth: { ...state.auth, accessToken } }
  })
```

**清除 Token 时**：
```typescript
reset: () =>
  set((state) => {
    // 1. 动态获取 Cookie 名称
    const cookieName = getAccessTokenCookieName()
    
    // 2. 删除 Cookie
    removeCookie(cookieName)
    //   例如：removeCookie('audi_jwt')
    
    // 3. 清除 React State
    return {
      ...state,
      auth: { ...state.auth, user: null, accessToken: '' },
    }
  })
```

---

### 3. 语言偏好存储 (`src/components/LanguageDropdown.tsx`)

#### 改进前 vs 改进后

**改进前**：
```typescript
const handleSelect = (code: string) => {
  setSelected(code)
  // ❌ 直接使用 document.cookie，不规范
  document.cookie = `lang=${code}; path=/; max-age=31536000`
}
```

**改进后**：
```typescript
import { getCookie, setCookie } from '@/lib/cookies'
import { getLanguageCookieName } from '@/config/site'

export function LanguageDropdown() {
  // 1. 从 Cookie 读取语言偏好
  const cookieName = getLanguageCookieName()  // 'lang'
  const savedLang = getCookie(cookieName) || 'en'
  const [selected, setSelected] = useState(savedLang)

  // 2. 初始化时从 Cookie 读取
  useEffect(() => {
    const savedLang = getCookie(cookieName) || 'en'
    setSelected(savedLang)
  }, [cookieName])

  // 3. 选择语言时保存到 Cookie
  const handleSelect = (code: string) => {
    setSelected(code)
    // ✅ 使用统一的 Cookie 工具函数
    const oneYear = 60 * 60 * 24 * 365
    setCookie(cookieName, code, oneYear)
  }
}
```

#### 详细解析

**初始化流程**：
```typescript
// 1. 获取 Cookie 名称
const cookieName = getLanguageCookieName()  // 返回 'lang'

// 2. 从 Cookie 读取保存的语言偏好
const savedLang = getCookie(cookieName) || 'en'
//   如果 Cookie 中有值，使用该值；否则默认 'en'

// 3. 初始化 React State
const [selected, setSelected] = useState(savedLang)
```

**保存语言偏好**：
```typescript
const handleSelect = (code: string) => {
  // 1. 更新 React State（立即更新 UI）
  setSelected(code)
  
  // 2. 计算过期时间（1年）
  const oneYear = 60 * 60 * 24 * 365  // 秒数
  
  // 3. 保存到 Cookie
  setCookie(cookieName, code, oneYear)
  //   例如：setCookie('lang', 'fr-CA', 31536000)
  //   结果：document.cookie = 'lang=fr-CA; path=/; max-age=31536000'
}
```

---

## 🔄 工作流程

### JWT Token 存储流程

```
1. 用户登录
   ↓
2. 调用 API 获取 JWT Token
   ↓
3. auth.setAccessToken(token)
   ↓
4. 动态获取 Cookie 名称
   - getSiteToken() → 'audi' (从环境变量)
   - getJwtCookieName() → 'audi_jwt'
   ↓
5. 保存到 Cookie
   - setCookie('audi_jwt', JSON.stringify(token))
   - Cookie: audi_jwt={"token":"xxx"}
   ↓
6. 更新 React State
   - auth.accessToken = token
```

### 页面刷新恢复流程

```
1. 页面刷新
   ↓
2. Zustand Store 初始化
   ↓
3. 动态获取 Cookie 名称
   - getSiteToken() → 'audi'
   - getJwtCookieName() → 'audi_jwt'
   ↓
4. 从 Cookie 读取 Token
   - getCookie('audi_jwt') → '{"token":"xxx"}'
   ↓
5. 解析 Token
   - JSON.parse('{"token":"xxx"}') → {token: "xxx"}
   ↓
6. 初始化 React State
   - auth.accessToken = {token: "xxx"}
   ↓
7. 用户保持登录状态 ✅
```

### 语言偏好存储流程

```
1. 用户选择语言（如 'fr-CA'）
   ↓
2. handleSelect('fr-CA')
   ↓
3. 更新 React State
   - setSelected('fr-CA')
   ↓
4. 保存到 Cookie
   - setCookie('lang', 'fr-CA', 31536000)
   - Cookie: lang=fr-CA
   ↓
5. 下次访问时自动恢复
   - getCookie('lang') → 'fr-CA'
   - setSelected('fr-CA')
```

---

## ⚙️ 配置说明

### 环境变量配置

创建 `.env` 文件（项目根目录）：

```bash
# 站点标识 (Site Token)
# 可选值：audi, vw, audica, vwca
VITE_SITE_TOKEN=audi

# API 基础地址
VITE_API_BASE_URL=https://audi-api.ppg.dev.quasidea.com
```

### 不同站点的配置

**Audi US** (`.env`):
```bash
VITE_SITE_TOKEN=audi
```
- Cookie 名称：`audi_jwt`

**VW US** (`.env`):
```bash
VITE_SITE_TOKEN=vw
```
- Cookie 名称：`vw_jwt`

**Audi Canada** (`.env`):
```bash
VITE_SITE_TOKEN=audica
```
- Cookie 名称：`audica_jwt`

**VW Canada** (`.env`):
```bash
VITE_SITE_TOKEN=vwca
```
- Cookie 名称：`vwca_jwt`

### 开发环境配置

在开发时，可以通过不同的 `.env` 文件来测试不同站点：

```bash
# .env.development.audi
VITE_SITE_TOKEN=audi

# .env.development.vw
VITE_SITE_TOKEN=vw
```

---

## 📖 使用示例

### 示例 1：获取当前站点的 JWT Cookie 名称

```typescript
import { getJwtCookieName } from '@/config/site'

// 如果 VITE_SITE_TOKEN=audi
const cookieName = getJwtCookieName()
console.log(cookieName)  // 输出：'audi_jwt'

// 如果 VITE_SITE_TOKEN=vw
const cookieName = getJwtCookieName()
console.log(cookieName)  // 输出：'vw_jwt'
```

### 示例 2：在组件中使用认证状态

```typescript
import { useAuthStore } from '@/stores/auth-store'

function MyComponent() {
  // 使用 hook 获取认证状态（响应式）
  const { auth } = useAuthStore()
  
  // 检查是否已登录
  if (auth.accessToken) {
    return <div>已登录：{auth.user?.email}</div>
  }
  
  return <div>未登录</div>
}
```

### 示例 3：手动设置 Token

```typescript
import { useAuthStore } from '@/stores/auth-store'

function LoginComponent() {
  const { auth } = useAuthStore()
  
  const handleLogin = async () => {
    // 1. 调用 API 登录
    const response = await api.login({ email, password })
    
    // 2. 设置用户信息
    auth.setUser(response.data.user)
    
    // 3. 设置 Token（自动保存到 Cookie）
    auth.setAccessToken(response.data.jwt)
    // Cookie 名称会根据 VITE_SITE_TOKEN 自动生成
    // 例如：audi_jwt, vw_jwt 等
  }
}
```

### 示例 4：登出

```typescript
import { useAuthStore } from '@/stores/auth-store'

function LogoutButton() {
  const { auth } = useAuthStore()
  
  const handleLogout = () => {
    // 清除所有认证状态（包括 Cookie）
    auth.reset()
    // 这会：
    // 1. 删除 Cookie（例如：audi_jwt）
    // 2. 清除 React State 中的 user 和 accessToken
  }
}
```

### 示例 5：读取语言偏好

```typescript
import { getCookie } from '@/lib/cookies'
import { getLanguageCookieName } from '@/config/site'

function getCurrentLanguage(): string {
  const cookieName = getLanguageCookieName()  // 'lang'
  return getCookie(cookieName) || 'en'  // 默认 'en'
}

// 使用
const lang = getCurrentLanguage()
console.log(lang)  // 输出：'en' 或 'fr-CA'
```

---

## ❓ 常见问题

### Q1: 为什么使用 Cookie 而不是 LocalStorage？

**A**: 根据客户规范：
- ✅ Cookie 支持跨窗口/标签页共享
- ✅ Cookie 在浏览器关闭后可能丢失（更安全）
- ❌ LocalStorage 在浏览器关闭后仍保留（禁止使用）

### Q2: 为什么 JWT Cookie 名称是动态的？

**A**: 支持多站点部署：
- 同一套代码可以部署为 4 个不同的站点
- 每个站点需要独立的 Cookie，避免冲突
- 格式：`{siteToken}_jwt`（如 `audi_jwt`, `vw_jwt`）

### Q3: 如何切换站点？

**A**: 修改环境变量：
```bash
# 修改 .env 文件
VITE_SITE_TOKEN=vw  # 从 audi 改为 vw

# 重启开发服务器
npm run dev
```

### Q4: Cookie 存储的是什么格式？

**A**: JSON 字符串：
```javascript
// Cookie 中存储
audi_jwt='{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'

// 读取时解析
const cookieValue = getCookie('audi_jwt')
const token = JSON.parse(cookieValue)  // {token: "..."}
```

### Q5: 语言偏好存储在哪里？

**A**: Cookie 中，键名固定为 `lang`：
```javascript
// Cookie
lang=fr-CA

// 所有站点共享同一个语言偏好
```

### Q6: 如何验证会话是否有效？

**A**: 根据文档，需要调用 `AuthenticationApi::sessionGetCurrent()`：
```typescript
// ⚠️ 待实现
try {
  const session = await AuthenticationApi.sessionGetCurrent()
  // 200: 有有效会话
  auth.setUser(session.data.user)
  auth.setAccessToken(session.data.jwt)
} catch (error) {
  // 404: 未登录
  if (error.response?.status === 404) {
    auth.reset()
  }
}
```

### Q7: 为什么 Token 要序列化为 JSON？

**A**: Cookie 只能存储字符串，而 Token 可能是对象：
```typescript
// 如果 Token 是对象
const token = { jwt: 'xxx', refreshToken: 'yyy' }

// 必须序列化
setCookie('audi_jwt', JSON.stringify(token))

// 读取时解析
const cookieValue = getCookie('audi_jwt')
const token = JSON.parse(cookieValue)  // {jwt: 'xxx', refreshToken: 'yyy'}
```

---

## 🔍 调试技巧

### 查看当前 Cookie

在浏览器控制台：
```javascript
// 查看所有 Cookie
document.cookie

// 查看特定 Cookie
document.cookie.split(';').find(c => c.includes('audi_jwt'))
```

### 查看环境变量

```typescript
// 在代码中
console.log(import.meta.env.VITE_SITE_TOKEN)

// 在浏览器控制台（Vite 会替换为实际值）
// 注意：VITE_ 开头的变量才会暴露给客户端
```

### 清除 Cookie

```javascript
// 在浏览器控制台
document.cookie = 'audi_jwt=; path=/; max-age=0'
document.cookie = 'lang=; path=/; max-age=0'
```

---

## 📚 相关文档

- [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) - 认证系统详细说明
- [LOGIN_LOGIC.md](./LOGIN_LOGIC.md) - 登录逻辑说明
- [TOKEN_STORAGE_FLOW.md](./TOKEN_STORAGE_FLOW.md) - Token 存储流程详解
- [../docs.md](../docs.md) - 项目文档（客户规范）

---

## ✅ 总结

### 已实现的功能

1. ✅ **动态 Cookie 名称**：根据站点标识生成（`{siteToken}_jwt`）
2. ✅ **多站点支持**：通过环境变量配置不同站点
3. ✅ **语言偏好存储**：使用 Cookie 存储，统一管理
4. ✅ **规范存储**：符合客户规范（Cookie 存储 JWT 和语言）

### 待实现的功能

1. ⚠️ **会话验证**：调用 `sessionGetCurrent()` API
2. ⚠️ **Cookie 安全属性**：`Secure`, `SameSite`
3. ⚠️ **Token 验证**：JWT 过期检查

### 关键文件

- `src/config/site.ts` - 站点配置
- `src/stores/auth-store.ts` - 认证状态管理
- `src/components/LanguageDropdown.tsx` - 语言选择
- `src/lib/cookies.ts` - Cookie 工具函数

