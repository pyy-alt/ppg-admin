import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Login } from '@/features/auth/login'

const searchSchema = z.object({
  redirect: z.string().optional(),
  brand: z.enum(['audi', 'vw']).optional(), // 添加可选的 brand 参数
  region: z.enum(['america', 'canada']).optional(), // 添加可选的 region 参数
})

export const Route = createFileRoute('/(auth)/login')({
  component: Login,
  validateSearch: searchSchema,
})
