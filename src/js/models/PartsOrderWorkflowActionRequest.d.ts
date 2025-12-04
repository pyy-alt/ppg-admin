import PartsOrderWorkflowActionRequestBase from './base/PartsOrderWorkflowActionRequestBase';

/**
 * @class PartsOrderWorkflowActionRequest
 * @extends PartsOrderWorkflowActionRequestBase
 */
declare class PartsOrderWorkflowActionRequest extends PartsOrderWorkflowActionRequestBase {

  partsOrderId: number
  action: string
  salesOrderNumber?: string
  comment?: string
  dateCreated?: Date
  dateUpdated?: Date
  createdByPersonId?: number
  updatedByPersonId?: number
  createdByPerson?: Person
  updatedByPerson?: Person
  partsOrder?: PartsOrder
  static create(genericObject: any): PartsOrderWorkflowActionRequest;
  static createArray(genericArray: any[]): PartsOrderWorkflowActionRequest[];
}

export default PartsOrderWorkflowActionRequest;