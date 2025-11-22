import ModelBaseClass from '@quasidea/oas-client-react/lib/ModelBaseClass'
import type CompleteRegistrationRequest from '../CompleteRegistrationRequest'

declare class CompleteRegistrationRequestBase extends ModelBaseClass {
  firstName?: string
  lastName?: string
  newPassword?: string

  static create(genericObject: {
    firstName?: string
    lastName?: string
    newPassword?: string
  }): CompleteRegistrationRequest
  static createArray(
    genericArray: {
      firstName?: string
      lastName?: string
      newPassword?: string
    }[] | null
  ): CompleteRegistrationRequest[] | null
}

export default CompleteRegistrationRequestBase