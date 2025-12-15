import RepairOrderSearchRequestBase from './base/RepairOrderSearchRequestBase';

/**
 * @class RepairOrderSearchRequest
 * @extends RepairOrderSearchRequestBase
 */
declare class RepairOrderSearchRequest extends RepairOrderSearchRequestBase {
  static create(data: {
    shopId: number;
    smartFilter?: string;
    filterByStatus?: string;
    showRepairCompleted?: boolean;
    dateLastSubmittedFrom?: Date;
    dateLastSubmittedTo?: Date;
    resultParameter?: any;
  }): RepairOrderSearchRequest;
  
}

export default RepairOrderSearchRequest;