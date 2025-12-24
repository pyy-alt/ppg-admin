import { Loading } from '@/components/Loading'
import { RepairOrderList } from '@/features/admin/repair/orders'
import { useAuthenticated } from '@/hooks/use-authenticated'
import { createFileRoute } from '@tanstack/react-router'

function AdminRepairsOrdersComponent() {
  const { isAuthenticated, isLoading } = useAuthenticated()
  
  if (isLoading || !isAuthenticated) {
    return <Loading />
  }
  
  return <RepairOrderList />
}

export const Route = createFileRoute('/_authenticated/admin/repair_orders')({
  component: AdminRepairsOrdersComponent,
})