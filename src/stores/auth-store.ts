import Person from '@/js/models/Person'
import Region from '@/js/models/Region'
import type Session from '@/js/models/Session'
import { create } from 'zustand'

// 导出 AuthStatus 类型供全局使用
export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

export interface AuthUser {
  guid?: string
  person?: Person
  hash?: string,
  regions?: Region[] 
}

interface AuthState {
  auth: {
    loginStatus: AuthStatus
    user: AuthUser | null
    setUser: (session: Session | null) => void // ✅ 修改：接受 Session 类型
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
      setUser: (session) => {
        // ✅ 从 Session 提取 guid, person, hash
        const user: AuthUser | null = session
          ? {
              guid: session.guid,
              person: session.person || undefined,
              hash: session.hash,
              regions: session.regions,
            }
          : null
        set((state) => ({
          ...state,
          auth: {
            ...state.auth,
            user,
            loginStatus: user ? 'authenticated' : 'unauthenticated',
          },
        }))
      },
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
