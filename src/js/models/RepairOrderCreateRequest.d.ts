import RepairOrderCreateRequestBase from './base/RepairOrderCreateRequestBase';
import RepairOrder from './RepairOrder';
import PartsOrder from './PartsOrder';

/**
 * @class RepairOrderCreateRequest
 * @extends RepairOrderCreateRequestBase
 */
declare class RepairOrderCreateRequest extends RepairOrderCreateRequestBase {
  /**
   * @type {RepairOrder} repairOrder
   */
  repairOrder: RepairOrder;

  /**
   * @type {PartsOrder} partsOrder
   */
  partsOrder: PartsOrder;

  /**
   * Instantiates a new instance of RepairOrderCreateRequest based on the generic object being passed in (typically from a JSON object)
   * @param {object} genericObject
   * @return {RepairOrderCreateRequest}
   */
  static create(genericObject: any): RepairOrderCreateRequest;

  /**
   * Instantiates a new array of RepairOrderCreateRequest based on the generic array being passed in (typically from a JSON array)
   * @param {[object]} genericArray
   * @return {[RepairOrderCreateRequest]}
   */
  static createArray(genericArray: any[]): RepairOrderCreateRequest[];
}

export default RepairOrderCreateRequest;