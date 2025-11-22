import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Loading } from '@/components/Loading'
import { Landing } from '@/features/auth/landing'

function AuthenticatedIndex() {
  // 使用 hook 确保响应式更新
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const [hasChecked, setHasChecked] = useState(false)

  // 判断是否是管理员
  const isAdmin = auth.user?.type === 'ProgramAdministrator'

  // 等待 InitAuth 完成验证
  useEffect(() => {
    // 如果已经认证，立即标记为已检查
    if (auth.loginStatus === 'authenticated') {
      setHasChecked(true)
      return
    }

    // 如果正在检查中，等待
    if (auth.loginStatus === 'checking') {
      return
    }

    // 设置一个延迟，等待 InitAuth 完成验证
    const timer = setTimeout(() => {
      setHasChecked(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [auth.loginStatus])

  // 已登录用户，根据用户类型重定向到对应页面
  useEffect(() => {
    if (auth.loginStatus === 'authenticated' && hasChecked) {
      if (isAdmin) {
        navigate({ to: '/admin/parts_orders', replace: true })
      } else {
        navigate({ to: '/parts_orders', replace: true })
      }
    }
  }, [auth.loginStatus, hasChecked, isAdmin, navigate])

  // 如果正在检查认证状态，显示加载状态
  if (!hasChecked || auth.loginStatus === 'checking') {
    return <Loading />
  }

  // 如果未登录，显示 Landing 页面
  if (auth.loginStatus === 'unauthenticated') {
    return <Landing />
  }

  // 已登录用户，显示加载（正在重定向）
  return <Loading />
}

export const Route = createFileRoute('/_authenticated/')({
  component: AuthenticatedIndex,
})
