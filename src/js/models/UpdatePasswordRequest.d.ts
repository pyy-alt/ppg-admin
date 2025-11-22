import UpdatePasswordRequestBase from './base/UpdatePasswordRequestBase'

declare class UpdatePasswordRequest extends UpdatePasswordRequestBase {
  currentPassword?: string
  newPassword?: string

  static create(data: { currentPassword?: string; newPassword?: string }): UpdatePasswordRequest
  static createArray(data: { currentPassword?: string; newPassword?: string }[]): UpdatePasswordRequest[]
}

export default UpdatePasswordRequest

