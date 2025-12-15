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
    // 清除认证状态
    auth.reset()
    // 关闭 dialog
    close()
    // 跳转到登录页，保留当前路径作为 redirect
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
      title='资源未找到'
      desc={message || '请求的资源不存在或已被删除。请重新登录后重试。'}
      confirmText='前往登录'
      cancelBtnText={undefined}
      handleConfirm={handleConfirm}
      className='sm:max-w-md'
    />
  )
}