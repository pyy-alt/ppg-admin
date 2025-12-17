import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useAuthenticated } from '@/hooks/use-authenticated'
import { Loading } from '@/components/Loading'
import { RepairOrderList } from '@/features/repair/orders'

function RepairOrdersComponent() {
  const { isAuthenticated, isLoading } = useAuthenticated()
  const location = useLocation() // ✅ Add this line.
  if (isLoading || !isAuthenticated) {
    return <Loading />
  }

  // If the path matches exactly /repair_orders，Show list
  // Otherwise（As /repair_orders/1），Render sub-routes（Through Outlet）
  if (location.pathname === '/repair_orders') {
    return <RepairOrderList />
  }

  // Render sub-routes（$id）
  return <Outlet />
}

export const Route = createFileRoute('/_authenticated/repair_orders')({
  component: RepairOrdersComponent,
})
