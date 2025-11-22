# 认证系统文档

本文件夹包含所有与登录和认证相关的文档。

## 📚 文档列表

### 1. [AUTH_SYSTEM.md](./AUTH_SYSTEM.md)
**认证系统详细说明**

- 整体架构
- 核心组件（状态管理、路由守卫、Cookie 存储）
- 认证流程（登录、登出、会话过期）
- 路由守卫机制
- 错误处理
- 待改进点

### 2. [LOGIN_LOGIC.md](./LOGIN_LOGIC.md)
**登录逻辑说明**

- 当前登录逻辑分析
- Mock 登录实现
- 与真实 API 的对比
- 待集成功能

### 3. [STORAGE_SPEC_IMPLEMENTATION.md](./STORAGE_SPEC_IMPLEMENTATION.md)
**浏览器存储规范实现详解**

- 客户规范要求
- 实现方案（多站点支持、动态 Cookie 名称）
- 代码详解（站点配置、认证状态管理、语言偏好）
- 工作流程
- 配置说明
- 使用示例
- 常见问题

### 4. [TOKEN_STORAGE_FLOW.md](./TOKEN_STORAGE_FLOW.md)
**Token 存储流程详解**

- Token 自动存储到 Cookie 的机制
- 不同场景的 Token 存储（登录、会话恢复、Token 刷新、登出）
- 实际使用示例
- Cookie 存储详情
- 注意事项

## 🎯 快速导航

### 想了解认证系统整体架构？
→ 阅读 [AUTH_SYSTEM.md](./AUTH_SYSTEM.md)

### 想了解登录逻辑和 API 集成？
→ 阅读 [LOGIN_LOGIC.md](./LOGIN_LOGIC.md)

### 想了解存储规范和实现细节？
→ 阅读 [STORAGE_SPEC_IMPLEMENTATION.md](./STORAGE_SPEC_IMPLEMENTATION.md)

### 想了解 Token 如何存储到 Cookie？
→ 阅读 [TOKEN_STORAGE_FLOW.md](./TOKEN_STORAGE_FLOW.md)

## 📋 文档关系

```
AUTH_SYSTEM.md (整体架构)
    ├─ STORAGE_SPEC_IMPLEMENTATION.md (存储实现)
    ├─ TOKEN_STORAGE_FLOW.md (Token 存储)
    └─ LOGIN_LOGIC.md (登录逻辑)
```

## 🔗 相关代码文件

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

