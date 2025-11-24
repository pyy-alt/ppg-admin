import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';

export default function responseInterceptor(response: Response, handler: any, url?: string): void {
  console.log('Response url:', url);
  if (response.status === 401) {
    useAuthStore.getState().auth.reset()
    toast.error('Session expired, please log in again')
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
    return
  }
  // 404 处理移到 onApiProcessResponse 中，因为那里可以获取 URL

  handler(response)
}