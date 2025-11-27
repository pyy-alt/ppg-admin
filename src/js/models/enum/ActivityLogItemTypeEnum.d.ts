declare const ActivityLogItemTypeEnum: {
  readonly SUBMITTED: 'Submitted'
  readonly APPROVED: 'Approved'
  readonly REJECTED: 'Rejected'
  readonly RESUBMITTED: 'Resubmitted'
  readonly SHIPPED: 'Shipped'
  readonly UNSHIPPED: 'Unshipped'
  readonly RECEIVED: 'Received'
  readonly UNRECEIVED: 'Unreceived'
}

export default ActivityLogItemTypeEnum

export type ActivityLogItemType =
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'Resubmitted'
  | 'Shipped'
  | 'Unshipped'
  | 'Received'
  | 'Unreceived'
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

