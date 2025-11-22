import { createFileRoute } from '@tanstack/react-router'
import { HeaderOnlyLayout } from '@/components/layout/header-only-layout'
import { PartsOrders } from '@/features/part/orders'
import { useAuthenticated } from '@/hooks/use-authenticated'
import { Loading } from '@/components/Loading'

function PartsOrdersComponent() {
  const { isAuthenticated, isLoading } = useAuthenticated()
  if (isLoading || !isAuthenticated) {
    return <Loading />
  }
  // 如果已登录，使用 HeaderOnlyLayout
  return (
    <HeaderOnlyLayout>
      <PartsOrders />
    </HeaderOnlyLayout>
  )
}

export const Route = createFileRoute('/_authenticated/parts_orders')({
  component: PartsOrdersComponent,
})
