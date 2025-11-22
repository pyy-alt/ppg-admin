import { createFileRoute } from '@tanstack/react-router'
import { ForgotPassword } from '@/features/auth/password/forgot'

export const Route = createFileRoute('/password/forgot')({
  component: ForgotPassword,
})
