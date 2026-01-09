import { type QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import InitAuth from '@/main';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Toaster } from '@/components/ui/sonner';
import { NavigationProgress } from '@/components/navigation-progress';
import { GeneralError } from '@/features/errors/general-error';
import { NotFoundError } from '@/features/errors/not-found-error';

// import { Global404Dialog } from '@/components/global-404-dialog'
import { BrandProvider, useBrand } from '../context/brand-context';
import { useEffect } from 'react';
import audiImg from '@/assets/img/audi.png';
import vwImg from '@/assets/img/vw.png';

function FaviconInitializer() {
  const { brand } = useBrand();

  useEffect(() => {
    const icon = brand === 'vw' ? vwImg : audiImg;
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (link) {
      link.href = icon;
    }
  }, [brand]); // 依赖 brand，确保品牌变化时更新（虽然通常不会变）

  return null; // 不渲染任何内容
}

function TitleInitializer() {
  const { brand } = useBrand();

  useEffect(() => {
    // Determine locale from URL or browser
    const isCanadian = window.location.hostname.includes('.ca') || 
                       navigator.language.toLowerCase().includes('ca');
    
    let title = '';
    if (brand === 'vw') {
      title = isCanadian ? 'VW CA Restricted Parts Tracker' : 'VW Restricted Parts Tracker';
    } else {
      title = isCanadian ? 'Audi CA Restricted Parts Tracker' : 'Audi Restricted Parts Tracker';
    }
    
    document.title = title;
  }, [brand]);

  return null;
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => {
    return (
      <>
        <BrandProvider>
          <InitAuth />
          <FaviconInitializer />
          <TitleInitializer />
          {/* In */}
          {/* <Global404Dialog /> */}
          <NavigationProgress />

          <Outlet />
          <Toaster duration={5000} />
          {import.meta.env.MODE === 'development' && (
            <>
              <ReactQueryDevtools buttonPosition="bottom-left" />
              <TanStackRouterDevtools position="bottom-right" />
            </>
          )}
        </BrandProvider>
      </>
    );
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
});
