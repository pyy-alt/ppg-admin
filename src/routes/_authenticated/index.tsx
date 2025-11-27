import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Loading } from '@/components/Loading'

function AuthenticatedIndex() {
  // 直接解构 auth 的属性，使用 selector 优化性能
  const { loginStatus, user } = useAuthStore((state) => state.auth)
  const navigate = useNavigate()
  const [hasChecked, setHasChecked] = useState(false)
  const isAdmin = user?.type === 'ProgramAdministrator'

  // 等待 InitAuth 完成验证
  useEffect(() => {
    // 如果已经认证，立即标记为已检查
    if (loginStatus === 'authenticated') {
      setHasChecked(true)
      return
    }

    // 如果正在检查中，等待
    if (loginStatus === 'checking') {
      return
    }

    // 设置一个延迟，等待 InitAuth 完成验证
    const timer = setTimeout(() => {
      setHasChecked(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [loginStatus])

  // 已登录用户，根据用户类型重定向到对应页面
  useEffect(() => {
    if (loginStatus === 'authenticated' && hasChecked) {
      if (isAdmin) {
        navigate({ to: '/admin/parts_orders', replace: true })
      } else {
        navigate({ to: '/parts_orders', replace: true })
      }
    }
  }, [loginStatus, hasChecked, isAdmin, navigate])

  // 如果正在检查认证状态，显示加载状态
  if (!hasChecked || loginStatus === 'checking') {
    return <Loading />
  }

  // 已登录用户，显示加载（正在重定向）
  return <Loading />
}

export const Route = createFileRoute('/_authenticated/')({
  component: AuthenticatedIndex,
})
