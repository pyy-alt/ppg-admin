import { createFileRoute } from '@tanstack/react-router'
import { ResetPassword } from '@/features/auth/password/reset'

export const Route = createFileRoute('/password/reset/$id/$guid/$hash')({
  component: () => {
    // Get parameters in the route file，Then pass them to the component
    return <ResetPassword />
  },
})
