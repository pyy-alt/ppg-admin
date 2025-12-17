import type Person from '@/js/models/Person'
import type Region from '@/js/models/Region'
import type Session from '@/js/models/Session'
import { create } from 'zustand'

// Export AuthStatus Type for global use
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
    setUser: (session: Session | null) => void // ✅ Modify：Accept Session Type
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
        // ✅ from Session Extract guid, person, hash
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
          // Note：HttpOnly Cookie Cannot be processed through the frontend JavaScript Delete
          // Cookie Deletion should be handled by the backend logout API through Set-Cookie Handle via response headers
          // This only clears the frontend state
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
