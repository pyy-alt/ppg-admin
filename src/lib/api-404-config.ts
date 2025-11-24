/**
 * 定义哪些接口的 404 错误需要跳转到登录页
 * 这些通常是认证相关的接口，404 表示会话不存在
 */
export const AUTH_REQUIRED_404_PATHS = [
    '/authentication/session/current',
    // 可以添加其他需要认证的接口
    // '/authentication/session/validate',
  ]
  
  /**
   * 检查给定的 URL 是否在需要跳转登录的白名单中
   */
  export function shouldRedirectToLoginOn404(url: string): boolean {
    // 移除基础 URL，只保留路径部分
    const path = url.replace(/^https?:\/\/[^/]+/, '')
    return AUTH_REQUIRED_404_PATHS.some((pattern) => path.includes(pattern))
  }