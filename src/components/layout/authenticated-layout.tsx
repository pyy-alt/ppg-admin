import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          {/* Header - Fixed at the top，Displayed on all pages */}
          <Header fixed />
          {/* Sidebar - Left sidebar */}
          <AppSidebar />
          {/* Main Content - From Header Start from below */}
          <SidebarInset
            className={cn(
              // Set content container, so we can use container queries
              '@container/content',
              // From Header Start from below，Height and sidebar consistent
              'pt-16 h-[calc(100vh-64px)]',

              // If layout is fixed, set the height
              // to 100vh - header height to prevent overflow
              'has-data-[layout=fixed]:h-[calc(100vh-64px)]',

              // If layout is fixed and sidebar is inset,
              // set the height to 100vh - header - spacing (total margins) to prevent overflow
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100vh-64px-(var(--spacing)*4))]',
              'h-full'
            )}
          >
            {children ?? <Outlet />}
          </SidebarInset>
        </SidebarProvider>
        
      </LayoutProvider>
    </SearchProvider>
  )
}
