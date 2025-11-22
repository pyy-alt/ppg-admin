import RegistrationRequestBase from './base/RegistrationRequestBase'

declare class RegistrationRequest extends RegistrationRequestBase {
  static create(data: any): RegistrationRequest
  static createArray(data: any[]): RegistrationRequest[]
}

export default RegistrationRequest