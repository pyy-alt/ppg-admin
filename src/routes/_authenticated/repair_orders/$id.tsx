import { createFileRoute } from '@tanstack/react-router'
import { RepairOrderDetail } from '@/features/repair/[id]'

export const Route = createFileRoute('/_authenticated/repair_orders/$id')({
  component: RepairOrderDetail
})