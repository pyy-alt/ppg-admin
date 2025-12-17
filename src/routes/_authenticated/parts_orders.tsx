import { createFileRoute } from '@tanstack/react-router'
import { HeaderOnlyLayout } from '@/components/layout/header-only-layout'
import { PartOrders } from '@/features/part/orders'
import { useAuthenticated } from '@/hooks/use-authenticated'
import { Loading } from '@/components/Loading'

function PartsOrdersComponent() {
  const { isAuthenticated, isLoading } = useAuthenticated()
  if (isLoading || !isAuthenticated) {
    return <Loading />
  }
  // If logged in，Use HeaderOnlyLayout
  return (
    <HeaderOnlyLayout>
      <PartOrders />
    </HeaderOnlyLayout>
  )
}

export const Route = createFileRoute('/_authenticated/parts_orders')({
  component: PartsOrdersComponent,
})
