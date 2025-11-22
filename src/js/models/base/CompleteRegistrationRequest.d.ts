import CompleteRegistrationRequestBase from './base/CompleteRegistrationRequestBase'

declare class CompleteRegistrationRequest extends CompleteRegistrationRequestBase {
  static create(data: any): CompleteRegistrationRequest
  static createArray(data: any[]): CompleteRegistrationRequest[]
}

export default CompleteRegistrationRequest