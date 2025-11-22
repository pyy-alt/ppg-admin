import { Outlet } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { SearchProvider } from '@/context/search-provider'
import { LayoutProvider } from '@/context/layout-provider'

type HeaderOnlyLayoutProps = {
  children?: React.ReactNode
}

export function HeaderOnlyLayout({ children }: HeaderOnlyLayoutProps) {
  return (
    <SearchProvider>
      <LayoutProvider>
        {/* Header - 固定在顶部 */}
        <Header fixed />
        {/* Main Content - 从 Header 下方开始，全宽显示 */}
        <main className="pt-8 min-h-screen">
          {children ?? <Outlet />}
        </main>
      </LayoutProvider>
    </SearchProvider>
  )
}