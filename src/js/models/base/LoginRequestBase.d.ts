declare class LoginRequestBase {
  email: string
  password: string

  static create(data: any): LoginRequestBase
  static createArray(data: any[]): LoginRequestBase[]
}

export default LoginRequestBase

