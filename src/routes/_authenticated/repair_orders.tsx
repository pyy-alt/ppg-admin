import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useAuthenticated } from '@/hooks/use-authenticated'
import { Loading } from '@/components/Loading'
import { RepairOrderList } from '@/features/repair/orders'

function RepairOrdersComponent() {
  const { isAuthenticated, isLoading } = useAuthenticated()
  const location = useLocation() // ✅ 添加这行
  if (isLoading || !isAuthenticated) {
    return <Loading />
  }

  // 如果路径精确匹配 /repair_orders，显示列表
  // 否则（如 /repair_orders/1），渲染子路由（通过 Outlet）
  if (location.pathname === '/repair_orders') {
    return <RepairOrderList />
  }

  // 渲染子路由（$id）
  return <Outlet />
}

export const Route = createFileRoute('/_authenticated/repair_orders')({
  component: RepairOrdersComponent,
})
