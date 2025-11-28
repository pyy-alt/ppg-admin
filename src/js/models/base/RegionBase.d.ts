declare class RegionBase {
  id?: number
  name?: string

  static create(data: any): RegionBase
  static createArray(data: any[]): RegionBase[]
}

export default RegionBase


