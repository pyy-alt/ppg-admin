import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { refreshUserData } from '@/lib/auth'
import { Loading } from '@/components/Loading'

/**
 * Unauthenticated page Hook
 * For login、Register、Forgot password and other pages
 *
 * Functionality：
 * 1. If the user is logged in，Redirect to the homepage
 * 2. If the user is not logged in，Attempt to validate Cookie（Because InitAuth it will not validate on the unauthenticated page）
 * 3. Return whether it is checking authentication status
 *
 * @returns { isLoading: boolean, LoadingComponent: React.ComponentType | null }
 */
export function useRedirectIfAuthenticated() {
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const hasCheckedRef = useRef(false) // Prevent duplicate calls
  const isCheckingRef = useRef(false) // Prevent concurrent calls

  useEffect(() => {
    // If already authenticated，Redirect directly
    if (auth.loginStatus === 'authenticated') {
      hasCheckedRef.current = true // Mark as checked
      setIsCheckingAuth(false)

      navigate({
        to: '/',
        replace: true,
      })
      return
    }

    // If already checked and confirmed not logged in，No longer validate
    if (hasCheckedRef.current && auth.loginStatus === 'unauthenticated') {
      setIsCheckingAuth(false)
      return
    }

    // If the status is unauthenticated，Attempt to validate Cookie
    // Because InitAuth it will not validate on the unauthenticated page Cookie，So manual validation is needed here
    //TODO==========This place needs to confirm whether to accept the flash of the login page When redirected to the previous interface
    if (
      auth.loginStatus === 'unauthenticated' &&
      !hasCheckedRef.current &&
      !isCheckingRef.current
    ) {
      // Prevent multiple calls to the interface
      isCheckingRef.current = true // Mark as checking，Prevent concurrent calls

      refreshUserData()
        .then(() => {
          // If validation is successful，refreshUserData It will automatically update the status to authenticated
          // useEffect It will trigger again，Execute redirect
          hasCheckedRef.current = true // Mark as checked
          isCheckingRef.current = false // Prevent concurrent calls
          setIsCheckingAuth(false)
        })
        .catch(() => {
          // Cookie Invalid or does not exist，Maintain unauthenticated Status
          // Mark as checked，Prevent duplicate calls
          hasCheckedRef.current = true
          isCheckingRef.current = false
          setIsCheckingAuth(false)
        })
    } else if (auth.loginStatus === 'checking') {
      // checking Status，Wait for result
      setIsCheckingAuth(true)
    } else {
      // checking Status，Wait for result
      setIsCheckingAuth(false)
    }
  }, [auth.loginStatus, navigate])

  // If checking authentication status or logged in，Return Loading Component
  const isLoading =
    isCheckingAuth ||
    auth.loginStatus === 'checking' ||
    auth.loginStatus === 'authenticated'

  return {
    isLoading,
    LoadingComponent: isLoading ? Loading : null,
  }
}
