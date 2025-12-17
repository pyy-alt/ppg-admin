import { createFileRoute } from '@tanstack/react-router'
import { PartOrders } from '@/features/admin/orders'
import { useAuthenticated } from '@/hooks/use-authenticated'
import { Loading } from '@/components/Loading'

function AdminPartsOrdersComponent() {
  const { isAuthenticated, isLoading } = useAuthenticated()
  
  if (isLoading || !isAuthenticated) {
    return <Loading />
  }
  
  // Use default AuthenticatedLayout（Include sidebar）
  return <PartOrders />
}

export const Route = createFileRoute('/_authenticated/admin/parts_orders')({
  component: AdminPartsOrdersComponent,
})


