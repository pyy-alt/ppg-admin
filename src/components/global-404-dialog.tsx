import { useNavigate, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useGlobal404Store } from '@/stores/global-404-store'

export function Global404Dialog() {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()
  const { isOpen, close, message } = useGlobal404Store()

  const handleConfirm = () => {
    // Clear authentication status
    auth.reset()
    // Close dialog
    close()
    // Redirect to login page，Retain current path as redirect
    const redirect = location.href
    navigate({
      to: '/login',
      search: { redirect },
      replace: true,
    })
  }

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={close}
      title='Resource not found'
      desc={message || 'The requested resource does not exist or has been deleted。Please log in again and try again。'}
      confirmText='Go to login'
      cancelBtnText={undefined}
      handleConfirm={handleConfirm}
      className='sm:max-w-md'
    />
  )
}