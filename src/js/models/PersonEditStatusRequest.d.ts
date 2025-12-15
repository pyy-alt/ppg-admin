import PersonEditStatusRequestBase from './base/PersonEditStatusRequestBase'

/**
 * @class PersonEditStatusRequest
 * @extends PersonEditStatusRequestBase
 */
declare class PersonEditStatusRequest extends PersonEditStatusRequestBase {
  /**
   * 创建一个新的 PersonEditStatusRequest 实例
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
   * 从数组创建 PersonEditStatusRequest 实例数组
   */
  static createArray(data: any[]): PersonEditStatusRequest[]
}

export default PersonEditStatusRequest