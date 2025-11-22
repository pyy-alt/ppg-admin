import ModelBaseClass from '@quasidea/oas-client-react/lib/ModelBaseClass'
import type UpdatePasswordRequest from '../UpdatePasswordRequest'

declare class UpdatePasswordRequestBase extends ModelBaseClass {
  currentPassword?: string
  newPassword?: string

  static create(genericObject: { currentPassword?: string; newPassword?: string }): UpdatePasswordRequest
  static createArray(genericArray: { currentPassword?: string; newPassword?: string }[] | null): UpdatePasswordRequest[] | null
}

export default UpdatePasswordRequestBase

