// src/components/Timeline.tsx
import { Check, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const STAGES = ['OrderReview', 'OrderFulfillment', 'OrderReceived', 'RepairCompleted'] as const;
const STATUSES = [
  'CsrReview',
  'CsrRejected',
  'DealershipProcessing',
  'DealershipShipped',
  'ShopReceived',
  'RepairCompleted',
] as const;

type Stage = (typeof STAGES)[number];
type Status = (typeof STATUSES)[number];
type PersonType = 'Shop' | 'Csr' | 'Dealership' | 'ProgramAdministrator' | 'FieldStaff';

type ActivityLogItem = {
  type?: 'Submitted' | 'Approved' | 'Rejected' | 'Resubmitted' | 'Shipped' | 'Unshipped' | 'Received' | 'Unreceived';
  comment?: string | null;
  person?: { firstName?: string; lastName?: string } | null;
  dateCreated?: Date | string | null;
} | null;
interface TimelineProps {
  partsOrder?: {
    stage?: Stage;
    status?: Status;
    approvalFlag?: boolean | null;
    dateSubmitted?: Date | string | null;
    dateReviewed?: Date | string | null;
    dateShipped?: Date | string | null;
    dateReceived?: Date | string | null;
    submittedByPerson?: { firstName?: string; lastName?: string } | null;
    reviewedByPerson?: { firstName?: string; lastName?: string } | null;
    shippedByPerson?: { firstName?: string; lastName?: string } | null;
    receivedByPerson?: { firstName?: string; lastName?: string } | null;
    orderReviewActivityLogItems?: ActivityLogItem[];
    orderFulfillmentActivityLogItems?: ActivityLogItem[];
    orderReceivedActivityLogItems?: ActivityLogItem[];
  };
  onResubmit?: () => void | Promise<void>;
  onMarkReceived?: (status: Status) => void | Promise<void>;
  onMarkShipped?: (status: Status) => void | Promise<void>;
  onApprove?: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
}

// ✅ 内部状态类型（用于 Timeline 显示）
type TimelineItemStatus = 'pending' | 'approved' | 'rejected' | 'waiting' | 'completed';

interface TimelineItem {
  id: number;
  stage: Stage;
  title: string;
  status: TimelineItemStatus;
  date?: Date | string | null;
  by?: string;
  canApprove?: boolean;
  canReject?: boolean;
}

// 格式化日期时间
const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 格式化人员名称
const formatPersonName = (person: { firstName?: string; lastName?: string } | null | undefined): string => {
  if (!person) return '';
  return `${person.firstName || ''} ${person.lastName || ''}`.trim();
};

export function Timeline({
  partsOrder,
  onResubmit,
  onMarkReceived,
  onMarkShipped,
  onApprove,
  onReject,
}: TimelineProps) {
  // ✅ 获取当前用户角色
  const { auth } = useAuthStore();
  const userType = auth.user?.person?.type as PersonType | undefined;

  if (!partsOrder) {
    return (
      <Card className="p-6">
        <h2 className="mb-6 text-2xl font-bold">Parts Tracker</h2>
        <p className="text-muted-foreground text-sm">No parts order data available</p>
      </Card>
    );
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
  } = partsOrder;

  // 从 ActivityLogItems 中提取信息
  const getActivityLogInfo = () => {
    const logList =
      orderReviewActivityLogItems && orderReviewActivityLogItems?.length > 0
        ? orderReviewActivityLogItems
        : orderFulfillmentActivityLogItems && orderFulfillmentActivityLogItems?.length > 0
          ? orderFulfillmentActivityLogItems
          : orderReceivedActivityLogItems && orderReceivedActivityLogItems?.length > 0
            ? orderReceivedActivityLogItems
            : ([] as ActivityLogItem[]);

    const submitted = logList.find((item: ActivityLogItem) => item?.type === 'Submitted');
    const rejected = logList.find((item: ActivityLogItem) => item?.type === 'Rejected');
    const resubmitted = logList.find((item: ActivityLogItem) => item?.type === 'Resubmitted');
    const approved = logList.find((item: ActivityLogItem) => item?.type === 'Approved');
    const shipped = logList.find((item: ActivityLogItem) => item?.type === 'Shipped');
    const unshipped = logList.find((item: ActivityLogItem) => item?.type === 'Unshipped');
    const received = logList.find((item: ActivityLogItem) => item?.type === 'Received');
    const unreceived = logList.find((item: ActivityLogItem) => item?.type === 'Unreceived');

    return {
      submitted,
      rejected,
      resubmitted,
      approved,
      shipped,
      unshipped,
      received,
      unreceived,
    };
  };

  const activityLog = getActivityLogInfo();

  // ✅ 根据角色决定显示的节点 - 所有角色都只显示三个阶段
  const getVisibleStagesForRole = (): Stage[] => {
    // ✅ 定义三个阶段的常量
    const THREE_STAGES: Stage[] = ['OrderReview', 'OrderFulfillment', 'OrderReceived'];

    // ✅ 所有角色都只显示三个阶段
    return THREE_STAGES;
  };

  // 根据 stage 和 status 生成 Timeline 项
  const generateTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    // ✅ 智能判断当前阶段：如果已发货但 stage 还是 OrderFulfillment，应该显示 OrderReceived
    let effectiveStage = stage || 'OrderReview';
    if (stage === 'OrderFulfillment' && status === 'DealershipShipped' && dateShipped) {
      effectiveStage = 'OrderReceived';
    }
    // 如果已接收但 stage 还是 OrderReceived，应该显示 RepairCompleted
    if (stage === 'OrderReceived' && (status === 'ShopReceived' || status === 'RepairCompleted') && dateReceived) {
      effectiveStage = 'RepairCompleted';
    }

    // ✅ 使用 effectiveStage 来计算当前阶段索引
    const currentStageIndex = STAGES.indexOf(effectiveStage as Stage);

    // ✅ 根据角色过滤应该显示的阶段
    const visibleStages = getVisibleStagesForRole();

    visibleStages.forEach((stageName) => {
      const index = STAGES.indexOf(stageName);
      let itemStatus: TimelineItemStatus;
      let date: Date | string | undefined = undefined;
      let by: string | undefined = undefined;
      let canApprove = false;
      let canReject = false;

      if (index < currentStageIndex) {
        // 已完成的阶段,后端API没有日志返回
        itemStatus = 'completed';
        // ✅ 为已完成的 OrderReview 阶段设置 date 和 by，确保日志能正确显示
        if (stageName === 'OrderReview') {
          if (approvalFlag === true) {
            date = dateReviewed as Date;
            by = formatPersonName(reviewedByPerson);
          } else if (approvalFlag === false) {
            date = dateReviewed as Date;
            by = formatPersonName(reviewedByPerson);
          } else {
            date = dateSubmitted as Date;
            by = formatPersonName(submittedByPerson);
          }
        }
        // ✅ 为已完成的 OrderFulfillment 阶段设置 date 和 by
        if (stageName === 'OrderFulfillment' && status === 'DealershipShipped' && dateShipped) {
          date = dateShipped as Date;
          by = formatPersonName(shippedByPerson);
        }
      } else if (index === currentStageIndex) {
        // 当前阶段
        if (stageName === 'OrderReview') {
          date = dateSubmitted as Date;
          by = formatPersonName(submittedByPerson);
          if (approvalFlag === true) {
            itemStatus = 'approved';
            date = dateReviewed as Date;
            by = formatPersonName(reviewedByPerson);
          } else if (approvalFlag === false) {
            itemStatus = 'rejected';
            date = dateReviewed as Date;
            by = formatPersonName(reviewedByPerson);
          } else if (status === 'CsrReview') {
            itemStatus = 'waiting';
            canApprove = true;
            canReject = true;
          }
        } else if (stageName === 'OrderFulfillment') {
          date = dateReviewed as Date;
          by = formatPersonName(reviewedByPerson);
          if (status === 'DealershipProcessing' || status === 'DealershipShipped') {
            if (status === 'DealershipShipped') {
              date = dateShipped as Date;
              by = formatPersonName(shippedByPerson);
              // ✅ 当已发货时，OrderFulfillment 阶段标记为已完成
              itemStatus = 'completed';
            } else {
              itemStatus = 'waiting';
            }
          } else if (status === 'CsrReview' && approvalFlag === true) {
            itemStatus = 'waiting';
          }
        } else if (stageName === 'OrderReceived') {
          date = dateShipped as Date;
          by = formatPersonName(shippedByPerson);
          if (status === 'ShopReceived' || status === 'RepairCompleted') {
            itemStatus = 'completed';
            date = dateReceived as Date;
            by = formatPersonName(receivedByPerson);
          } else if (status === 'DealershipShipped') {
            // ✅ 当 stage 是 OrderFulfillment 但 status 是 DealershipShipped 时，OrderReceived 显示为 waiting
            itemStatus = 'waiting';
          }
        } else if (stageName === 'RepairCompleted') {
          if (status === 'RepairCompleted') {
            itemStatus = 'completed';
          }
        }
      } else {
        // 未来阶段 - 不显示（因为已经被过滤掉了）
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
      });
    });

    return items;
  };

  const getStageTitle = (stageName: Stage): string => {
    const titles: Record<Stage, string> = {
      OrderReview: 'Order Review',
      OrderFulfillment: 'Order Fulfillment',
      OrderReceived: 'Order Received',
      RepairCompleted: 'Repair Completed',
    };
    return titles[stageName];
  };
  const getStatusBadge = (item: TimelineItem) => {
    // ✅ CSR 角色：OrderReview 阶段，CsrReview 状态 → 紫色 "Waiting on You"
    if (userType === 'Csr' && item.stage === 'OrderReview' && status === 'CsrReview' && item.status === 'waiting') {
      return <Badge className="bg-blue-700 text-white">Waiting on You</Badge>;
    }
    if (userType === 'Csr' && item.stage === 'OrderFulfillment' && item.status === 'waiting') {
      return <Badge className="text-muted bg-orange-400">Pending Dealer</Badge>;
    }

    // ✅ Shop 角色：OrderReview 阶段，CsrReview 状态 → 橙色 "Pending CSR"
    if (userType === 'Shop' && item.stage === 'OrderReview' && status === 'CsrReview' && item.status === 'waiting') {
      return <Badge className="text-muted bg-orange-400">Pending CSR</Badge>;
    }

    // ✅ Shop 角色：OrderReview 阶段，拒绝后 → 蓝色 "Waiting on You"
    if (userType === 'Shop' && item.stage === 'OrderReview' && item.status === 'rejected') {
      return <Badge className="bg-blue-100 text-blue-700">Waiting on You</Badge>;
    }

    // ✅ Shop 角色：OrderFulfillment 阶段 → 橙色 "Pending Dealer"
    if (userType === 'Shop' && item.stage === 'OrderFulfillment' && item.status === 'waiting') {
      return <Badge className="text-muted bg-orange-400">Pending Dealer</Badge>;
    }

    // ✅ Dealership 角色：OrderFulfillment 阶段 → 蓝色 "Waiting on You"
    if (userType === 'Dealership' && item.stage === 'OrderFulfillment' && item.status === 'waiting') {
      return <Badge className="bg-blue-100 text-blue-700">Waiting on You</Badge>;
    }

    // ✅ Shop 角色：OrderReceived 阶段 → 蓝色 "Waiting on You"
    if (userType === 'Shop' && item.stage === 'OrderReceived' && item.status === 'waiting') {
      return <Badge className="bg-blue-100 text-blue-700">Waiting on You</Badge>;
    }

    // ✅ Dealership 角色：OrderReceived 阶段 → 橙色 "Pending Shop"
    if (
      (userType === 'Dealership' || userType === 'Csr') &&
      item.stage === 'OrderReceived' &&
      item.status === 'waiting'
    ) {
      return <Badge className="text-muted bg-orange-400">Pending Shop</Badge>;
    }
    // if(userType ==='Csr' && item.stage==='OrderFulfillment' && item.status==='waiting'){
    //   return <Badge className='text-muted bg-orange-400'>Pending Shop </Badge>
    // }

    // ✅ 其他 waiting 状态显示蓝色 "Waiting on You"
    if (item.status === 'waiting') {
      return <Badge className="bg-blue-100 text-blue-700">Waiting on You</Badge>;
    }

    if (item.status === 'pending') {
      if (item.stage === 'OrderReview' && status === 'CsrReview') {
        return <Badge className="text-muted bg-orange-400">Pending CSR</Badge>;
      }
      return <Badge className="bg-gray-400 text-white">Pending</Badge>;
    }

    return null;
  };

  const timelineItems = generateTimelineItems();
  console.log('timelineItems');
  console.log(timelineItems);
  return (
    <Card className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Parts Tracker</h2>
      <div className="space-y-8">
        {timelineItems.map((item, index) => {
          console.log(item.status);
          console.log(item.stage);
          const isRejected = item.stage === 'OrderReview' && item.status === 'rejected' && userType === 'Shop';
          const canResubmit = isRejected;
          const canMarkReceived =
            item.stage === 'OrderReceived' && item.status === 'waiting' && onMarkReceived && userType === 'Shop';
          const canMarkShipped =
            item.stage === 'OrderFulfillment' &&
            (item.status === 'waiting' || (item.status === 'completed' && status === 'DealershipShipped')) &&
            onMarkShipped &&
            userType === 'Dealership' &&
            !dateReceived; // ✅ 只有在还没有接收时才能操作
          const canApproveReject = item.canApprove && item.canReject && userType === 'Csr' && onApprove && onReject;

          return (
            <div key={item.id} className="flex gap-4">
              {/* 圆点 + 虚线 */}
              <div className="flex flex-col items-center">
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
                    <Check className="h-5 w-5" />
                  ) : item.status === 'rejected' ? (
                    <X className="h-5 w-5" />
                  ) : (
                    item.id
                  )}
                </div>

                {/* 虚线 */}
                {index < timelineItems.length - 1 && <div className="mt-2 h-full w-px border-l border-gray-300" />}
              </div>

              {/* 内容区域 */}
              <div className="flex-1 pb-8">
                <div className="mb-1 flex items-center gap-2 p-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  {getStatusBadge(item)}
                </div>

                {/* OrderReview 阶段：显示完整的历史记录 */}
                {item.stage === 'OrderReview' && (
                  <div className="space-y-2 text-sm">
                    {/* 如果有 activityLog，显示完整历史记录 */}
                    {activityLog ? (
                      <>
                        {/* 提交信息 */}
                        {activityLog.submitted && (
                          <p className="text-muted-foreground">
                            Request was Submitted on{' '}
                            <strong>{formatDateTime(activityLog.submitted.dateCreated)}</strong>
                            {activityLog.submitted.person && (
                              <>
                                {' by '}
                                <strong>{formatPersonName(activityLog.submitted.person)}</strong>
                              </>
                            )}
                            .
                          </p>
                        )}
                        {/* 拒绝信息 */}
                        {activityLog.rejected && (
                          <>
                            <p className="text-muted-foreground">
                              Request was <span className="font-semibold text-red-600">Rejected</span> on{' '}
                              <strong>{formatDateTime(activityLog.rejected.dateCreated)}</strong>
                              {activityLog.rejected.person && (
                                <>
                                  {' by '}
                                  <strong>{formatPersonName(activityLog.rejected.person)}.</strong>
                                </>
                              )}
                            </p>
                            {activityLog.rejected.comment && (
                              <p className="text-muted-foreground">(Reason: {activityLog.rejected.comment})</p>
                            )}
                          </>
                        )}
                        {/* 重新提交信息 */}
                        {activityLog.resubmitted && (
                          <p className="text-muted-foreground">
                            Request was Resubmitted on{' '}
                            <strong>{formatDateTime(activityLog.resubmitted.dateCreated)}</strong>
                            {activityLog.resubmitted.person && (
                              <>
                                {' by '}
                                <strong>{formatPersonName(activityLog.resubmitted.person)}</strong>
                              </>
                            )}
                            .
                          </p>
                        )}
                        {/* 批准信息 */}
                        {activityLog.approved && (
                          <p className="text-muted-foreground">
                            Request was <span className="font-semibold text-green-600">Approved</span> on{' '}
                            <strong>{formatDateTime(activityLog.approved.dateCreated)}</strong>
                            {activityLog.approved.person && (
                              <>
                                {' by '}
                                <strong>{formatPersonName(activityLog.approved.person)}.</strong>
                              </>
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      /* 如果没有 activityLog，至少显示基本提交信息 */
                      dateSubmitted && (
                        <p className="text-muted-foreground">
                          Request was Submitted on <strong>{formatDateTime(dateSubmitted)}</strong>
                          {submittedByPerson && (
                            <>
                              {' by '}
                              <strong>{formatPersonName(submittedByPerson)}.</strong>
                            </>
                          )}
                        </p>
                      )
                    )}
                  </div>
                )}

                {item.stage === 'OrderFulfillment' && (
                  <div className="space-y-2 text-sm">
                    {/* 如果有 activityLog，显示完整历史记录 */}
                    {activityLog ? (
                      <>
                        {activityLog.shipped && (
                          <p className="text-muted-foreground">
                            Parts were Shipped on <strong>{formatDateTime(activityLog.shipped.dateCreated)}</strong>
                            {activityLog.shipped.person && (
                              <>
                                {' by '}
                                <strong>{formatPersonName(activityLog.shipped.person)}</strong>
                              </>
                            )}
                          </p>
                        )}
                        {activityLog.unshipped && (
                          <p className="text-muted-foreground">
                            Parts were Unshipped on <strong>{formatDateTime(activityLog.unshipped.dateCreated)}</strong>
                            {activityLog.unshipped.person && (
                              <>
                                {' by '}
                                <strong>{formatPersonName(activityLog.unshipped.person)}</strong>
                              </>
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      /* 如果没有 activityLog，至少显示基本提交信息 */
                      dateSubmitted && (
                        <p className="text-muted-foreground">
                          Request was Submitted on <strong>{formatDateTime(dateSubmitted)}</strong>
                          {submittedByPerson && (
                            <>
                              {' by '}
                              <strong>{formatPersonName(submittedByPerson)}.</strong>
                            </>
                          )}
                        </p>
                      )
                    )}
                  </div>
                )}

                {item.stage === 'OrderReceived' && (
                  <div className="space-y-2 text-sm">
                    {/* 如果有 activityLog，显示完整历史记录 */}
                    {activityLog ? (
                      <>
                        {activityLog.received && (
                          <p className="text-muted-foreground">
                            Parts were Received on <strong>{formatDateTime(activityLog.received.dateCreated)}</strong>
                            {activityLog.received.person && (
                              <>
                                {' by '}
                                <strong>{formatPersonName(activityLog.received.person)}</strong>
                              </>
                            )}
                          </p>
                        )}
                        {activityLog.unreceived && (
                          <p className="text-muted-foreground">
                            Parts were Unreceived on{' '}
                            <strong>{formatDateTime(activityLog.unreceived.dateCreated)}</strong>
                            {activityLog.unreceived.person && (
                              <>
                                {' by '}
                                <strong>{formatPersonName(activityLog.unreceived.person)}</strong>
                              </>
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      /* 如果没有 activityLog，至少显示基本提交信息 */
                      dateSubmitted && (
                        <p className="text-muted-foreground">
                          Request was Submitted on <strong>{formatDateTime(dateSubmitted)}</strong>
                          {submittedByPerson && (
                            <>
                              {' by '}
                              <strong>{formatPersonName(submittedByPerson)}.</strong>
                            </>
                          )}
                        </p>
                      )
                    )}
                  </div>
                )}
                {/* CSR 审核按钮（仅在 CSR 角色且 OrderReview 阶段等待审核时显示） */}
                {canApproveReject && (
                  <div className="flex flex-col gap-2">
                    <p className="mb-3 text-sm">This request is</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onApprove}>
                        <Check className="mr-1 h-4 w-4" />
                        Approved
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={onReject}>
                        <X className="mr-1 h-4 w-4" />
                        Rejected
                      </Button>
                    </div>
                  </div>
                )}

                {/* 重新提交按钮（Shop 角色，拒绝后显示） */}
                {canResubmit && (
                  <div className="mt-4">
                    <Button size="sm" variant="outline" onClick={onResubmit} className="bg-gray-100 hover:bg-gray-200">
                      Resubmit Request
                    </Button>
                  </div>
                )}

                {/* 标记为已发货/撤销发货按钮（Dealership 角色，OrderFulfillment 阶段显示） */}
                {canMarkShipped && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkShipped(status as Status)}
                      className="bg-gray-100 hover:bg-gray-200"
                    >
                      {status === 'DealershipShipped' ? 'Unmark Parts as Shipped' : 'Mark Parts as Shipped'}
                    </Button>
                  </div>
                )}

                {/* 标记为已接收按钮（Shop 角色，OrderReceived 阶段显示） */}
                {canMarkReceived && (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkReceived(item.status as Status)}
                      className="bg-gray-100 hover:bg-gray-200"
                    >
                      Mark Parts as Received
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
