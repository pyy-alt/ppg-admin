import { createFileRoute } from '@tanstack/react-router'
import { ResetPassword } from '@/features/auth/password/reset'

export const Route = createFileRoute('/password/reset/$id/$guid/$hash')({
  component: () => {
    // 在路由文件中获取参数，然后传递给组件
    return <ResetPassword />
  },
})
