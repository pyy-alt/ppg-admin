import type Organization from '../Organization'
import type Region from '../Region'
import type RegistrationRequest from '../RegistrationRequest'

type PersonStatus = 'Active' | 'Inactive' | 'RegistrationRequested' | 'Pending'
type PersonType = 'Shop' | 'Dealership' | 'Csr' | 'FieldStaff' | 'ProgramAdministrator'

declare class PersonBase {
  id?: number
  status?: PersonStatus
  type?: PersonType
  email?: string
  firstName?: string
  lastName?: string
  shop?: Organization
  dealership?: Organization
  csrRegion?: Region
  fieldStaffRegions?: Region[]
  registrationRequest?: RegistrationRequest
  dateApproved?: Date | string
  dateConfirmed?: Date | string
  dateLastAccess?: Date | string
  dateCreated?: Date | string

  static create(data: any): PersonBase
  static createArray(data: any[]): PersonBase[]
}

export default PersonBase

