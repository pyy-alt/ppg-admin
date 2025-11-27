import { useEffect, useState } from 'react'
// import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

/**
 * 认证检查 Hook
 * 返回认证状态和是否已完成检查
 */
export function useAuthenticated() {
  const { auth } = useAuthStore()
  // const navigate = useNavigate()
  const [hasChecked, setHasChecked] = useState(false)

  // 等待 InitAuth 完成验证
  useEffect(() => {
    if (auth.loginStatus === 'authenticated') {
      setHasChecked(true)
      return
    }
    
    if (auth.loginStatus === 'checking') {
      return
    }
    
    const timer = setTimeout(() => {
      setHasChecked(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [auth.loginStatus])

  // 移除自动重定向逻辑，因为父路由已经统一处理未认证情况
  // 如果需要在特定场景下重定向，可以在组件层面手动处理
  // useEffect(() => {
  //   if (auth.loginStatus === 'unauthenticated' && hasChecked) {
  //     const currentPath = window.location.pathname + window.location.search
  //     navigate({
  //       to: '/login',
  //       search: { redirect: currentPath },
  //       replace: true,
  //     })
  //   }
  // }, [auth.loginStatus, hasChecked, navigate])

  return {
    isAuthenticated: auth.loginStatus === 'authenticated',
    isLoading: !hasChecked || auth.loginStatus === 'checking',
    user: auth.user,
  }
}