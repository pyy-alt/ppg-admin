import CompleteRegistrationRequestBase from './base/CompleteRegistrationRequestBase'

declare class CompleteRegistrationRequest extends CompleteRegistrationRequestBase {
  firstName?: string
  lastName?: string
  newPassword?: string

  static create(data: {
    firstName?: string
    lastName?: string
    newPassword?: string
  }): CompleteRegistrationRequest
  static createArray(data: {
    firstName?: string
    lastName?: string
    newPassword?: string
  }[]): CompleteRegistrationRequest[]
}

export default CompleteRegistrationRequest
