import RegionBase from './base/RegionBase'

declare class Region extends RegionBase {
  id?: number  // ✅ Explicitly declare properties
  name?: string  // ✅ Explicitly declare properties
  
  static create(data: any): Region
  static createArray(data: any[]): Region[]
}

export default Region

