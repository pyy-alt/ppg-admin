import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { Loading } from '@/components/Loading'

function AuthenticatedIndex() {
  // Direct deconstruction auth attributes，Use selector Optimize performance
  const { loginStatus, user } = useAuthStore((state) => state.auth)
  const navigate = useNavigate()
  const [hasChecked, setHasChecked] = useState(false)

  // Waiting InitAuth Complete verification
  useEffect(() => {
    // If already certified，Mark as checked immediately.
    if (loginStatus === 'authenticated') {
      setHasChecked(true)
      return
    }

    // If it is under inspection.，Waiting
    if (loginStatus === 'checking') {
      return
    }

    // Set a delay.，Waiting InitAuth Complete verification
    const timer = setTimeout(() => {
      setHasChecked(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [loginStatus])

  // ✅ Logged-in user，Redirect to the corresponding page based on user type.
  useEffect(() => {
    if (loginStatus === 'authenticated' && hasChecked && user?.person?.type) {
      // ✅ Jump to different pages based on user type.
      if (user.person.type === 'ProgramAdministrator') {
        navigate({ to: '/admin/parts_orders', replace: true })
      } else if (user.person.type === 'Shop') {
        navigate({ to: '/repair_orders', replace: true })
      } else {
        // Dealership, Csr, FieldStaff Jump to /parts_orders
        navigate({ to: '/parts_orders', replace: true })
      }
    }
  }, [loginStatus, hasChecked, user?.person?.type, navigate])

  // If checking the certification status，Show loading status
  if (!hasChecked || loginStatus === 'checking') {
    return <Loading />
  }

  // Logged-in user，Show loading（Redirecting）
  return <Loading />
}

export const Route = createFileRoute('/_authenticated/')({
  component: AuthenticatedIndex,
})
