import { createFileRoute } from '@tanstack/react-router'
import { RegistrationComplete } from '@/features/registration/complete'

export const Route = createFileRoute('/registration/complete')({
  component: RegistrationComplete,
})
