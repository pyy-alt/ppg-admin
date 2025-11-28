import { RegistrationComplete } from '@/features/registration/complete'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/registration/complete/$id/$guid/$hash')({
  component: RegistrationComplete,
})

