import { useEffect, useState } from 'react'
// import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Authentication check Hook
 * Return authentication status and whether the check is completed
 */
export function useAuthenticated() {
  const { auth } = useAuthStore()
  // const navigate = useNavigate()
  const [hasChecked, setHasChecked] = useState(false)

  // Wait InitAuth Complete verification
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

  // Remove automatic redirection logic，Because the parent route has already uniformly handled unauthenticated situations
  // If redirection is needed in specific scenarios，It can be handled manually at the component level
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