declare const PartsOrderStageEnum: {
  readonly ORDER_REVIEW: 'OrderReview'
  readonly ORDER_FULFILLMENT: 'OrderFulfillment'
  readonly ORDER_RECEIVED: 'OrderReceived'
  readonly REPAIR_COMPLETED: 'RepairCompleted'
}

export default PartsOrderStageEnum

export type PartsOrderStage =
  | 'OrderReview'
  | 'OrderFulfillment'
  | 'OrderReceived'
  | 'RepairCompleted'
