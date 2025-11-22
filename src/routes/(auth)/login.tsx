import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Login } from '@/features/auth/login'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/login')({
  component: Login,
  validateSearch: searchSchema,
})