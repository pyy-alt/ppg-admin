import { useEffect, useMemo } from 'react';
import { createFileRoute, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import type Session from '@/js/models/Session';
import { type PersonType } from '@/js/models/enum/PersonTypeEnum';
import { useAuthStore } from '@/stores/auth-store';
import { useLoadingStore } from '@/stores/loading-store';
import { Loading } from '@/components/Loading';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { HeaderOnlyLayout } from '@/components/layout/header-only-layout';
import WelcomeGate from '@/features/auth/welcomeGate';
import { Login } from '@/features/auth/login';

declare global {
  interface Window {
    switchUserType?: (type: PersonType) => void;
    getUserType?: () => PersonType | undefined;
  }
}

// ============================================================================
// Constant Definition
// ============================================================================

/** Routes without a sidebar */
const ROUTES_WITHOUT_SIDEBAR = ['/parts_orders', '/repair_orders'] as const;

/** Role Permission Configuration */
type RoleConfig = {
  /** Redirect target when accessing a forbidden route */
  forbiddenRoute: string;
  /** Default redirection target when accessing the root path. */
  defaultRoute: string;
  /** List of allowed prefix routes */
  allowedRoutes: string[];
};

const ROLE_REDIRECT_CONFIG: Record<PersonType, RoleConfig> = {
  ProgramAdministrator: {
    forbiddenRoute: '/admin/parts_orders',
    defaultRoute: '/admin/parts_orders',
    allowedRoutes: ['/admin', '/parts_orders', '/repair_orders'],
  },
  Shop: {
    forbiddenRoute: '/repair_orders',
    defaultRoute: '/repair_orders',
    allowedRoutes: ['/repair_orders'],
  },
  Csr: {
    forbiddenRoute: '/parts_orders',
    defaultRoute: '/parts_orders',
    allowedRoutes: ['/parts_orders', '/repair_orders'],
  },
  Dealership: {
    forbiddenRoute: '/parts_orders',
    defaultRoute: '/parts_orders',
    allowedRoutes: ['/parts_orders', '/repair_orders'], // Only access to the parts order list is allowed.
    // Note：Repair the order details page. /repair_orders/:id Will be processed through precondition verification.
  },
  FieldStaff: {
    forbiddenRoute: '/parts_orders',
    defaultRoute: '/parts_orders',
    allowedRoutes: ['/parts_orders'],
  },
};

// ============================================================================
// Utility function
// ============================================================================

/**
 * Determine if the path matches the allowed list.
 * @param path Current Path
 * @param allowedRoutes Allowed route prefix list
 * @returns Is access allowed?
 */
function isPathAllowed(path: string, allowedRoutes: string[]): boolean {
  if (path === '/') return false; // The root path needs to be redirected.
  return allowedRoutes.some((route) => path === route || path.startsWith(route + '/'));
}

/**
 * Get redirect target
 * @param path Current Path
 * @param userType User Type
 * @returns Redirect target or null
 */
function getRedirectTarget(path: string, userType: PersonType | undefined): string | null {
  if (!userType) return null;

  const config = ROLE_REDIRECT_CONFIG[userType];

  // If accessing the root path，Redirecting to the default route.
  if (path === '/') {
    return config.defaultRoute;
  }

  // If the path is in the allowlist，No redirection
  if (isPathAllowed(path, config.allowedRoutes)) {
    return null;
  }

  // Other situations are redirected to the forbidden route.（That is the default route.）
  return config.forbiddenRoute;
}

/**
 * Set up debugging tools in development mode.
 * @param auth User data in the certified storage.
 */
function setupDevTools(auth: any): void {
  if (!import.meta.env.DEV || !auth.user) return;

  window.switchUserType = (type: PersonType) => {
    if (!auth.user?.person) return;

    const updatedPerson = {
      ...auth.user.person,
      type: type,
    };

    const mockSession = {
      guid: auth.user.guid,
      person: updatedPerson,
      hash: auth.user.hash,
    } as Session;

    auth.setUser(mockSession);
    console.log(`[DevTools] User type has been switched to: ${type}`);
  };

  window.getUserType = () => {
    const type = auth.user?.person?.type;
    console.log('[DevTools] Current user type:', type);
    return type;
  };
}

function AuthenticatedRouteComponent() {
  const { auth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoading = useLoadingStore((state) => state.isLoading);
  const userType = auth.user?.person?.type;
  const isAdmin = userType === 'ProgramAdministrator';

  // ============================================================================
  // Development Model：Set up debugging tools
  // ============================================================================
  useEffect(() => {
    setupDevTools(auth);
  }, [auth]);

  // ============================================================================
  // Routing Redirection Logic
  // ============================================================================
  useEffect(() => {
    // If checking the certification status or unverified.，Then do not process the redirection.
    if (auth.loginStatus === 'checking' || auth.loginStatus !== 'authenticated') {
      return;
    }

    const redirectTarget = getRedirectTarget(location.pathname, userType);
    if (redirectTarget) {
      navigate({ to: redirectTarget, replace: true });
    }
  }, [auth.loginStatus, userType, location.pathname, navigate]);

  // ============================================================================
  // Calculate derived states.
  // ============================================================================

  /**
   * Are you being redirected?
   * When users access illegal routes，Will be redirected.，At this moment, the loading screen is displayed.
   */
  const isRedirecting = useMemo(() => {
    if (auth.loginStatus !== 'authenticated') return false;
    return getRedirectTarget(location.pathname, userType) !== null;
  }, [auth.loginStatus, location.pathname, userType]);

  /**
   * Is a sidebar needed?
   * Only specific routes do not require a sidebar.
   */
  const needsSidebar = useMemo(() => {
    return !ROUTES_WITHOUT_SIDEBAR.some(
      (route) => location.pathname === route || location.pathname.startsWith(route + '/')
    );
  }, [location.pathname]);

  // ============================================================================
  // Rendering logic
  // ============================================================================

  // 1. Checking certification status，Show loading interface
  if (auth.loginStatus === 'checking') {
    return <Loading />;
  }

  // 2. Unverified，Display login page
  if (auth.loginStatus !== 'authenticated') {
    // navigate({ to: '/login', replace: true });
    // return <Loading />;
    return <WelcomeGate />
  }

  // 3. Redirecting，Display loading interface
  if (isRedirecting) {
    return <Loading />;
  }

  // ============================================================================
  // 4. Rendering layout
  // ============================================================================

  // Determine the layout to be used.：Only routes that require a sidebar and are for administrators use the full layout.
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

      {/* Global loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <Loading />
        </div>
      )}
    </>
  );
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    // Attention：Do not check the certification status here.，Because：
    // 1. Cookie Yes HttpOnly，The front end cannot read.
    // 2. InitAuth It is asynchronous.，Needs time to verify.
    // 3. Let the component layer handle authentication checks and redirection.，Can be updated responsively.
    // If not logged in，Zilu will handle the redirection.
  },
  component: AuthenticatedRouteComponent,
});
