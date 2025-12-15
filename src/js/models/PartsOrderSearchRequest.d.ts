import PartsOrderSearchRequestBase from './base/PartsOrderSearchRequestBase';

/**
 * @class PartsOrderSearchRequest
 * @extends PartsOrderSearchRequestBase
 */
declare class PartsOrderSearchRequest extends PartsOrderSearchRequestBase {
  static create(data: {
    shopId: number;
    smartFilter?: string;
    filterByStatus?: string;
    showRepairCompleted?: boolean;
    dateLastSubmittedFrom?: Date;
    dateLastSubmittedTo?: Date;
    resultParameter?: any;
  }): PartsOrderSearchRequest;
}

export default PartsOrderSearchRequest;