import { createFileRoute } from '@tanstack/react-router'
import { Dealerships } from '@/features/admin/dealerships'
export const Route = createFileRoute('/_authenticated/admin/dealerships')({
  component: Dealerships,
})
