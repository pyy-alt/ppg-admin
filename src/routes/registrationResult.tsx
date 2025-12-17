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
 * //  RegistrationShop.tsx or RegistrationDealership.tsx of handleSubmit in

// success
navigate({ to: '/registration/result', search: { status: 'success' } });

// Email already exists
navigate({ to: '/registration/result', search: { status: 'duplicate' } });

// Server error
navigate({ to: '/registration/result', search: { status: 'error' } });
 * 
 */
