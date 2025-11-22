import ModelBaseClass from '@quasidea/oas-client-react/lib/ModelBaseClass'
import type ForgotPasswordRequest from '../ForgotPasswordRequest'

declare class ForgotPasswordRequestBase extends ModelBaseClass {
  email?: string

  static create(genericObject: { email?: string }): ForgotPasswordRequest
  static createArray(genericArray: { email?: string }[] | null): ForgotPasswordRequest[] | null
}

export default ForgotPasswordRequestBase

