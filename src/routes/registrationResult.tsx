import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { RegistrationResult } from '@/components/RegistrationResult'

const searchSchema = z.object({
  status: z.enum(['success', 'duplicate', 'error']).optional().catch('error'),
})

 
export const Route = createFileRoute('/registrationResult' as any)({
  component: RegistrationResult,
  validateSearch: searchSchema,
})

/**
 * 
 * // 在 RegistrationShop.tsx 或 RegistrationDealership.tsx 的 handleSubmit 中

// 成功
navigate({ to: '/registration/result', search: { status: 'success' } });

// 邮箱已存在
navigate({ to: '/registration/result', search: { status: 'duplicate' } });

// 服务器错误
navigate({ to: '/registration/result', search: { status: 'error' } });
 * 
 */
