# TanStack Router 路由配置指南

## 📍 路由配置位置

在 TanStack Router 中，**路由是基于文件系统的**，路由文件必须放在 `src/routes/` 目录下。

## 🗂️ 文件系统路由规则

### 基本规则

| 文件路径 | 路由路径 | 说明 |
|---------|---------|------|
| `src/routes/index.tsx` | `/` | 根路由 |
| `src/routes/login.tsx` | `/login` | 简单路由 |
| `src/routes/users/index.tsx` | `/users` | 索引路由 |
| `src/routes/users/$id.tsx` | `/users/:id` | 动态路由 |
| `src/routes/password/forgot.tsx` | `/password/forgot` | 嵌套路由 |

### 特殊文件夹

| 文件夹 | 说明 | 示例 |
|--------|------|------|
| `_authenticated/` | 受保护的路由组 | `src/routes/_authenticated/users.tsx` → `/users`（需要登录） |
| `(auth)/` | 路由组（不影响 URL） | `src/routes/(auth)/login.tsx` → `/login` |
| `(errors)/` | 错误页面组 | `src/routes/(errors)/404.tsx` → `/404` |

## 📝 创建新路由的步骤

### 步骤 1：创建组件

在 `src/features/` 或 `src/components/` 中创建组件：

```typescript
// src/features/auth/password/Forgot.tsx
export function Forgot() {
  return <div>Forgot Password</div>
}
```

### 步骤 2：创建路由文件

在 `src/routes/` 目录下创建对应的路由文件：

```typescript
// src/routes/password/forgot.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Forgot } from '@/features/auth/password/Forgot'

export const Route = createFileRoute('/password/forgot')({
  component: Forgot,
})
```

### 步骤 3：路由树自动生成

TanStack Router 的 Vite 插件会自动：
- 扫描 `src/routes/` 目录
- 生成 `src/routeTree.gen.ts`
- 注册新路由

**注意**：如果路由没有自动生成，重启开发服务器。

## 🎯 路由文件结构

### 基本路由

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { YourComponent } from '@/features/your-feature'

export const Route = createFileRoute('/your-path')({
  component: YourComponent,
})
```

### 带查询参数的路由

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  redirect: z.string().optional(),
  page: z.number().optional(),
})

export const Route = createFileRoute('/your-path')({
  component: YourComponent,
  validateSearch: searchSchema, // 验证查询参数
})
```

### 带动态参数的路由

```typescript
// src/routes/users/$id.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/$id')({
  component: ({ useParams }) => {
    const { id } = useParams()
    return <div>User ID: {id}</div>
  },
})
```

### 受保护的路由

```typescript
// src/routes/_authenticated/users.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/users')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    if (!auth.accessToken) {
      throw redirect({ to: '/login' })
    }
  },
  component: Users,
})
```

## 📂 目录结构示例

```
src/routes/
├── __root.tsx              # 根路由配置
├── index.tsx               # / (根路径)
├── (auth)/                 # 认证相关路由组
│   ├── login.tsx          # /login
│   ├── sign-up.tsx        # /sign-up
│   └── forgot-password.tsx # /forgot-password
├── password/               # 密码相关路由
│   ├── forgot.tsx         # /password/forgot
│   └── reset.tsx          # /password/reset (如果存在)
├── _authenticated/         # 需要登录的路由
│   ├── route.tsx          # 路由守卫
│   ├── index.tsx          # / (已登录)
│   ├── users/
│   │   └── index.tsx      # /users
│   └── settings/
│       └── account.tsx    # /settings/account
└── (errors)/               # 错误页面
    ├── 404.tsx            # /404
    └── 500.tsx            # /500
```

## 🔧 路由配置选项

### `beforeLoad`

在路由加载前执行，常用于：
- 权限检查
- 数据预加载
- 重定向

```typescript
export const Route = createFileRoute('/protected')({
  beforeLoad: async ({ location }) => {
    // 检查权限
    if (!hasPermission()) {
      throw redirect({ to: '/login' })
    }
    
    // 预加载数据
    await queryClient.prefetchQuery(...)
  },
  component: ProtectedComponent,
})
```

### `loader`

加载路由数据：

```typescript
export const Route = createFileRoute('/users')({
  loader: async () => {
    const users = await fetchUsers()
    return { users }
  },
  component: Users,
})
```

### `validateSearch`

验证查询参数：

```typescript
const searchSchema = z.object({
  page: z.number().min(1).default(1),
  search: z.string().optional(),
})

export const Route = createFileRoute('/users')({
  validateSearch: searchSchema,
  component: Users,
})
```

## 🚀 常见场景

### 场景 1：创建新页面路由

**目标**：创建 `/about` 页面

1. 创建组件：`src/features/about/index.tsx`
2. 创建路由：`src/routes/about.tsx`
3. 路由文件内容：
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { About } from '@/features/about'

export const Route = createFileRoute('/about')({
  component: About,
})
```

### 场景 2：创建嵌套路由

**目标**：创建 `/settings/profile` 页面

1. 创建组件：`src/features/settings/profile.tsx`
2. 创建路由：`src/routes/settings/profile.tsx`
3. 路由文件内容：
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { Profile } from '@/features/settings/profile'

export const Route = createFileRoute('/settings/profile')({
  component: Profile,
})
```

### 场景 3：创建动态路由

**目标**：创建 `/users/:id` 页面

1. 创建组件：`src/features/users/detail.tsx`
2. 创建路由：`src/routes/users/$id.tsx`（注意 `$` 前缀）
3. 路由文件内容：
```typescript
import { createFileRoute } from '@tanstack/react-router'
import { UserDetail } from '@/features/users/detail'

export const Route = createFileRoute('/users/$id')({
  component: UserDetail,
})
```

## ⚠️ 注意事项

### 1. 路由树自动生成

- 路由树文件 `src/routeTree.gen.ts` 是自动生成的
- **不要手动编辑**这个文件
- 如果路由没有出现，重启开发服务器

### 2. 路由路径必须匹配

```typescript
// ❌ 错误：路径不匹配
// 文件：src/routes/password/forgot.tsx
export const Route = createFileRoute('/forgot-password')({
  // 路径应该是 '/password/forgot'
})

// ✅ 正确
export const Route = createFileRoute('/password/forgot')({
  // 路径匹配文件位置
})
```

### 3. 路由组不影响 URL

```typescript
// (auth)/login.tsx → /login（不是 /auth/login）
// (errors)/404.tsx → /404（不是 /errors/404）
```

### 4. 受保护路由

所有 `_authenticated/` 下的路由都需要通过 `route.tsx` 的 `beforeLoad` 检查。

## 🔍 调试路由

### 查看路由树

```typescript
// 在浏览器控制台
import { routeTree } from './routeTree.gen'
console.log(routeTree)
```

### 检查路由是否注册

查看 `src/routeTree.gen.ts` 文件，搜索你的路由路径。

### 路由未生效？

1. 检查文件路径是否正确
2. 检查 `createFileRoute` 的路径参数
3. 重启开发服务器
4. 检查是否有语法错误

## 📚 相关文档

- [TanStack Router 官方文档](https://tanstack.com/router/latest)
- [文件系统路由](https://tanstack.com/router/latest/docs/framework/react/guide/file-based-routing)

