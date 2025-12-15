declare const PartsOrderSearchRequestFilterByStatusEnum: {
  readonly CSR_REVIEW: 'CsrReview'
  readonly CSR_REJECTED: 'CsrRejected'
  readonly DEALERSHIP_PROCESSING: 'DealershipProcessing'
  readonly DEALERSHIP_SHIPPED: 'DealershipShipped'
  readonly SHOP_RECEIVED: 'ShopReceived'
  readonly REPAIR_COMPLETED: 'RepairCompleted'
}

export default PartsOrderSearchRequestFilterByStatusEnum

export type PartsOrderSearchRequestFilterByStatus =
  | 'CsrReview'
  | 'CsrRejected'
  | 'DealershipProcessing'
  | 'DealershipShipped'
  | 'ShopReceived'
  | 'RepairCompleted'
