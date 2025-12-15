declare const PartsOrderWorkflowActionRequestActionEnum: {
  readonly APPROVED: 'Approved'
  readonly REJECTED: 'Rejected'
  readonly RESUBMITTED: 'Resubmitted'
  readonly SHIPPED: 'Shipped'
  readonly UNSHIPPED: 'Unshipped'
  readonly RECEIVED: 'Received'
  readonly UNRECEIVED: 'Unreceived'
}

export default PartsOrderWorkflowActionRequestActionEnum

export type PartsOrderWorkflowActionRequestAction =
  | 'Approved'
  | 'Rejected'
  | 'Resubmitted'
  | 'Shipped'
  | 'Unshipped'
  | 'Received'
  | 'Unreceived'
