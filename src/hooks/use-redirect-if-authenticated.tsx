import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { refreshUserData } from '@/lib/auth'
import { Loading } from '@/components/Loading'

/**
 * 未认证页面 Hook
 * 用于登录、注册、忘记密码等页面
 * 
 * 功能：
 * 1. 如果用户已登录，重定向到首页
 * 2. 如果用户未登录，尝试验证 Cookie（因为 InitAuth 在未认证页面不会验证）
 * 3. 返回是否正在检查认证状态
 * 
 * @returns { isLoading: boolean, LoadingComponent: React.ComponentType | null }
 */
export function useRedirectIfAuthenticated() {
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const hasCheckedRef = useRef(false) // 防止重复调用
  const isCheckingRef = useRef(false) // 防止并发调用

  useEffect(() => {
    // 如果已经认证，直接重定向
    if (auth.loginStatus === 'authenticated') {
      hasCheckedRef.current = true // 标记为已检查
      setIsCheckingAuth(false)

      navigate({
        to: '/',
        replace: true,
      })
      return
    }


    // 如果已经检查过且确认未登录，不再验证
    if (hasCheckedRef.current && auth.loginStatus === 'unauthenticated') {
      setIsCheckingAuth(false)
      return
    }

    // 如果状态是 unauthenticated，尝试验证 Cookie
    // 因为 InitAuth 在未认证页面不会验证 Cookie，所以这里需要手动验证
    if (auth.loginStatus === 'unauthenticated') {
      refreshUserData()
        .then(() => {
          // 如果验证成功，refreshUserData 会自动更新状态为 authenticated
          // useEffect 会再次触发，执行重定向
          hasCheckedRef.current = true // 标记为已检查
          isCheckingRef.current = false // 防止并发调用
          setIsCheckingAuth(false)
        })
        .catch(() => {
          // Cookie 无效或不存在，保持 unauthenticated 状态
            // 标记为已检查，防止重复调用
            hasCheckedRef.current = true
            isCheckingRef.current = false
          setIsCheckingAuth(false)
        })
    }else if (auth.loginStatus === 'checking') {
      // checking 状态，等待结果
      setIsCheckingAuth(true)
    }  
    else {
      // checking 状态，等待结果
      setIsCheckingAuth(false)
    }
  }, [auth.loginStatus, navigate])

  // 如果正在检查认证状态或已登录，返回 Loading 组件
  const isLoading = isCheckingAuth || auth.loginStatus === 'checking' || auth.loginStatus === 'authenticated'

  return {
    isLoading,
    LoadingComponent: isLoading ? Loading : null,
  }
}