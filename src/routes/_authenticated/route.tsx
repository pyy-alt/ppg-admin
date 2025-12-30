import { useEffect, useMemo } from 'react';
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router';
import type Session from '@/js/models/Session';
import { type PersonType } from '@/js/models/enum/PersonTypeEnum';
import { useAuthStore } from '@/stores/auth-store';
import { useLoadingStore } from '@/stores/loading-store';
import { Loading } from '@/components/Loading';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { HeaderOnlyLayout } from '@/components/layout/header-only-layout';
import WelcomeGate from '@/features/auth/welcomeGate';

declare global {
  interface Window {
    switchUserType?: (type: PersonType) => void;
    getUserType?: () => PersonType | undefined;
  }
}

const ROUTES_WITHOUT_SIDEBAR = ['/parts_orders'] as const;

const getRedirectTarget = (
  path: string,
  userType: PersonType | undefined,
): string | null => {
  if (!userType) return null;

  // 根路径统一处理
  if (path === '/') {
    switch (userType) {
      case 'ProgramAdministrator':
        return '/admin/parts_orders';
      case 'Shop':
        return '/repair_orders';
      default:
        return '/parts_orders';
    }
  }

  // ProgramAdministrator：特殊路径转换
  if (userType === 'ProgramAdministrator') {
    if (path === '/parts_orders' || path.startsWith('/parts_orders/')) {
      return '/admin/parts_orders';
    }
    return null;
  }

  // Shop：禁止零件订单和管理员页面，允许维修单及其详情
  if (userType === 'Shop') {
    if (
      path.startsWith('/parts_orders/') ||
      path === '/parts_orders' ||
      path.startsWith('/admin/')
    ) {
      return '/repair_orders';
    }
    return null;
  }

  // Csr & Dealership：允许维修单详情，禁止直接访问列表以外的路径
  if (userType === 'Csr' || userType === 'Dealership') {
    if (path.startsWith('/repair_orders/')) {
      return null; // 允许直接访问详情页
    }
    if (
      path === '/repair_orders' ||
      path.startsWith('/admin/') ||
      path.startsWith('/parts_orders/')
    ) {
      return '/parts_orders';
    }
    return null;
  }

  // FieldStaff：严格限制在零件订单
  if (userType === 'FieldStaff') {
    if (
      path.startsWith('/repair_orders/') ||
      path === '/repair_orders' ||
      path.startsWith('/admin/')
    ) {
      return '/parts_orders';
    }
    return null;
  }

  // 其他未知角色默认导向零件订单
  if (path.startsWith('/admin/')) {
    return '/parts_orders';
  }
  return null;
};

function setupDevTools(auth: any): void {
  if (!import.meta.env.DEV || !auth.user?.person) return;

  window.switchUserType = (type: PersonType) => {
    const updatedPerson = { ...auth.user!.person, type };
    const mockSession = {
      guid: auth.user!.guid,
      person: updatedPerson,
      hash: auth.user!.hash,
    } as Session;
    auth.setUser(mockSession);
    console.log(`[DevTools] 用户类型已切换为: ${type}`);
  };

  window.getUserType = () => auth.user?.person?.type;
}

function AuthenticatedRouteComponent() {
  const { auth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoading = useLoadingStore((state) => state.isLoading);
  const userType = auth.user?.person?.type;
  const isAdmin = userType === 'ProgramAdministrator';

  useEffect(() => {
    setupDevTools(auth);
  }, [auth.user]);

  useEffect(() => {
    if (auth.loginStatus === 'checking' || auth.loginStatus !== 'authenticated') {
      return;
    }

    const target = getRedirectTarget(location.pathname, userType);
    if (target) {
      navigate({ to: target, replace: true });
    }
  }, [auth.loginStatus, userType, location.pathname, navigate]);

  const isRedirecting = useMemo(() => {
    return (
      auth.loginStatus === 'authenticated' &&
      getRedirectTarget(location.pathname, userType) !== null
    );
  }, [auth.loginStatus, location.pathname, userType]);

  const needsSidebar = useMemo(() => {
    return !ROUTES_WITHOUT_SIDEBAR.some(
      (route) => location.pathname === route || location.pathname.startsWith(`${route}/`),
    );
  }, [location.pathname]);

  if (auth.loginStatus === 'checking') {
    return <Loading />;
  }

  if (auth.loginStatus !== 'authenticated') {
    return <WelcomeGate />;
  }

  if (isRedirecting) {
    return <Loading />;
  }

  const useFullLayout = isAdmin && needsSidebar;

  return (
    <>
      {useFullLayout ? (
        <AuthenticatedLayout />
      ) : (
        <HeaderOnlyLayout>
          <Outlet />
        </HeaderOnlyLayout>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <Loading />
        </div>
      )}
    </>
  );
}

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedRouteComponent,
});