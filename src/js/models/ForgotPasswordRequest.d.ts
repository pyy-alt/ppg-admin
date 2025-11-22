import ForgotPasswordRequestBase from './base/ForgotPasswordRequestBase'

declare class ForgotPasswordRequest extends ForgotPasswordRequestBase {
  email?: string

  static create(data: { email?: string }): ForgotPasswordRequest
  static createArray(data: { email?: string }[]): ForgotPasswordRequest[]
}

export default ForgotPasswordRequest

