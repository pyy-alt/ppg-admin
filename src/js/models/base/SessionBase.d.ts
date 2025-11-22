import type Person from '../Person'
import type Region from '../Region'

declare class SessionBase {
  guid?: string
  person?: Person
  hash?: string
  ipAddress?: string
  dateLastAccess?: Date
  dateCreated?: Date
  shopStatuses?: string[]
  shopCertifications?: string[]
  regions?: Region[]
  // 注意：JWT 不在响应体中，而是通过 Set-Cookie 响应头自动设置到浏览器 Cookie

  static create(data: any): SessionBase
  static createArray(data: any[]): SessionBase[]
}

export default SessionBase

