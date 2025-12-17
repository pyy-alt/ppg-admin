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
        {/* Header - Fixed at the top */}
        <Header fixed />
        {/* Main Content - From Header Start from below，Full width display */}
        <main className="pt-8 min-h-screen">
          {children ?? <Outlet />}
        </main>
      </LayoutProvider>
    </SearchProvider>
  )
}