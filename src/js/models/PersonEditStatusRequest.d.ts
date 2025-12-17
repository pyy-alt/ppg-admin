import PersonEditStatusRequestBase from './base/PersonEditStatusRequestBase'

/**
 * @class PersonEditStatusRequest
 * @extends PersonEditStatusRequestBase
 */
declare class PersonEditStatusRequest extends PersonEditStatusRequestBase {
  /**
   * Create a new PersonEditStatusRequest instance
   */
  static create(data: {
    personId: number
    action:
      | 'Deactivate'
      | 'Reactivate'
      | 'ApproveRegistrationRequest'
      | 'DeclineRegistrationRequest'
  }): PersonEditStatusRequest

  /**
   * Create from array PersonEditStatusRequest instance array
   */
  static createArray(data: any[]): PersonEditStatusRequest[]
}

export default PersonEditStatusRequest