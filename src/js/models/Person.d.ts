import PersonBase from './base/PersonBase'

declare class Person extends PersonBase {
  static create(data: any): Person
  static createArray(data: any[]): Person[]
}

export default Person

