/**
 * Utility functions related to authentication
 * Used for globally fetching and refreshing user data
 */
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import type Session from '@/js/models/Session'
import { type AuthStatus, useAuthStore } from '@/stores/auth-store'

const authApi = new AuthenticationApi()

// Add a flag to prevent duplicate calls
let isRefreshing = false
let refreshPromise: Promise<void> | null = null

/**
 * Refresh current user data
 * Call sessionGetCurrent API Fetch the latest user information and update to store
 *
 * @returns Promise<void>
 */
export async function refreshUserData(): Promise<void> {
  // If refreshing，Return the same Promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  const { auth } = useAuthStore.getState()

  refreshPromise = new Promise((resolve, reject) => {
    // Set status to checking
    auth.setLoginStatus('checking')

    authApi.sessionGetCurrent(
      {
        status200: (session: Session) => {
          if (session) {
            auth.setUser(session) // setUser Will be automatically set loginStatus To 'authenticated'
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
          // Cookie Expired or invalid，Clear status
          auth.reset()
          isRefreshing = false
          refreshPromise = null
          reject(new Error('Session expired'))
        },
        status404: () => {
          // Not logged in（No session）
          // Check if the current path is an unauthenticated route
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
            // On the unauthenticated route page，404 Is normal，Immediately set status and reject
            auth.setLoginStatus('unauthenticated') // Important：Set status first，Avoid always checking
            isRefreshing = false
            refreshPromise = null
            reject(new Error('No session found'))
            return
          }

          // On protected pages，Check if it is session/current Interface
          import('@/lib/api-404-config').then(
            ({ shouldRedirectToLoginOn404 }) => {
              const url =
                'https://audi-api.ppg.dev.quasidea.com/authentication/session/current'
              if (shouldRedirectToLoginOn404(url)) {
                // Is an interface that requires redirecting to login，Do not immediately reset，Let dialog Handle
                // Delay reject，Give dialog Time display
                setTimeout(() => {
                  isRefreshing = false
                  refreshPromise = null
                  reject(new Error('No session found'))
                }, 500)
              } else {
                // Other interface's 404，Normal handling
                auth.reset()
                isRefreshing = false
                refreshPromise = null
                reject(new Error('No session found'))
              }
            }
          )
        },
        else: (statusCode: number) => {
          // Handle other unexpected status codes
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
          // Network errors, etc.
          isRefreshing = false
          refreshPromise = null
          reject(error)
        },
      },
      null // options Parameter，Optional
    )
  })

  return refreshPromise
}

/**
 * Get current user data（From store Read from）
 * This is a synchronous function，Return directly store User data in
 *
 * @returns AuthUser | null
 */
export function getCurrentUser() {
  const { auth } = useAuthStore.getState()
  return auth.user
}

/**
 * Check if the user is logged in（From store Read from）
 * This is a synchronous function，Return directly store Authentication status in
 *
 * @returns boolean
 */
export function isAuthenticated(): boolean {
  const { auth } = useAuthStore.getState()
  return auth.loginStatus === 'authenticated'
}

/**
 * Get current login status
 *
 * @returns AuthStatus
 */
export function getLoginStatus(): AuthStatus {
  const { auth } = useAuthStore.getState()
  return auth.loginStatus
}
