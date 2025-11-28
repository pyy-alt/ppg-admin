import { useEffect, useMemo } from 'react'
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import type Session from '@/js/models/Session'
import { PersonType } from '@/js/models/enum/PersonTypeEnum'
import { useAuthStore } from '@/stores/auth-store'
import { Loading } from '@/components/Loading'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { HeaderOnlyLayout } from '@/components/layout/header-only-layout'
import WelcomeGate from '@/features/auth/welcomeGate'

declare global {
  interface Window {
    switchUserType?: (type: PersonType) => void
    getUserType?: () => PersonType | undefined
  }
}

// 常量定义
const ROUTES_WITHOUT_SIDEBAR = ['/parts_orders', '/repair_orders'] as const

// 重定向逻辑函数
const getRedirectTarget = (
  path: string,
  userType: PersonType | undefined
): string | null => {
  // 如果没有用户类型，不重定向
  if (!userType) return null

  // 管理员（ProgramAdministrator）保持原逻辑
  if (userType === 'ProgramAdministrator') {
    if (path === '/parts_orders') return '/admin/parts_orders'
    if (path === '/') return '/admin/parts_orders'
    return null
  }

  // Shop 用户跳转到 /repair_orders
  if (userType === 'Shop') {
    // ✅ 如果访问 /parts_orders，重定向到 /repair_orders
    if (path === '/parts_orders' || path.startsWith('/parts_orders/')) {
      return '/repair_orders'
    }
    if (path.startsWith('/admin/')) {
      return '/repair_orders'
    }
    if (path === '/') return '/repair_orders'
    return null
  }

  // Dealership 用户跳转到 /parts_orders
  if (
    userType === 'Dealership' ||
    userType === 'Csr' ||
    userType === 'FieldStaff'
  ) {
    // ✅ 如果访问 /repair_orders，重定向到 /parts_orders
    if (path === '/repair_orders' || path.startsWith('/repair_orders/')) {
      return '/parts_orders'
    }
    if (path.startsWith('/admin/')) {
      return '/parts_orders'
    }
    if (path === '/') return '/parts_orders'
    return null
  }

  // 其他角色保持原逻辑，跳转到 /parts_orders
  if (path.startsWith('/admin/')) {
    return '/parts_orders'
  }
  if (path === '/') return '/parts_orders'
  return null
}

function AuthenticatedRouteComponent() {
  const { auth } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const isAdmin = auth.user?.person?.type === 'ProgramAdministrator'

  // 扩展 Window 接口以支持开发模式下的调试函数

  // 开发模式：添加用户类型切换功能
  useEffect(() => {
    if (!import.meta.env.DEV || !auth.user) return

    window.switchUserType = (type: PersonType) => {
      // ✅ 如果当前有 user，需要创建一个新的 Session 对象来更新 type
      // 注意：这只是一个开发工具，实际应用中不应该这样修改用户类型
      if (auth.user?.person) {
        // 创建一个新的 Person 对象，只修改 type
        const updatedPerson = {
          ...auth.user.person,
          type: type,
        }
        // 创建一个模拟的 Session 对象
        const mockSession = {
          guid: auth.user.guid,
          person: updatedPerson,
          hash: auth.user.hash,
        } as Session
        auth.setUser(mockSession)
        console.log(`已切换用户类型为: ${type}`)
      }
    }

    window.getUserType = () => {
      console.log('当前用户类型:', auth.user?.person?.type)
      return auth.user?.person?.type
    }
  }, [auth.user])

  // 路由重定向逻辑
  useEffect(() => {
    if (
      auth.loginStatus === 'checking' ||
      auth.loginStatus !== 'authenticated'
    ) {
      return
    }

    const redirectTarget = getRedirectTarget(
      location.pathname,
      auth.user?.person?.type
    )
    if (redirectTarget) {
      navigate({ to: redirectTarget, replace: true })
    }
  }, [auth.loginStatus, isAdmin, location.pathname, navigate])

  // 计算是否需要重定向（使用 useMemo 优化性能）
  const isRedirecting = useMemo(() => {
    if (auth.loginStatus !== 'authenticated') return false
    return (
      getRedirectTarget(location.pathname, auth.user?.person?.type) !== null
    )
  }, [auth.loginStatus, location.pathname, isAdmin])

  // 计算是否需要侧边栏（使用 useMemo 优化性能）
  const needsSidebar = useMemo(() => {
    return !ROUTES_WITHOUT_SIDEBAR.some(
      (route) =>
        location.pathname === route || location.pathname.startsWith(route + '/')
    )
  }, [location.pathname])

  // 提前返回：检查认证状态
  if (auth.loginStatus === 'checking') {
    return <Loading />
  }

  // 没有认证，显示 WelcomeGate
  if (auth.loginStatus !== 'authenticated') {
    // return <Outlet />
    return <WelcomeGate />
  }

  // 提前返回：正在重定向
  if (isRedirecting) {
    return <Loading />
  }

  // 布局选择：不需要侧边栏或普通用户，使用 HeaderOnlyLayout
  if (!needsSidebar || !isAdmin) {
    return (
      <HeaderOnlyLayout>
        <Outlet />
      </HeaderOnlyLayout>
    )
  }

  // 管理员访问需要侧边栏的路由
  return <AuthenticatedLayout />
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    // 注意：不在这里检查认证状态，因为：
    // 1. Cookie 是 HttpOnly，前端无法读取
    // 2. InitAuth 是异步的，需要时间验证
    // 3. 让组件层处理认证检查和重定向，可以响应式更新
    // 如果未登录，子路由会处理重定向
  },
  component: AuthenticatedRouteComponent,
})
