import type { RequestOptions } from '@quasidea/oas-client-react';

export default function requestInterceptor(options: RequestOptions): RequestOptions {
  // 必须加这行！让浏览器自动带上 audi_jwt Cookie
  options.credentials = 'include';

  // 确保是 JSON（防止漏加）
  if (options.body && typeof options.body === 'object') {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
  }

  return options;
}