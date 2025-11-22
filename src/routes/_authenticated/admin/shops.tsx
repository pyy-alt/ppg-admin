import { createFileRoute } from '@tanstack/react-router'
import { Shops } from '@/features/admin/shops'

export const Route = createFileRoute('/_authenticated/admin/shops')({
  component: Shops,
})
