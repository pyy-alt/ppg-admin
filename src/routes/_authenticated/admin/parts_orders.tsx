import { createFileRoute } from '@tanstack/react-router'
import { PartOrders } from '@/features/admin/orders'
import { useAuthenticated } from '@/hooks/use-authenticated'
import { Loading } from '@/components/Loading'

function AdminPartsOrdersComponent() {
  const { isAuthenticated, isLoading } = useAuthenticated()
  
  if (isLoading || !isAuthenticated) {
    return <Loading />
  }
  
  // 使用默认的 AuthenticatedLayout（包含侧边栏）
  return <PartOrders />
}

export const Route = createFileRoute('/_authenticated/admin/parts_orders')({
  component: AdminPartsOrdersComponent,
})


