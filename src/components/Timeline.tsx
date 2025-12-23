// src/components/Timeline.tsx
import { Check, X } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const STAGES = [
  'OrderReview',
  'OrderFulfillment',
  'OrderReceived',
  'RepairCompleted',
] as const
const STATUSES = [
  'CsrReview',
  'CsrRejected',
  'DealershipProcessing',
  'DealershipShipped',
  'ShopReceived',
  'RepairCompleted',
] as const

type Stage = (typeof STAGES)[number]
type Status = (typeof STATUSES)[number]
type PersonType =
  | 'Shop'
  | 'Csr'
  | 'Dealership'
  | 'ProgramAdministrator'
  | 'FieldStaff'

type ActivityLogItem = {
  type?:
    | 'Submitted'
    | 'Approved'
    | 'Rejected'
    | 'Resubmitted'
    | 'Shipped'
    | 'Unshipped'
    | 'Received'
    | 'Unreceived'
  comment?: string | null
  person?: { firstName?: string; lastName?: string } | null
  dateCreated?: Date | string | null
} | null
interface TimelineProps {
  partsOrder?: {
    stage?: Stage
    status?: Status
    approvalFlag?: boolean | null
    dateSubmitted?: Date | string | null
    dateReviewed?: Date | string | null
    dateShipped?: Date | string | null
    dateReceived?: Date | string | null
    submittedByPerson?: { firstName?: string; lastName?: string } | null
    reviewedByPerson?: { firstName?: string; lastName?: string } | null
    shippedByPerson?: { firstName?: string; lastName?: string } | null
    receivedByPerson?: { firstName?: string; lastName?: string } | null
    orderReviewActivityLogItems?: ActivityLogItem[]
    orderFulfillmentActivityLogItems?: ActivityLogItem[]
    orderReceivedActivityLogItems?: ActivityLogItem[]
  }
  onResubmit?: () => void | Promise<void>
  onMarkShipped?: (status: Status) => void | Promise<void>
  onMarkReceived?: (status: Status) => void | Promise<void>
  onApprove?: () => void | Promise<void>
  onReject?: () => void | Promise<void>
}

// ✅ Internal Status Type（Used for Timeline Display）
type TimelineItemStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'waiting'
  | 'completed'

interface TimelineItem {
  id: number
  stage: Stage
  title: string
  status: TimelineItemStatus
  date?: Date | string | null
  by?: string
  canApprove?: boolean
  canReject?: boolean
}

// Format Date and Time
const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format Person's Name
const formatPersonName = (
  person: { firstName?: string; lastName?: string } | null | undefined
): string => {
  if (!person) return ''
  return `${person.firstName || ''} ${person.lastName || ''}`.trim()
}

export function Timeline({
  partsOrder,
  onResubmit,
  onMarkReceived,
  onMarkShipped,
  onApprove,
  onReject,
}: TimelineProps) {
  // ✅ Get Current User Role
  const { auth } = useAuthStore()
  const userType = auth.user?.person?.type as PersonType | undefined

  if (!partsOrder) {
    return (
      <Card className='p-6'>
        <h2 className='mb-6 text-2xl font-bold'>Parts Tracker</h2>
        <p className='text-muted-foreground text-sm'>
          No parts order data available
        </p>
      </Card>
    )
  }

  const {
    stage,
    status,
    approvalFlag,
    dateSubmitted,
    dateReviewed,
    dateShipped,
    dateReceived,
    submittedByPerson,
    reviewedByPerson,
    shippedByPerson,
    receivedByPerson,
    orderReviewActivityLogItems,
    orderFulfillmentActivityLogItems,
    orderReceivedActivityLogItems,
  } = partsOrder

  // From ActivityLogItems Extract Information
  const getActivityLogInfo = () => {
    const logList =
      orderReviewActivityLogItems && orderReviewActivityLogItems?.length > 0
        ? orderReviewActivityLogItems
        : orderFulfillmentActivityLogItems &&
            orderFulfillmentActivityLogItems?.length > 0
          ? orderFulfillmentActivityLogItems
          : orderReceivedActivityLogItems &&
              orderReceivedActivityLogItems?.length > 0
            ? orderReceivedActivityLogItems
            : ([] as ActivityLogItem[])

    const submitted = logList.find(
      (item: ActivityLogItem) => item?.type === 'Submitted'
    )
    const rejected = logList.find(
      (item: ActivityLogItem) => item?.type === 'Rejected'
    )
    const resubmitted = logList.find(
      (item: ActivityLogItem) => item?.type === 'Resubmitted'
    )
    const approved = logList.find(
      (item: ActivityLogItem) => item?.type === 'Approved'
    )
    const shipped = logList.find(
      (item: ActivityLogItem) => item?.type === 'Shipped'
    )
    const unshipped = logList.find(
      (item: ActivityLogItem) => item?.type === 'Unshipped'
    )
    const received = logList.find(
      (item: ActivityLogItem) => item?.type === 'Received'
    )
    const unreceived = logList.find(
      (item: ActivityLogItem) => item?.type === 'Unreceived'
    )

    return {
      submitted,
      rejected,
      resubmitted,
      approved,
      shipped,
      unshipped,
      received,
      unreceived,
    }
  }

  const activityLog = getActivityLogInfo()

  // ✅ Determine Display Nodes Based on Role - All Roles Only Display Three Stages
  const getVisibleStagesForRole = (): Stage[] => {
    // ✅ Define Constants for Three Stages
    const THREE_STAGES: Stage[] = [
      'OrderReview',
      'OrderFulfillment',
      'OrderReceived',
    ]

    // ✅ All Roles Only Display Three Stages
    return THREE_STAGES
  }

  // Based on stage and status Generate Timeline Items
  const generateTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = []

    // ✅ Intelligently Determine Current Stage：If Shipped But stage Still OrderFulfillment，Should Display OrderReceived
    let effectiveStage = stage || 'OrderReview'
    if (
      stage === 'OrderFulfillment' &&
      status === 'DealershipShipped' &&
      dateShipped
    ) {
      effectiveStage = 'OrderReceived'
    }
    // If Received But stage Still OrderReceived，Should Display RepairCompleted
    if (
      stage === 'OrderReceived' &&
      (status === 'ShopReceived' || status === 'RepairCompleted') &&
      dateReceived
    ) {
      effectiveStage = 'RepairCompleted'
    }

    // ✅ Use effectiveStage To Calculate Current Stage Index
    const currentStageIndex = STAGES.indexOf(effectiveStage as Stage)

    // ✅ Filter Stages to Display Based on Role
    const visibleStages = getVisibleStagesForRole()

    visibleStages.forEach((stageName) => {
      const index = STAGES.indexOf(stageName)
      let itemStatus: TimelineItemStatus
      let date: Date | string | undefined = undefined
      let by: string | undefined = undefined
      let canApprove = false
      let canReject = false

      if (index < currentStageIndex) {
        // Completed Stages,BackendAPINo Log Returned
        itemStatus = 'completed'
        // ✅ Set for Completed OrderReview Stage date and by，Ensure Logs Display Correctly
        if (stageName === 'OrderReview') {
          if (approvalFlag === true) {
            date = dateReviewed as Date
            by = formatPersonName(reviewedByPerson)
          } else if (approvalFlag === false) {
            date = dateReviewed as Date
            by = formatPersonName(reviewedByPerson)
          } else {
            date = dateSubmitted as Date
            by = formatPersonName(submittedByPerson)
          }
        }
        // ✅ Set for Completed OrderFulfillment Stage date and by
        if (
          stageName === 'OrderFulfillment' &&
          status === 'DealershipShipped' &&
          dateShipped
        ) {
          date = dateShipped as Date
          by = formatPersonName(shippedByPerson)
        }
      } else if (index === currentStageIndex) {
        // Current Stage
        if (stageName === 'OrderReview') {
          date = dateSubmitted as Date
          by = formatPersonName(submittedByPerson)
          if (approvalFlag === true) {
            itemStatus = 'approved'
            date = dateReviewed as Date
            by = formatPersonName(reviewedByPerson)
          } else if (approvalFlag === false) {
            itemStatus = 'rejected'
            date = dateReviewed as Date
            by = formatPersonName(reviewedByPerson)
          } else if (status === 'CsrReview') {
            itemStatus = 'waiting'
            canApprove = true
            canReject = true
          }
        } else if (stageName === 'OrderFulfillment') {
          date = dateReviewed as Date
          by = formatPersonName(reviewedByPerson)
          if (
            status === 'DealershipProcessing' ||
            status === 'DealershipShipped'
          ) {
            if (status === 'DealershipShipped') {
              date = dateShipped as Date
              by = formatPersonName(shippedByPerson)
              // ✅ When Shipped，OrderFulfillment Stage Marked as Completed
              itemStatus = 'completed'
            } else {
              itemStatus = 'waiting'
            }
          } else if (status === 'CsrReview' && approvalFlag === true) {
            itemStatus = 'waiting'
          }
        } else if (stageName === 'OrderReceived') {
          date = dateShipped as Date
          by = formatPersonName(shippedByPerson)
          if (status === 'ShopReceived' || status === 'RepairCompleted') {
            itemStatus = 'completed'
            date = dateReceived as Date
            by = formatPersonName(receivedByPerson)
          } else if (status === 'DealershipShipped') {
            // ✅ When stage Is OrderFulfillment But status Is DealershipShipped Then，OrderReceived Display as waiting
            itemStatus = 'waiting'
          }
          if (status === 'ShopReceived') {
            itemStatus = 'completed'
          }
        } else if (stageName === 'RepairCompleted') {
          if (status === 'RepairCompleted') {
            itemStatus = 'completed'
          }
        }
      } else {
        // Future Stage - Not Display（Because It Has Been Filtered Out）
        // itemStatus = 'pending'
      }

      items.push({
        id: index + 1,
        stage: stageName,
        title: getStageTitle(stageName),
        status: itemStatus!,
        date,
        by,
        canApprove,
        canReject,
      })
    })

    return items
  }

  const getStageTitle = (stageName: Stage): string => {
    const titles: Record<Stage, string> = {
      OrderReview: 'Order Review',
      OrderFulfillment: 'Order Fulfillment',
      OrderReceived: 'Order Received',
      RepairCompleted: 'Repair Completed',
    }
    return titles[stageName]
  }
  const getStatusBadge = (item: TimelineItem) => {
    // ✅ CSR Role：OrderReview Stage，CsrReview Status → Purple "Waiting on You"
    if (
      userType === 'Csr' &&
      item.stage === 'OrderReview' &&
      status === 'CsrReview' &&
      item.status === 'waiting'
    ) {
      return <Badge className='bg-blue-700 text-white'>Waiting on You</Badge>
    }
    if (
      userType === 'Csr' &&
      item.stage === 'OrderFulfillment' &&
      item.status === 'waiting'
    ) {
      return <Badge className='text-muted bg-orange-400'>Pending Dealer</Badge>
    }

    // ✅ Shop Role：OrderReview Stage，CsrReview Status → Orange "Pending CSR"
    if (
      userType === 'Shop' &&
      item.stage === 'OrderReview' &&
      status === 'CsrReview' &&
      item.status === 'waiting'
    ) {
      return <Badge className='text-muted bg-orange-400'>Pending CSR</Badge>
    }

    // ✅ Shop Role：OrderReview Stage，After Rejection → Blue "Waiting on You"
    if (
      userType === 'Shop' &&
      item.stage === 'OrderReview' &&
      item.status === 'rejected'
    ) {
      return <Badge className='bg-blue-100 text-blue-700'>Waiting on You</Badge>
    }

    // ✅ Shop Role：OrderFulfillment Stage → Orange "Pending Dealer"
    if (
      userType === 'Shop' &&
      item.stage === 'OrderFulfillment' &&
      item.status === 'waiting'
    ) {
      return <Badge className='text-muted bg-orange-400'>Pending Dealer</Badge>
    }

    // ✅ Dealership Role：OrderFulfillment Stage → Blue "Waiting on You"
    if (
      userType === 'Dealership' &&
      item.stage === 'OrderFulfillment' &&
      item.status === 'waiting'
    ) {
      return <Badge className='bg-blue-100 text-blue-700'>Waiting on You</Badge>
    }

    // ✅ Shop Role：OrderReceived Stage → Blue "Waiting on You"
    if (
      userType === 'Shop' &&
      item.stage === 'OrderReceived' &&
      item.status === 'waiting'
    ) {
      return <Badge className='bg-blue-100 text-blue-700'>Waiting on You</Badge>
    }

    // ✅ Dealership Role：OrderReceived Stage → Orange "Pending Shop"
    if (
      (userType === 'Dealership' || userType === 'Csr') &&
      item.stage === 'OrderReceived' &&
      item.status === 'waiting'
    ) {
      return <Badge className='text-muted bg-orange-400'>Pending Shop</Badge>
    }
    // if(userType ==='Csr' && item.stage==='OrderFulfillment' && item.status==='waiting'){
    //   return <Badge className='text-muted bg-orange-400'>Pending Shop </Badge>
    // }

    // ✅ Other waiting Status Display Blue "Waiting on You"
    if (item.status === 'waiting' && userType !== 'ProgramAdministrator') {
      return <Badge className='bg-blue-100 text-blue-700'>Waiting on You</Badge>
    }

    if (item.status === 'pending') {
      if (item.stage === 'OrderReview' && status === 'CsrReview') {
        return <Badge className='text-muted bg-orange-400'>Pending CSR</Badge>
      }
      return <Badge className='bg-gray-400 text-white'>Pending</Badge>
    }

    return null
  }

  const timelineItems = generateTimelineItems()
  return (
    <Card className='p-6'>
      <h2 className='mb-6 text-2xl font-bold'>Parts Tracker</h2>
      <div className='space-y-8'>
        {timelineItems.map((item, index) => {
          const isRejected =
            item.stage === 'OrderReview' &&
            item.status === 'rejected' &&
            userType === 'Shop'
          const canResubmit = isRejected
          const canMarkReceived =
          (item.stage === 'OrderReceived') &&
            (item.status === 'completed' || item.status === 'waiting') &&
            onMarkReceived &&
            userType === 'Shop'
          const canMarkShipped =
            item.stage === 'OrderFulfillment' &&
            (item.status === 'waiting' ||
              (item.status === 'completed' &&
                status === 'DealershipShipped')) &&
            onMarkShipped &&
            userType === 'Dealership' &&
            !dateReceived // ✅ Can Only Operate When Not Received
          const canApproveReject =
            item.canApprove &&
            item.canReject &&
            userType === 'Csr' &&
            onApprove &&
            onReject
          return (
            <div key={item.id} className='flex gap-4'>
              {/* Dot + Dashed Line */}
              <div className='flex flex-col items-center'>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full p-1 text-sm font-bold text-white ${
                    item.status === 'approved' || item.status === 'completed'
                      ? 'bg-green-600'
                      : item.status === 'rejected'
                        ? 'bg-red-500'
                        : item.status === 'waiting'
                          ? 'bg-black'
                          : 'bg-gray-400'
                  }`}
                >
                  {item.status === 'approved' || item.status === 'completed' ? (
                    <Check className='h-5 w-5' />
                  ) : item.status === 'rejected' ? (
                    <X className='h-5 w-5' />
                  ) : (
                    item.id
                  )}
                </div>

                {/* Dashed Line */}
                {index < timelineItems.length - 1 && (
                  <div className='mt-2 h-full w-px border-l border-gray-300' />
                )}
              </div>

              {/* Content Area */}
              <div className='flex-1 pb-8'>
                <div className='mb-1 flex items-center gap-2 p-2'>
                  <h3 className='font-semibold'>{item.title}</h3>
                  {getStatusBadge(item)}
                </div>

                {/* OrderReview Stage：Display Complete History */}
                {item.stage === 'OrderReview' && (
                  <div className='space-y-2 text-sm'>
                    {/* If Available activityLog，Display Complete History */}
                    {activityLog ? (
                      <>
                        {/* Submit Information */}
                        {activityLog.submitted && (
                          <p className='text-muted-foreground'>
                            Request was Submitted on{' '}
                            <strong>
                              {formatDateTime(
                                activityLog.submitted.dateCreated
                              )}
                            </strong>
                            {activityLog.submitted.person && (
                              <>
                                {' by '}
                                <strong>
                                  {formatPersonName(
                                    activityLog.submitted.person
                                  )}
                                </strong>
                              </>
                            )}
                            .
                          </p>
                        )}
                        {/* Reject Information */}
                        {activityLog.rejected && (
                          <>
                            <p className='text-muted-foreground'>
                              Request was{' '}
                              <span className='font-semibold text-red-600'>
                                Rejected
                              </span>{' '}
                              on{' '}
                              <strong>
                                {formatDateTime(
                                  activityLog.rejected.dateCreated
                                )}
                              </strong>
                              {activityLog.rejected.person && (
                                <>
                                  {' by '}
                                  <strong>
                                    {formatPersonName(
                                      activityLog.rejected.person
                                    )}
                                    .
                                  </strong>
                                </>
                              )}
                            </p>
                            {activityLog.rejected.comment && (
                              <p className='text-muted-foreground'>
                                (Reason: {activityLog.rejected.comment})
                              </p>
                            )}
                          </>
                        )}
                        {/* Resubmit Information */}
                        {activityLog.resubmitted && (
                          <p className='text-muted-foreground'>
                            Request was Resubmitted on{' '}
                            <strong>
                              {formatDateTime(
                                activityLog.resubmitted.dateCreated
                              )}
                            </strong>
                            {activityLog.resubmitted.person && (
                              <>
                                {' by '}
                                <strong>
                                  {formatPersonName(
                                    activityLog.resubmitted.person
                                  )}
                                </strong>
                              </>
                            )}
                            .
                          </p>
                        )}
                        {/* Approve Information */}
                        {activityLog.approved && (
                          <p className='text-muted-foreground'>
                            Request was{' '}
                            <span className='font-semibold text-green-600'>
                              Approved
                            </span>{' '}
                            on{' '}
                            <strong>
                              {formatDateTime(activityLog.approved.dateCreated)}
                            </strong>
                            {activityLog.approved.person && (
                              <>
                                {' by '}
                                <strong>
                                  {formatPersonName(
                                    activityLog.approved.person
                                  )}
                                  .
                                </strong>
                              </>
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      /* If Not Available activityLog，At Least Display Basic Submission Information */
                      dateSubmitted && (
                        <p className='text-muted-foreground'>
                          Request was Submitted on{' '}
                          <strong>{formatDateTime(dateSubmitted)}</strong>
                          {submittedByPerson && (
                            <>
                              {' by '}
                              <strong>
                                {formatPersonName(submittedByPerson)}.
                              </strong>
                            </>
                          )}
                        </p>
                      )
                    )}
                  </div>
                )}

                {item.stage === 'OrderFulfillment' && (
                  <div className='space-y-2 text-sm'>
                    {/* If Available activityLog，Display Complete History */}
                    {activityLog ? (
                      <>
                        {activityLog.shipped && (
                          <p className='text-muted-foreground'>
                            Parts were Shipped on{' '}
                            <strong>
                              {formatDateTime(activityLog.shipped.dateCreated)}
                            </strong>
                            {activityLog.shipped.person && (
                              <>
                                {' by '}
                                <strong>
                                  {formatPersonName(activityLog.shipped.person)}
                                </strong>
                              </>
                            )}
                          </p>
                        )}
                        {activityLog.unshipped && (
                          <p className='text-muted-foreground'>
                            Parts were Unshipped on{' '}
                            <strong>
                              {formatDateTime(
                                activityLog.unshipped.dateCreated
                              )}
                            </strong>
                            {activityLog.unshipped.person && (
                              <>
                                {' by '}
                                <strong>
                                  {formatPersonName(
                                    activityLog.unshipped.person
                                  )}
                                </strong>
                              </>
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      /* If Not Available activityLog，At Least Display Basic Submission Information */
                      dateSubmitted && (
                        <p className='text-muted-foreground'>
                          Request was Submitted on{' '}
                          <strong>{formatDateTime(dateSubmitted)}</strong>
                          {submittedByPerson && (
                            <>
                              {' by '}
                              <strong>
                                {formatPersonName(submittedByPerson)}.
                              </strong>
                            </>
                          )}
                        </p>
                      )
                    )}
                  </div>
                )}

                {item.stage === 'OrderReceived' && (
                  <div className='space-y-2 text-sm'>
                    {/* If Available activityLog，Display Complete History */}
                    {activityLog ? (
                      <>
                        {activityLog.received && (
                          <p className='text-muted-foreground'>
                            Parts were Received on{' '}
                            <strong>
                              {formatDateTime(activityLog.received.dateCreated)}
                            </strong>
                            {activityLog.received.person && (
                              <>
                                {' by '}
                                <strong>
                                  {formatPersonName(
                                    activityLog.received.person
                                  )}
                                </strong>
                              </>
                            )}
                          </p>
                        )}
                        {activityLog.unreceived && (
                          <p className='text-muted-foreground'>
                            Parts were Unreceived on{' '}
                            <strong>
                              {formatDateTime(
                                activityLog.unreceived.dateCreated
                              )}
                            </strong>
                            {activityLog.unreceived.person && (
                              <>
                                {' by '}
                                <strong>
                                  {formatPersonName(
                                    activityLog.unreceived.person
                                  )}
                                </strong>
                              </>
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      /* If Not Available activityLog，At Least Display Basic Submission Information */
                      dateSubmitted && (
                        <p className='text-muted-foreground'>
                          Request was Submitted on{' '}
                          <strong>{formatDateTime(dateSubmitted)}</strong>
                          {submittedByPerson && (
                            <>
                              {' by '}
                              <strong>
                                {formatPersonName(submittedByPerson)}.
                              </strong>
                            </>
                          )}
                        </p>
                      )
                    )}
                  </div>
                )}
                {/* CSR Review Button（Only When CSR Role and OrderReview Display when the stage is waiting for review） */}
                {canApproveReject && (
                  <div className='flex flex-col gap-2'>
                    <p className='mb-3 text-sm'>This request is</p>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        className='bg-green-600 hover:bg-green-700'
                        onClick={onApprove}
                      >
                        <Check className='mr-1 h-4 w-4' />
                        Approved
                      </Button>
                      <Button
                        size='sm'
                        className='bg-red-600 hover:bg-red-700'
                        onClick={onReject}
                      >
                        <X className='mr-1 h-4 w-4' />
                        Rejected
                      </Button>
                    </div>
                  </div>
                )}

                {/* Resubmit button（Shop Role，Display after rejection） */}
                {canResubmit && (
                  <div className='mt-4'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={onResubmit}
                      className='bg-gray-100 hover:bg-gray-200'
                    >
                      Resubmit Request
                    </Button>
                  </div>
                )}

                {/* Mark as shipped/Revoke shipment button（Dealership Role，OrderFulfillment Stage display） */}
                {canMarkShipped && (
                  <div className='mt-4'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => onMarkShipped(status as Status)}
                      className='bg-gray-100 hover:bg-gray-200'
                    >
                      {status === 'DealershipShipped'
                        ? 'Unmark Parts as Shipped'
                        : 'Mark Parts as Shipped'}
                    </Button>
                  </div>
                )}

                {/* Mark as received button（Shop Role，OrderReceived Stage display） */}
                {canMarkReceived && status!=='RepairCompleted' && (
                  <div className='mt-4'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => onMarkReceived(status as Status)}
                      className='bg-gray-100 hover:bg-gray-200'
                    >
                      {status === 'ShopReceived'
                        ? 'Unmark Parts as Received'
                        : 'Mark Parts as Received'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
