/**
 * 站点配置
 * 根据环境变量获取当前站点标识
 */

/**
 * 获取站点标识 (Site Token)
 * 从环境变量 VITE_SITE_TOKEN 读取，默认为 'audi'
 */
export function getSiteToken(): string {
  return import.meta.env.VITE_SITE_TOKEN || 'audi'
}

/**
 * 获取 JWT Cookie 名称
 * 格式：{siteToken}_jwt
 * 例如：audi_jwt, vw_jwt, audica_jwt, vwca_jwt
 */
export function getJwtCookieName(): string {
  const siteToken = getSiteToken()
  return `${siteToken}_jwt`
}

/**
 * 获取语言 Cookie 名称
 */
export function getLanguageCookieName(): string {
  return 'lang'
}

