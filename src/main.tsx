import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  RouterProvider,
  createRouter,
  useLocation,
} from '@tanstack/react-router'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { refreshUserData } from '@/lib/auth'
import { handleServerError } from '@/lib/handle-server-error'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { I18nProvider } from './context/i18n-provider'
import { ThemeProvider } from './context/theme-provider'
import { shouldRedirectToLoginOn404 } from './lib/api-404-config'
// Generated Routes
import { routeTree } from './routeTree.gen'
// import { useGlobal404Store } from './stores/global-404-store'
// Styles
import './styles/index.css'
import { BrandProvider } from './context/brand-context'

/**
 * Initialize authentication status
 * Called when the application starts refreshUserData Validate session（Completely relies on the status code returned by the backend）
 * Optimize：Call only on routes that require session validation，Avoid on unauthenticated pages（Such as login、Forgot password）Call
 */
function InitAuthInner() {
  const location = useLocation()

  useEffect(() => {
    const { auth } = useAuthStore.getState()

    // Define routes that do not require session validation（Unauthenticated page）
    // These pages are explicitly for use by unauthenticated users，No need to call sessionGetCurrent
    const unauthenticatedRoutes = [
      '/login',
      '/password/forgot',
      '/password/reset', // Reset password page（Routes with parameters will also match this prefix）
      '/registration/shop',
      '/registration/dealership',
      '/registration/complete',
      '/registrationResult',
    ]

    // Check if the current path is in the unauthenticated route list
    const isUnauthenticatedRoute = unauthenticatedRoutes.some(
      (route) =>
        location.pathname === route || location.pathname.startsWith(route + '/')
    )


    // Special handling：If the path is the root path `/`，and unauthenticated，Do not call API
    // Because _authenticated/route.tsx Will display WelcomeGate，No need to validate session
    if (location.pathname === '/' && auth.loginStatus !== 'authenticated') {
      if (auth.loginStatus === 'checking') {
        auth.setLoginStatus('unauthenticated')
      }
      return
    }

    // If on an unauthenticated page，Directly set to unauthenticated status，Do not call API
    if (isUnauthenticatedRoute) {
      if (auth.loginStatus === 'checking') {
        auth.setLoginStatus('unauthenticated')
      }
      return
    }

    // If already authenticated，No need to call again API
    if (auth.loginStatus === 'authenticated') {
      return
    }

    // If in the process of checking，Avoid duplicate calls
    if (auth.loginStatus === 'checking') {
      return
    }

    // If on other pages（Such as protected routes or root path），Requires session validation
    // Immediately set status to checking，Avoid flickering
    auth.setLoginStatus('checking')

    // Call refreshUserData Get user data
    // If Cookie Valid → Return 200，Update user information
    // If Cookie Invalid or does not exist → Return 401 Or 404，Clear status
    refreshUserData().catch((error) => {
      // Network errors, etc.，Do not clear status（Could be a temporary network issue）
      // 404/401 The error has been handled in refreshUserData Processed

      // If it is 404 Error（No session found），Check for dialog Open
      if (error.message === 'No session found') {
        // Dynamic import check dialog Status
        import('@/stores/global-404-store').then(({ useGlobal404Store }) => {
          setTimeout(() => {
            const { isOpen } = useGlobal404Store.getState()
            // If dialog Already open，Do not redirect，Let dialog Handle redirection
            if (!isOpen) {
              // Dialog Not opened，Could be for other reasons，Normal redirection
              if (import.meta.env.DEV) {
                // console.log('InitAuth: Unable to get user data', error)


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
      
                      // If on an unauthenticated route page，Do not redirect
                      if (isUnauthenticatedRoute) {
                        return
                      }
      
                      // If not in the unauthenticated route list，Indicates it is a protected route
                      // The parent route has handled the unauthenticated case，Will display WelcomeGate，No need to redirect to the login page
                      return
                const redirect = window.location.href
                window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
              }
            }
          }, 100) // Give dialog A little time to open
        })
        return
      }
      if (import.meta.env.DEV) {
        // console.log('InitAuth: Unable to get user data', error)
        const redirect = window.location.href
        window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
      }
    })
  }, [location.pathname]) // Only rely on the path，Do not rely on auth Object

  return null // Do not render anything
}

export default function InitAuth() {
  return <InitAuthInner />
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error('Content not modified!')
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          useAuthStore.getState().auth.reset()
          // ❌ Directly redirect to /login，Bypassed WelcomeGate
          const redirect = window.location.href
          window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
        }
        // Add 404 Handle
        if (error.response?.status === 404) {
          // Directly redirect to the login page
          const requestUrl =
            error.config?.url || error.response?.config?.url || ''

          // Only for specific interfaces 404 Handle
          if (requestUrl && shouldRedirectToLoginOn404(requestUrl)) {
            // Check if the current path is an unauthenticated route，If so, do not redirect（Avoid loops）
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
              return // On unauthenticated route pages，404 Is normal，Do not redirect
            }

            // If not in the unauthenticated route list，Indicates it is a protected route
            // The parent route has handled the unauthenticated case，Will display WelcomeGate，No need to redirect to the login page
            return
            // Directly jump to the login page
            useAuthStore.getState().auth.reset()
            const redirect = window.location.href
            window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
          }
          // First, pop up a user confirmation
          // const requestUrl =
          //   error.config?.url || error.response?.config?.url || ''
          // if (requestUrl && shouldRedirectToLoginOn404(requestUrl)) {
          //   const message =
          //     error.response?.data?.message ||
          //     error.response?.data?.error ||
          //     null
          //   useGlobal404Store.getState().open(message, requestUrl)
          // }
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          // Only navigate to error page in production to avoid disrupting HMR in development
          if (import.meta.env.PROD) {
            window.location.href = '/500'
          }
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ThemeProvider>
            <FontProvider>
              <DirectionProvider>
                <BrandProvider>
                <RouterProvider router={router} />
                </BrandProvider>
              </DirectionProvider>
            </FontProvider>
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
