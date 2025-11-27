declare const PersonStatusEnum: {
  readonly ACTIVE: 'Active'
  readonly INACTIVE: 'Inactive'
  readonly REGISTRATION_REQUESTED: 'RegistrationRequested'
  readonly PENDING: 'Pending'
}

export default PersonStatusEnum

export type PersonStatus =
  | 'Active'
  | 'Inactive'
  | 'RegistrationRequested'
  | 'Pending'
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

