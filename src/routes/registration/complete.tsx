import { createFileRoute } from '@tanstack/react-router'
import { RegistrationComplete } from '@/features/registration/complete'
import { z } from 'zod'

const searchSchema= z.object({
  id: z.string(),
  guid: z.string(),
  hash: z.string(),
})
export const Route = createFileRoute('/registration/complete')({
  validateSearch: searchSchema,
  component: RegistrationComplete,
})
