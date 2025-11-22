import { create } from 'zustand'

// 导出 AuthStatus 类型供全局使用
export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

 export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  type: 'Shop' | 'Dealership' | 'Csr' | 'FieldStaff' | 'ProgramAdministrator'
  status: 'Active' | 'Inactive' | 'RegistrationRequested' | 'Pending'
  // 可选字段
  shopName?: string
  shopNumber?: string
  dealershipName?: string
  dealershipNumber?: string
}

interface AuthState {
  auth: {
    loginStatus: AuthStatus
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    setLoginStatus: (status: AuthStatus) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  return {
    auth: {
      loginStatus: 'unauthenticated',
      user: null,
      setLoginStatus: (status: AuthStatus) =>
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            loginStatus: status,
          },
        })),
      setUser: (user) =>
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            user,
            loginStatus: user ? 'authenticated' : 'unauthenticated',
          },
        })),
      reset: () =>
        set((state) => {
          // 注意：HttpOnly Cookie 无法通过前端 JavaScript 删除
          // Cookie 的删除应该由后端的 logout API 通过 Set-Cookie 响应头处理
          // 这里只清除前端状态
          return {
            ...state,
            auth: {
              ...state.auth,
              loginStatus: 'unauthenticated',
              user: null,
            },
          }
        }),
    },
  }
})
