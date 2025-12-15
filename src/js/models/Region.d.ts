import RegionBase from './base/RegionBase'

declare class Region extends RegionBase {
  id?: number  // ✅ 显式声明属性
  name?: string  // ✅ 显式声明属性
  
  static create(data: any): Region
  static createArray(data: any[]): Region[]
}

export default Region

