# API 文档中文翻译

**生成时间**：2025 年 11 月 17 日 08:02 AM (+08)  
**国家**：新加坡 (SG)

---

## 认证模块 (Authentication)

| 模块 | URL 路径 | HTTP 方法 | 操作方法名 | 摘要 |
|------|----------|-----------|------------|------|
| authentication | `/authentication/login` | POST | `AuthenticationApi::login` | **登录系统**：将用户登录到系统中。 |
| authentication | `/authentication/logout` | GET | `AuthenticationApi::logout` | **登出系统**：将用户从系统中登出。 |
| authentication | `/authentication/forgot_password` | POST | `AuthenticationApi::forgotPassword` | **忘记密码**：尝试触发“忘记/重置密码”流程。如果电子邮件存在，将发送一封包含重置密码说明的邮件；否则不执行任何操作。无论哪种情况，均返回 200 状态码，以防止通过此接口逆向推断注册邮箱是否存在。 |
| authentication | `/authentication/update_password` | POST | `AuthenticationApi::updatePassword` | **更新密码**：更新用户密码。如果当前会话是通过注册或忘记密码发起的，则忽略 `currentPassword`；否则必须提供当前密码。 |
| authentication | `/authentication/session/create/{id}/{guid}/{hash}` | GET | `AuthenticationApi::sessionCreate` | **创建会话（通过邮件链接）**：基于邮件链接（例如密码重置或注册确认）创建并登录用户会话。 |
| authentication | `/authentication/session/current` | GET | `AuthenticationApi::sessionGetCurrent` | **获取当前会话**：获取已登录用户的当前会话信息；如果无有效会话，返回 401。 |
| authentication | `/authentication/registration/request/shop` | POST | `AuthenticationApi::registrationRequestShop` | **发起店铺用户注册请求**：为新店铺用户启动注册流程。 |
| authentication | `/authentication/registration/request/dealership` | POST | `AuthenticationApi::registrationRequestDealership` | **发起经销商用户注册请求**：为新经销商用户启动注册流程。 |
| authentication | `/authentication/registration/complete` | POST | `AuthenticationApi::registrationComplete` | **完成注册**：通过设置用户密码完成已批准的注册请求。必须在通过 `AuthenticationApi::sessionCreate()` 创建的会话中调用。 |

---

## 用户模块 (Person)

| 模块 | URL 路径 | HTTP 方法 | 操作方法名 | 摘要 |
|------|----------|-----------|------------|------|
| person | `/person/search` | POST | `PersonApi::search` | **搜索用户**：在系统中搜索人员记录。 |
| person | `/person/create_network_user` | POST | `PersonApi::createNetworkUser` | **[程序管理员] 创建网络用户**：创建 NETWORK 用户记录。ID 必须为 null。类型为必填，且必须为网络类型之一（Csr、ProgramAdministrator 或 FieldStaff）。 |
| person | `/person/edit` | POST | `PersonApi::edit` | **编辑用户**：编辑人员记录。ID 为必填。 |
| person | `/person/edit_status` | POST | `PersonApi::editStatus` | **[程序管理员] 更新用户状态**：更新人员状态（如激活、停用、批准注册）。 |

---

## 组织模块 (Organization)

| 模块 | URL 路径 | HTTP 方法 | 操作方法名 | 摘要 |
|------|----------|-----------|------------|------|
| organization | `/organization/search` | POST | `OrganizationApi::search` | **搜索组织**：在系统中搜索组织记录。 |
| organization | `/organization/shop/get/{id}` | GET | `OrganizationApi::shopGet` | **获取店铺组织**：获取指定 ID 的店铺组织记录。 |
| organization | `/organization/dealership/get/{id}` | GET | `OrganizationApi::dealershipGet` | **获取经销商组织**：获取指定 ID 的经销商组织记录。 |

---

## 订单模块 (Order)

| 模块 | URL 路径 | HTTP 方法 | 操作方法名 | 摘要 |
|------|----------|-----------|------------|------|
| order | `/order/repair_order/search` | POST | `OrderApi::repairOrderSearch` | **搜索维修订单**：搜索维修订单（RO）。店铺用户仅返回其所属店铺的订单。 |
| order | `/order/repair_order/get/{id}` | GET | `OrderApi::repairOrderGet` | **获取维修订单详情**：获取包含所有相关文件资产的维修订单记录。 |
| order | `/order/repair_order/save` | POST | `OrderApi::repairOrderSave` | **[店铺] 更新维修订单**：保存（更新）现有维修订单。ID 必填。仅限店铺用户，且 `shopId` 必须与其所属店铺匹配。`dealershipId` 必填。 |
| order | `/order/repair_order/create` | POST | `OrderApi::repairOrderCreate` | **[店铺] 创建维修订单**：保存（创建）新的维修订单。ID 必须为 NULL。`shopId` 必须与用户所属店铺匹配。`dealershipId` 必填。 |
| order | `/order/repair_order/complete` | POST | `OrderApi::repairOrderComplete` | **[店铺] 完成维修订单**：将维修订单标记为完成/关闭。仅店铺用户可对其订单执行此操作。`.id` 和 `.postRepairPhotoFileAssets` 必填，其他字段忽略。 |
| order | `/order/parts_order/search` | POST | `OrderApi::partsOrderSearch` | **搜索零件订单**：搜索零件订单。店铺用户仅返回其店铺订单；经销商用户仅返回其经销商订单；CSR/现场工作人员/程序管理员可跨所有搜索。 |
| order | `/order/parts_order/get/{id}` | GET | `OrderApi::partsOrderGet` | **获取零件订单详情**：获取包含活动日志和文件资产的完整零件订单详情。 |
| order | `/order/parts_order/get_all/{repair_order_id}` | GET | `OrderApi::partsOrderGetAllForRepairOrder` | **获取维修订单下的所有零件订单**：获取指定维修订单下的所有零件订单，包含完整活动日志和文件资产。 |
| order | `/order/parts_order/save` | POST | `OrderApi::partsOrderSave` | **[店铺、CSR、现场工作人员、程序管理员] 保存零件订单**：保存（创建或更新）零件订单。设置 `id` 进行更新，留空 `id` 进行创建。创建仅限店铺用户，且必须为其店铺的维修订单。更新权限取决于零件订单当前状态。**缺失详细说明** |
| order | `/order/parts_order/workflow_action` | POST | `OrderApi::partsOrderSubmitWorkflowAction` | **推进零件订单工作流**：通过工作流状态推进零件订单，执行特定状态操作（批准/拒绝、重新提交、发货/取消发货、接收/取消接收）。并创建活动日志条目。 |

---

## 文件资产模块 (File Asset)

| 模块 | URL 路径 | HTTP 方法 | 操作方法名 | 摘要 |
|------|----------|-----------|------------|------|
| fileAsset | `/file_asset/{type}/{file_asset_identifier}/{filename}` | GET | `FileAssetApi::get` | **查看文件资产**：**不应直接调用**，仅为 `FileAsset` 中的 `viewUrl` 提供占位支持。 |
| fileAsset | `/file_asset/download/{type}/{file_asset_identifier}/{filename}` | GET | `FileAssetApi::download` | **下载文件资产**：**不应直接调用**，仅为 `FileAsset` 中的 `downloadUrl` 提供占位支持。 |

---