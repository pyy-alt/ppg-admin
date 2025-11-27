/**
 * 认证相关的工具函数
 * 用于全局获取和刷新用户数据
 */
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import type Session from '@/js/models/Session'
import { AuthStatus, useAuthStore } from '@/stores/auth-store'

const authApi = new AuthenticationApi()

// 添加防重复调用的标记
let isRefreshing = false
let refreshPromise: Promise<void> | null = null

/**
 * 刷新当前用户数据
 * 调用 sessionGetCurrent API 获取最新的用户信息并更新到 store
 *
 * @returns Promise<void>
 */
export async function refreshUserData(): Promise<void> {
  // 如果正在刷新，返回同一个 Promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  const { auth } = useAuthStore.getState()

  refreshPromise = new Promise((resolve, reject) => {
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
              type: (person.type || 'Shop') as
                | 'Shop'
                | 'Dealership'
                | 'Csr'
                | 'FieldStaff'
                | 'ProgramAdministrator',
              status: (person.status || 'Active') as
                | 'Active'
                | 'Inactive'
                | 'RegistrationRequested'
                | 'Pending',
              shopName: person.shop?.name,
              shopNumber: person.shop?.shopNumber,
              dealershipName: person.dealership?.name,
              dealershipNumber: person.dealership?.dealershipNumber,
            }
            auth.setUser(userInfo) // setUser 会自动设置 loginStatus 为 'authenticated'
            isRefreshing = false
            refreshPromise = null
            resolve()
          } else {
            auth.setLoginStatus('unauthenticated')
            isRefreshing = false
            refreshPromise = null
            reject(new Error('Session has no person data'))
          }
        },
        status401: () => {
          // Cookie 过期或无效，清除状态
          auth.reset()
          isRefreshing = false
          refreshPromise = null
          reject(new Error('Session expired'))
        },
        status404: () => {
          // 未登录（无会话）
          // 检查当前路径是否是未认证路由
          const currentPath = window.location.pathname
          const unauthenticatedRoutes = [
            '/login',
            '/password/forgot',
            '/password/reset',
            '/registration/shop',
            '/registration/dealership',
            '/registration/complete',
            '/registrationResult',
          ]

          const isUnauthenticatedRoute = unauthenticatedRoutes.some(
            (route) =>
              currentPath === route || currentPath.startsWith(route + '/')
          )

          if (isUnauthenticatedRoute) {
            // 在未认证路由页面，404 是正常情况，立即设置状态并 reject
            auth.setLoginStatus('unauthenticated') // 重要：先设置状态，避免一直 checking
            isRefreshing = false
            refreshPromise = null
            reject(new Error('No session found'))
            return
          }

          // 在受保护页面，检查是否是 session/current 接口
          import('@/lib/api-404-config').then(
            ({ shouldRedirectToLoginOn404 }) => {
              const url =
                'https://audi-api.ppg.dev.quasidea.com/authentication/session/current'
              if (shouldRedirectToLoginOn404(url)) {
                // 是需要跳转登录的接口，不立即 reset，让 dialog 处理
                // 延迟 reject，给 dialog 时间显示
                setTimeout(() => {
                  isRefreshing = false
                  refreshPromise = null
                  reject(new Error('No session found'))
                }, 500)
              } else {
                // 其他接口的 404，正常处理
                auth.reset()
                isRefreshing = false
                refreshPromise = null
                reject(new Error('No session found'))
              }
            }
          )
        },
        else: (statusCode: number) => {
          // 处理其他未预期的状态码
          if (statusCode === 404) {
            auth.reset()
            isRefreshing = false
            refreshPromise = null
            reject(new Error('No session found'))
          } else {
            isRefreshing = false
            refreshPromise = null
            reject(new Error(`Unexpected status code: ${statusCode}`))
          }
        },
        error: (error: Error) => {
          // 网络错误等
          isRefreshing = false
          refreshPromise = null
          reject(error)
        },
      },
      null // options 参数，可选
    )
  })

  return refreshPromise
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
