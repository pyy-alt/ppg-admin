import SessionBase from './base/SessionBase'

declare class Session extends SessionBase {
  static create(data: any): Session
  static createArray(data: any[]): Session[]
}

export default Session

