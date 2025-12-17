import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Login } from '@/features/auth/login'

const searchSchema = z.object({
  redirect: z.string().optional(),
  brand: z.enum(['audi', 'vw']).optional(), // Add optional brand parameters
  region: z.enum(['america', 'canada']).optional(), // Add optional region parameters
})

export const Route = createFileRoute('/(auth)/login')({
  component: Login,
  validateSearch: searchSchema,
})
