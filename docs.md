# 访问权限与说明

**当前时间**：2025 年 11 月 17 日 上午 08:08 (+08)  
**国家**：新加坡 (SG)

---

## 客户信息
**Client**：PPG

---

## Figma 文件
**视觉原型**：  
[https://www.figma.com/design/I8JqellhAS1OX5eYRCk65g/PPG-Parts-Tracker-Mockups?t=MAT1xwy9gjB9EMbb-1](https://www.figma.com/design/I8JqellhAS1OX5eYRCk65g/PPG-Parts-Tracker-Mockups?t=MAT1xwy9gjB9EMbb-1)

---

## Trello 看板
**内部看板**：  
[https://trello.com/b/s02XRgx4/ppg-audi-vehicle-tracker-internal](https://trello.com/b/s02XRgx4/ppg-audi-vehicle-tracker-internal)

---

## 开发说明

### 通用说明

项目包含 **两个 Git 仓库**：

- **后端 API**  
  `git@git.quasidea.com:ppg-api`

- **基于 React 的前端**  
  `git@git.quasidea.com:ppg-web`

**Swagger 定义了后端 API**，用于服务本项目：

- **原始 Swagger 文件**：  
  [https://audi-api.ppg.dev.quasidea.com/ppg/swagger](https://audi-api.ppg.dev.quasidea.com/ppg/swagger)

- **通过 Swagger-UI 查看**：  
  [https://petstore.swagger.io/?url=https://audi-api.ppg.dev.quasidea.com/ppg/swagger](https://petstore.swagger.io/?url=https://audi-api.ppg.dev.quasidea.com/ppg/swagger)

**前端通过 OAS Client React 调用后端 API**，接口地址为：  
`https://audi-api.ppg.dev.quasidea.com`

---

### 开发环境 - 程序管理员账户

**用户名/密码**：  
`jjarzembowski@ppg.com`  
`password`

---

### Docker 支持

前端应用支持 **Docker 运行**。`Dockerfile` 已包含在 Git 仓库中，可使用以下脚本：

| 脚本 | 功能 |
|------|------|
| `support/bash.sh` | 在 Docker 镜像中启动 `bash` 终端 |
| `support/build.sh` | 执行 `npm build` 构建应用 |
| `support/serve.sh` | 执行 `npm start`，在 `http://localhost:28102` 启动服务 |
| `support/codegen.sh` | 在 Docker 中运行 `npx oas-client codegen` 生成客户端代码 |

---

### 多站点部署

**仅一套代码库（前后端各一）**，但将部署为 **4 个完全独立的站点/租户**：

| 站点 | 开发环境前端 | 开发环境后端 | 生产环境前端 | 生产环境后端 | 站点标识 (Site Token) |
|------|-------------|-------------|-------------|-------------|-----------------------|
| **Audi US** | https://audi.ppg.dev.quasidea.com | https://audi-api.ppg.dev.quasidea.com | https://audi.restrictedpartstracker.com | https://audi-api.restrictedpartstracker.com | `audi` |
| **VW US** | 同上，`audi` 替换为 `vw` | 同上 | 同上 | 同上 | `vw` |
| **Audi Canada** | 同上，`audi` 替换为 `audica` | 同上 | 同上 | 同上 | `audica` |
| **VW Canada** | 同上，`audi` 替换为 `vwca` | 同上 | 同上 | 同上 | `vwca` |

**前端差异仅在于**：****

- 品牌 Logo
- 配色方案（通过 CSS 定义）
- 站点标识 (Site Token)

**建议**：使用 `.env` 配置文件判断当前运行的站点。

> **注意**：  
> **Screen 1.0 Restricted Parts Tracker Title Page** 为独立 HTML 文件。请将其放入前端项目中，**无需使用 React 实现**。

---

### 多语言支持

本应用支持 **多语言**，主要为：

- `en`（英语）
- `fr-CA`（加拿大法语）

#### 翻译类型

| 类型 | 说明 |
|------|------|
| **应用级翻译** | 所有界面文本（如“保存”、“取消”、“名字”、“姓氏”等）需放入独立 **Strings 文件**，支持动态获取翻译。 |
| **内容级翻译** | **无需支持**。用户输入内容按原样显示，不随语言变化。 |

**语言偏好存储**：  
- 保存于 **Cookie** 中。

---

### 浏览器存储规范

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

## 前端路由设计

以下为各页面的 **建议路由**：

| 页面 | 路由 | 重定向 / 会话说明 |
|------|------|------------------|
| **1.0 Restricted Parts Tracker Title Page** | 无（静态 HTML） | 纯静态 HTML 文件 |
| **1.1 品牌专属标题页** | `/` | 若已登录，根据用户角色重定向至 `/repair_orders` 或 `/parts_orders` |
| **1.2 登录页** | `/login` | 调用 `AuthenticationApi::sessionLogout()`<br>若通过 `redirect` 查询参数跳转，登录成功后返回原页面 |
| **登出** | `/logout` | 调用 `AuthenticationApi::sessionLogout()` 后重定向至 `/` |
| **1.2.1 忘记密码** | `/password/forgot` | 调用 `AuthenticationApi::sessionLogout()` |
| **1.2.2 重置密码** | `/password/reset/{id}/{guid}/{hash}` | 通过邮件链接跳转。调用 `AuthenticationApi::sessionCreate(id, guid, hash)` 创建会话 |
| **1.3 店铺注册** | `/registration/shop` | 调用 `AuthenticationApi::sessionLogout()` |
| **1.4 经销商注册** | `/registration/dealership` | 调用 `AuthenticationApi::sessionLogout()` |
| **1.5 注册确认（店铺 & 经销商）** | 无 | — |
| **1.6 注册完成（通用）** | `/registration/complete/{id}/{guid}/{hash}` | 通过邮件链接跳转。调用 `AuthenticationApi::sessionCreate(id, guid, hash)` 创建会话 |
| **2.0 侧边栏导航（管理员）** | 无 | — |
| **2.1 编辑个人资料** | 无 | — |
| **3.0 维修订单列表（店铺）** | `/repair_orders` | 未登录 → 重定向至 `/login` (*) |
| **3.0.1(M) 新建/编辑维修订单（店铺）** | 无 | — |
| **3.0.2(M) 新建/编辑零件订单/补充订单** | 无 | — |
| **3.1 零件跟踪器** | `/repair_order/{id}` | 未登录 → 重定向至 `/login` (*) |
| **3.1.1(M) 零件订单/补充订单已批准** | 无 | — |
| **3.1.2(M) 零件订单/补充订单已拒绝** | 无 | — |
| **3.1.3(M) 重新提交零件订单/补充订单** | 无 | — |
| **3.1.4(M) 标记维修完成** | 无 | — |
| **4.0 零件订单列表（除店铺外所有角色）** | `/parts_orders` | 未登录 → 重定向至 `/login` (*) |
| **5.0 管理店铺（仅管理员）** | `/admin/shops` | 未登录 → 重定向至 `/login` (*) |
| **5.0.1(M) 查看团队** | 无 | — |
| **6.0 管理经销商（管理员）** | `/admin/dealerships` | 未登录 → 重定向至 `/login` (*) |
| **7.0 管理网络用户（管理员）** | `/admin/users` | 未登录 → 重定向至 `/login` (*) |
| **7.0.1(M) 添加/编辑网络用户** | 无 | — |

---

> **(*) 未登录判断逻辑**：  
> 1. 检查 React State 中是否存在 Session 对象  
> 2. 若无，调用 `AuthenticationApi::sessionGetCurrent()`  
> 3. 若返回 404 → 未登录 → 重定向至 `/login?redirect=XXX`（XXX 为当前路由）

---
