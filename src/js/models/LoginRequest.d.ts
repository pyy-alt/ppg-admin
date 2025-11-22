import LoginRequestBase from './base/LoginRequestBase'

declare class LoginRequest extends LoginRequestBase {
  static create(data: any): LoginRequest
  static createArray(data: any[]): LoginRequest[]
}

export default LoginRequest

