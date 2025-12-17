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
  // Attention：JWT Not in the response body，But through Set-Cookie Automatically set to the browser in the response header Cookie

  static create(data: any): SessionBase
  static createArray(data: any[]): SessionBase[]
}

export default SessionBase

