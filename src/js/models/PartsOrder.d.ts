import PartsOrderBase from './base/PartsOrderBase';

/**
 * @class PartsOrder
 * @extends PartsOrderBase
 */
declare class PartsOrder extends PartsOrderBase {
  static create(data: {
    id: number;
    partsOrderNumber: number;
    stage: 'OrderReview' | 'OrderFulfillment' | 'OrderReceived' | 'RepairCompleted';
    status: 'CsrReview' | 'CsrRejected' | 'DealershipProcessing' | 'DealershipShipped' | 'ShopReceived' | 'RepairCompleted';
    parts: string[];
    approvalFlag: boolean;
    salesOrderNumber: string;
  }): PartsOrder;

  static createArray(data: any[]): PartsOrder[];
}

export default PartsOrder;