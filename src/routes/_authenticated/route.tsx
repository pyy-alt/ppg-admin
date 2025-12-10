import { useEffect, useMemo } from 'react'
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import type Session from '@/js/models/Session'
import { type PersonType } from '@/js/models/enum/PersonTypeEnum'
import { useAuthStore } from '@/stores/auth-store'
import { useLoadingStore } from '@/stores/loading-store'
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

// ============================================================================
// 常量定义
// ============================================================================

/** 不需要侧边栏的路由 */
const ROUTES_WITHOUT_SIDEBAR = ['/parts_orders', '/repair_orders'] as const

/** 角色权限配置 */
type RoleConfig = {
  /** 访问禁止的路由时的重定向目标 */
  forbiddenRoute: string
  /** 访问根路径时的默认重定向目标 */
  defaultRoute: string
  /** 允许访问的前缀路由列表 */
  allowedRoutes: string[]
}

const ROLE_REDIRECT_CONFIG: Record<PersonType, RoleConfig> = {
  ProgramAdministrator: {
    forbiddenRoute: '/admin/parts_orders',
    defaultRoute: '/admin/parts_orders',
    allowedRoutes: ['/admin', '/parts_orders'],
  },
  Shop: {
    forbiddenRoute: '/repair_orders',
    defaultRoute: '/repair_orders',
    allowedRoutes: ['/repair_orders'],
  },
  Csr: {
    forbiddenRoute: '/parts_orders',
    defaultRoute: '/parts_orders',
    allowedRoutes: ['/parts_orders', '/repair_orders'],
  },
  Dealership: {
    forbiddenRoute: '/parts_orders',
    defaultRoute: '/parts_orders',
    allowedRoutes: ['/parts_orders','/repair_orders'], // 只允许访问零件订单列表
    // 注：修复订单详情页 /repair_orders/:id 将通过前置条件验证处理
  },
  FieldStaff: {
    forbiddenRoute: '/parts_orders',
    defaultRoute: '/parts_orders',
    allowedRoutes: ['/parts_orders'],
  },
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 判断路径是否匹配允许列表
 * @param path 当前路径
 * @param allowedRoutes 允许的路由前缀列表
 * @returns 是否允许访问
 */
function isPathAllowed(path: string, allowedRoutes: string[]): boolean {
  if (path === '/') return false // 根路径需要重定向
  return allowedRoutes.some(
    (route) => path === route || path.startsWith(route + '/')
  )
}

/**
 * 获取重定向目标
 * @param path 当前路径
 * @param userType 用户类型
 * @returns 重定向目标或 null
 */
function getRedirectTarget(
  path: string,
  userType: PersonType | undefined
): string | null {
  if (!userType) return null

  const config = ROLE_REDIRECT_CONFIG[userType]

  // 如果访问根路径，重定向到默认路由
  if (path === '/') {
    return config.defaultRoute
  }

  // 如果路径在允许列表中，不重定向
  if (isPathAllowed(path, config.allowedRoutes)) {
    return null
  }

  // 其他情况都重定向到禁止路由（即默认路由）
  return config.forbiddenRoute
}

/**
 * 设置开发模式下的调试工具
 * @param auth 认证存储中的用户数据
 */
function setupDevTools(auth: any): void {
  if (!import.meta.env.DEV || !auth.user) return

  window.switchUserType = (type: PersonType) => {
    if (!auth.user?.person) return

    const updatedPerson = {
      ...auth.user.person,
      type: type,
    }

    const mockSession = {
      guid: auth.user.guid,
      person: updatedPerson,
      hash: auth.user.hash,
    } as Session

    auth.setUser(mockSession)
    console.log(`[DevTools] 用户类型已切换为: ${type}`)
  }

  window.getUserType = () => {
    const type = auth.user?.person?.type
    console.log('[DevTools] 当前用户类型:', type)
    return type
  }
}

function AuthenticatedRouteComponent() {
  const { auth } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const isLoading = useLoadingStore((state) => state.isLoading)
  const userType = auth.user?.person?.type
  const isAdmin = userType === 'ProgramAdministrator'

  // ============================================================================
  // 开发模式：设置调试工具
  // ============================================================================
  useEffect(() => {
    setupDevTools(auth)
  }, [auth])

  // ============================================================================
  // 路由重定向逻辑
  // ============================================================================
  useEffect(() => {
    // 如果正在检查认证状态或未认证，则不处理重定向
    if (
      auth.loginStatus === 'checking' ||
      auth.loginStatus !== 'authenticated'
    ) {
      return
    }

    const redirectTarget = getRedirectTarget(location.pathname, userType)
    if (redirectTarget) {
      navigate({ to: redirectTarget, replace: true })
    }
  }, [auth.loginStatus, userType, location.pathname, navigate])

  // ============================================================================
  // 计算派生状态
  // ============================================================================

  /**
   * 是否正在重定向
   * 当用户访问非法路由时，会被重定向，此时显示加载界面
   */
  const isRedirecting = useMemo(() => {
    if (auth.loginStatus !== 'authenticated') return false
    return getRedirectTarget(location.pathname, userType) !== null
  }, [auth.loginStatus, location.pathname, userType])

  /**
   * 是否需要侧边栏
   * 只有特定路由不需要侧边栏
   */
  const needsSidebar = useMemo(() => {
    return !ROUTES_WITHOUT_SIDEBAR.some(
      (route) =>
        location.pathname === route || location.pathname.startsWith(route + '/')
    )
  }, [location.pathname])

  // ============================================================================
  // 渲染逻辑
  // ============================================================================

  // 1. 认证状态检查中，显示加载界面
  if (auth.loginStatus === 'checking') {
    return <Loading />
  }

  // 2. 未认证，显示登录页
  if (auth.loginStatus !== 'authenticated') {
    return <WelcomeGate />
  }

  // 3. 正在重定向，显示加载界面
  if (isRedirecting) {
    return <Loading />
  }

  // ============================================================================
  // 4. 渲染布局
  // ============================================================================

  // 确定使用的布局：只有管理员且需要侧边栏的路由才使用完整布局
  const useFullLayout = isAdmin && needsSidebar

  return (
    <>
      {useFullLayout ? (
        <AuthenticatedLayout />
      ) : (
        <HeaderOnlyLayout>
          <Outlet />
        </HeaderOnlyLayout>
      )}

      {/* 全局加载覆盖层 */}
      {isLoading && (
        <div className='fixed inset-0 z-9999 flex items-center justify-center bg-black/20 backdrop-blur-sm'>
          <Loading />
        </div>
      )}
    </>
  )
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
