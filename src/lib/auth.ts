/**
 * 认证相关的工具函数
 * 用于全局获取和刷新用户数据
 */

import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import type Session from '@/js/models/Session'
import { useAuthStore } from '@/stores/auth-store'
import type { AuthStatus } from '@/stores/auth-store'

const authApi = new AuthenticationApi()

/**
 * 刷新当前用户数据
 * 调用 sessionGetCurrent API 获取最新的用户信息并更新到 store
 * 
 * @returns Promise<void>
 */
export async function refreshUserData(): Promise<void> {
  const { auth } = useAuthStore.getState()

  return new Promise((resolve, reject) => {
    // 设置状态为 checking
    auth.setLoginStatus('checking')

    authApi.sessionGetCurrent(
      {
        status200: (session: Session) => {
          // 会话有效，更新用户信息
          const person = session.person
          if (person) {
            const userInfo = {
              id: person.id || 0,
              email: person.email || '',
              firstName: person.firstName || '',
              lastName: person.lastName || '',
              type: (person.type ||
                'Shop') as 'Shop' | 'Dealership' | 'Csr' | 'FieldStaff' | 'ProgramAdministrator',
              status: (person.status ||
                'Active') as 'Active' | 'Inactive' | 'RegistrationRequested' | 'Pending',
              shopName: person.shop?.name,
              shopNumber: person.shop?.shopNumber,
              dealershipName: person.dealership?.name,
              dealershipNumber: person.dealership?.dealershipNumber,
            }
            auth.setUser(userInfo) // setUser 会自动设置 loginStatus 为 'authenticated'
            resolve()
          } else {
            auth.setLoginStatus('unauthenticated')
            reject(new Error('Session has no person data'))
          }
        },
        status401: () => {
          // Cookie 过期或无效，清除状态
          auth.reset()
          reject(new Error('Session expired'))
        },
        status404: () => {
          // 未登录（无会话），清除状态
          auth.reset()
          reject(new Error('No session found'))
        },
        else: (statusCode: number) => {
          // 处理其他未预期的状态码
          if (statusCode === 404) {
            auth.reset()
            reject(new Error('No session found'))
          } else {
            reject(new Error(`Unexpected status code: ${statusCode}`))
          }
        },
        error: (error: Error) => {
          // 网络错误等
          reject(error)
        },
      },
      null // options 参数，可选
    )
  })
}

/**
 * 获取当前用户数据（从 store 中读取）
 * 这是一个同步函数，直接返回 store 中的用户数据
 * 
 * @returns AuthUser | null
 */
export function getCurrentUser() {
  const { auth } = useAuthStore.getState()
  return auth.user
}

/**
 * 检查用户是否已登录（从 store 中读取）
 * 这是一个同步函数，直接返回 store 中的认证状态
 * 
 * @returns boolean
 */
export function isAuthenticated(): boolean {
  const { auth } = useAuthStore.getState()
  return auth.loginStatus === 'authenticated'
}

/**
 * 获取当前登录状态
 * 
 * @returns AuthStatus
 */
export function getLoginStatus(): AuthStatus {
  const { auth } = useAuthStore.getState()
  return auth.loginStatus
}

