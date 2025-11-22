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
import { ThemeProvider } from './context/theme-provider'
// Generated Routes
import { routeTree } from './routeTree.gen'
// Styles
import './styles/index.css'

/**
 * 初始化认证状态
 * 应用启动时调用 refreshUserData 验证会话（完全依赖后端返回的状态码）
 * 优化：只在需要验证会话的路由上调用，避免在未认证页面（如登录、忘记密码）调用
 */
function InitAuthInner() {
  const location = useLocation()

  useEffect(() => {
    const { auth } = useAuthStore.getState()

    // 定义不需要验证会话的路由（未认证页面）
    // 这些页面明确是给未登录用户使用的，不需要调用 sessionGetCurrent
    const unauthenticatedRoutes = [
      '/login',
      '/password/forgot',
      '/password/reset', // 重置密码页面（带参数的路由也会匹配这个前缀）
      '/registration/shop',
      '/registration/dealership',
      '/registration/complete',
      '/registrationResult',
    ]

    // 检查当前路径是否在未认证路由列表中
    const isUnauthenticatedRoute = unauthenticatedRoutes.some(
      (route) =>
        location.pathname === route || location.pathname.startsWith(route + '/')
    )

    // 如果在未认证页面，直接设置为未登录状态，不调用 API
    if (isUnauthenticatedRoute) {
      if (auth.loginStatus === 'checking') {
        auth.setLoginStatus('unauthenticated')
      }
      return
    }

    // 如果已经认证，不需要再次调用 API
    if (auth.loginStatus === 'authenticated') {
      return
    }

    // 如果正在检查中，避免重复调用
    if (auth.loginStatus === 'checking') {
      return
    }

    // 如果在其他页面（如受保护的路由或根路径），需要验证会话
    // 立即设置状态为 checking，避免闪烁
    auth.setLoginStatus('checking')

    // 调用 refreshUserData 获取用户数据
    // 如果 Cookie 有效 → 返回 200，更新用户信息
    // 如果 Cookie 无效或不存在 → 返回 401 或 404，清除状态
    refreshUserData().catch((error) => {
      // 网络错误等，不清除状态（可能是临时网络问题）
      // 404/401 错误已经在 refreshUserData 中处理了
       
      if (import.meta.env.DEV) {
        console.log('InitAuth: 无法获取用户数据', error)
        const redirect = `${router.history.location.href}`

        router.navigate({ to: '/login', search: { redirect } })
      }
    })
  }, [location.pathname]) // 只依赖路径，不依赖 auth 对象

  return null // 不渲染任何东西
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
          const redirect = `${router.history.location.href}`
          router.navigate({ to: '/login', search: { redirect } })
        }
        if (error.response?.status === 500) {
          toast.error('Internal Server Error!')
          // Only navigate to error page in production to avoid disrupting HMR in development
          if (import.meta.env.PROD) {
            router.navigate({ to: '/500' })
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
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <RouterProvider router={router} />
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}
