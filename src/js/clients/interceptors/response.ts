// src/js/clients/interceptors/response.ts   ← 最终最简版
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';

export default function responseInterceptor(response: Response, handler: any): void {
  if (response.status === 401) {
    useAuthStore.getState().auth.reset()
    toast.error('Session expired, please log in again')
    window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
    return
  }

  handler(response)
}