import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';

export default function responseInterceptor(response: Response, handler: any, url?: string): void {
  console.log('Response url:', url);
  if (response.status === 401) {
    useAuthStore.getState().auth.reset()

  
    // Check if the current path is an unauthenticated route
    const currentPath = window.location.pathname
    const unauthenticatedRoutes = [
      '/login',
      '/password/forgot',
      '/password/reset',
      '/registration/shop',
      '/registration/dealership',
      '/registration/complete',
      '/registrationResult',
    ]
    
    const isUnauthenticatedRoute = unauthenticatedRoutes.some(
      (route) =>
        currentPath === route || currentPath.startsWith(route + '/')
    )

    // If on an unauthenticated route page，Do not redirect
    if (isUnauthenticatedRoute) {
      return
    }

    // If not in the unauthenticated route list，It indicates a protected route
    // The parent route has handled the unauthenticated case，Will display WelcomeGate，No need to redirect to the login page
    return

    toast.error('Session expired, please log in again')
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
    return
  }
  // 404 Move handling to onApiProcessResponse in，Because it can be obtained there URL
  handler(response)
}