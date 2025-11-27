import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';

export default function responseInterceptor(response: Response, handler: any, url?: string): void {
  console.log('Response url:', url);
  if (response.status === 401) {
    useAuthStore.getState().auth.reset()

  
    // 检查当前路径是否是未认证路由
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

    // 如果在未认证路由页面，不跳转
    if (isUnauthenticatedRoute) {
      return
    }

    // 如果不在未认证路由列表中，说明是受保护路由
    // 父路由已经处理了未认证情况，会显示 WelcomeGate，不需要跳转到登录页
    return

    toast.error('Session expired, please log in again')
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
    return
  }
  // 404 处理移到 onApiProcessResponse 中，因为那里可以获取 URL
  handler(response)
}