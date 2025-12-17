/**
 * Site Configuration
 * Get current site identifier from environment variables
 */

/**
 * Get site identifier (Site Token)
 * From environment variables VITE_SITE_TOKEN Read，Default is 'audi'
 */
export function getSiteToken(): string {
  return import.meta.env.VITE_SITE_TOKEN || 'audi'
}

/**
 * Get JWT Cookie Name
 * Format：{siteToken}_jwt
 * For example：audi_jwt, vw_jwt, audica_jwt, vwca_jwt
 */
export function getJwtCookieName(): string {
  const siteToken = getSiteToken()
  return `${siteToken}_jwt`
}

/**
 * Get language Cookie Name
 */
export function getLanguageCookieName(): string {
  return 'lang'
}

