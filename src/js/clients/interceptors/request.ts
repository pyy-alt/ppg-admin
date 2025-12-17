import type { RequestOptions } from '@quasidea/oas-client-react';

export default function requestInterceptor(options: RequestOptions): RequestOptions {
  // This line must be added！Let the browser automatically include audi_jwt Cookie
  options.credentials = 'include';

  // Ensure it is JSON（Prevent missing addition）
  if (options.body && typeof options.body === 'object') {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
  }

  return options;
}