/**
 * Define which interfaces 404 Error requires redirecting to the login page
 * These are usually authentication-related interfaces，404 Indicates that the session does not exist
 */
export const AUTH_REQUIRED_404_PATHS = [
    '/authentication/session/current',
    // You can add other interfaces that require authentication
    // '/authentication/session/validate',
  ]
  
  /**
   * Check the given URL Whether it is in the whitelist for login redirection
   */
  export function shouldRedirectToLoginOn404(url: string): boolean {
    // Remove base URL，Keep only the path part
    const path = url.replace(/^https?:\/\/[^/]+/, '')
    return AUTH_REQUIRED_404_PATHS.some((pattern) => path.includes(pattern))
  }