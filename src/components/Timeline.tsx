// src/components/Timeline.tsx
import { Check, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trans, useTranslation } from 'react-i18next';
import { formatDateOnly } from '@/lib/utils';

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
  onMarkShipped?: (status: Status) => void | Promise<void>;
  onMarkReceived?: (status: Status) => void | Promise<void>;
  onApprove?: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
}

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
  const { t } = useTranslation();
  const { auth } = useAuthStore();
  const userType = auth.user?.person?.type as PersonType | undefined;

  if (!partsOrder) {
    return (
      <Card className="p-6">
        <h2 className="mb-6 text-2xl font-bold">{t('timeline.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('timeline.noData')}</p>
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

  const getActivityLogInfo = () => {
    // 为每个阶段分别获取活动日志
    const orderReviewLogs = orderReviewActivityLogItems || [];
    const orderFulfillmentLogs = orderFulfillmentActivityLogItems || [];
    const orderReceivedLogs = orderReceivedActivityLogItems || [];

    // Order Review 阶段的活动 - 获取所有记录并按时间排序
    const submitted = orderReviewLogs.filter((item: ActivityLogItem) => item?.type === 'Submitted')
      .sort((a, b) => new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime());
    const rejected = orderReviewLogs.filter((item: ActivityLogItem) => item?.type === 'Rejected')
      .sort((a, b) => new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime());
    const resubmitted = orderReviewLogs.filter((item: ActivityLogItem) => item?.type === 'Resubmitted')
      .sort((a, b) => new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime());
    const approved = orderReviewLogs.filter((item: ActivityLogItem) => item?.type === 'Approved')
      .sort((a, b) => new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime());

    // Order Fulfillment 阶段的活动 - 获取所有记录并按时间排序
    const shipped = orderFulfillmentLogs.filter((item: ActivityLogItem) => item?.type === 'Shipped')
      .sort((a, b) => new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime());
    const unshipped = orderFulfillmentLogs.filter((item: ActivityLogItem) => item?.type === 'Unshipped')
      .sort((a, b) => new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime());

    // Order Received 阶段的活动 - 获取所有记录并按时间排序
    const received = orderReceivedLogs.filter((item: ActivityLogItem) => item?.type === 'Received')
      .sort((a, b) => new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime());
    const unreceived = orderReceivedLogs.filter((item: ActivityLogItem) => item?.type === 'Unreceived')
      .sort((a, b) => new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime());

    return {
      orderReview: {
        submitted,
        rejected,
        resubmitted,
        approved,
      },
      orderFulfillment: {
        shipped,
        unshipped,
      },
      orderReceived: {
        received,
        unreceived,
      },
    };
  };

  const activityLog = getActivityLogInfo();

  const getVisibleStagesForRole = (): Stage[] => {
    const THREE_STAGES: Stage[] = ['OrderReview', 'OrderFulfillment', 'OrderReceived'];
    return THREE_STAGES;
  };

  const generateTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    let effectiveStage = stage || 'OrderReview';
    if (stage === 'OrderFulfillment' && status === 'DealershipShipped' && dateShipped) {
      effectiveStage = 'OrderReceived';
    }
    if (stage === 'OrderReceived' && (status === 'ShopReceived' || status === 'RepairCompleted') && dateReceived) {
      effectiveStage = 'RepairCompleted';
    }

    const currentStageIndex = STAGES.indexOf(effectiveStage as Stage);
    const visibleStages = getVisibleStagesForRole();

    visibleStages.forEach((stageName) => {
      const index = STAGES.indexOf(stageName);
      let itemStatus: TimelineItemStatus = 'pending';
      let date: Date | string | undefined = undefined;
      let by: string | undefined = undefined;
      let canApprove = false;
      let canReject = false;

      if (index < currentStageIndex) {
        itemStatus = 'completed';
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
        if (stageName === 'OrderFulfillment' && status === 'DealershipShipped' && dateShipped) {
          date = dateShipped as Date;
          by = formatPersonName(shippedByPerson);
        }
      } else if (index === currentStageIndex) {
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
            itemStatus = 'waiting';
          }
        }
      }

      items.push({
        id: index + 1,
        stage: stageName,
        title: t(`timeline.stage.${stageName}`),
        status: itemStatus,
        date,
        by,
        canApprove,
        canReject,
      });
    });

    return items;
  };

  const getStatusBadge = (item: TimelineItem) => {
    console.log(userType, item.stage, item.status);
    
    // CSR 角色
    if (userType === 'Csr' && item.stage === 'OrderReview' && status === 'CsrReview' && item.status === 'waiting') {
      return <Badge className="text-white bg-blue-700">{t('timeline.badge.waitingOnYou')}</Badge>;
    }
    if (userType === 'Csr' && item.stage === 'OrderFulfillment' && item.status === 'waiting') {
      return <Badge className="bg-orange-400 text-muted">{t('timeline.badge.pendingDealer')}</Badge>;
    }
    if (userType === 'Csr' && item.stage === 'OrderReceived' && item.status === 'waiting') {
      return <Badge className="bg-orange-400 text-muted">{t('timeline.badge.pendingShop')}</Badge>;
    }
    
    // Shop 角色
    if (userType === 'Shop' && item.stage === 'OrderReview' && status === 'CsrReview' && item.status === 'waiting') {
      return <Badge className="bg-orange-400 text-muted">{t('timeline.badge.pendingCsr')}</Badge>;
    }
    if (userType === 'Shop' && item.stage === 'OrderReview' && item.status === 'rejected') {
      return <Badge className="text-blue-700 bg-blue-100">{t('timeline.badge.waitingOnYou')}</Badge>;
    }
    if (userType === 'Shop' && item.stage === 'OrderReceived' && item.status === 'waiting') {
      return <Badge className="text-blue-700 bg-blue-100">{t('timeline.badge.waitingOnYou')}</Badge>;
    }
    if (userType === 'Shop' && item.stage === 'OrderFulfillment' && item.status === 'waiting') {
      return <Badge className="bg-orange-400 text-muted">{t('timeline.badge.pendingDealer')}</Badge>;
    }
    
    // Dealership 角色
    if (userType === 'Dealership' && item.stage === 'OrderFulfillment' && item.status === 'waiting') {
      return <Badge className="text-blue-700 bg-blue-100">{t('timeline.badge.waitingOnYou')}</Badge>;
    }
    if (userType === 'Dealership' && item.stage === 'OrderReceived' && item.status === 'waiting') {
      return <Badge className="bg-orange-400 text-muted">{t('timeline.badge.pendingShop')}</Badge>;
    }
    
    // Field Staff 和 Program Administrator 角色 - 只显示 pending badges
    if ((userType === 'FieldStaff' || userType === 'ProgramAdministrator') && item.status === 'waiting') {
      if (item.stage === 'OrderReview') {
        return <Badge className="bg-orange-400 text-muted">{t('timeline.badge.pendingCsr')}</Badge>;
      }
      if (item.stage === 'OrderFulfillment') {
        return <Badge className="bg-orange-400 text-muted">{t('timeline.badge.pendingDealer')}</Badge>;
      }
      if (item.stage === 'OrderReceived') {
        return <Badge className="bg-orange-400 text-muted">{t('timeline.badge.pendingShop')}</Badge>;
      }
    }
    
    return null;
  };

  const timelineItems = generateTimelineItems();

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-2xl font-bold">{t('timeline.title')}</h2>

      {/* 时间线容器 */}
      <div className="relative">
        {timelineItems.map((item, index) => {
          const isLast = index === timelineItems.length - 1;
          const isCompleted = item.status === 'completed' || item.status === 'approved';
          const isCurrentStage = item.status === 'waiting' || item.status === 'rejected';
          
          return (
            <div key={item.id} className="relative flex min-h-32">
              {/* 左侧：圆点 + 连线 */}
              <div className="relative flex flex-col items-center mr-6">
                {/* 圆点 */}
                <div
                  className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
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
                    <Check className="w-4 h-4" />
                  ) : item.status === 'rejected' ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <span className="text-sm">{item.id}</span>
                  )}
                </div>

                {/* 向下连线：仅在非最后一个节点时绘制 */}
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 mt-1 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`}
                  />
                )}
              </div>

              {/* 右侧内容区域 */}
              <div className="flex-1 pb-12">
                {/* 标题 + Badge - 与数字垂直居中对齐 */}
                <div className="flex items-center gap-3 mb-3 -mt-1">
                  <h3 className={`text-lg ${isCurrentStage ? 'font-bold' : 'font-semibold'}`}>
                    {item.title}
                  </h3>
                  {getStatusBadge(item)}
                </div>

                {/* Order Review Stage */}
                {item.stage === 'OrderReview' && (
                  <div className="space-y-2 text-sm">
                    {/* 显示所有提交记录 */}
                    {activityLog.orderReview.submitted.length > 0 ? (
                      activityLog.orderReview.submitted.map((log: ActivityLogItem, index: number) => (
                        <p key={`submitted-${index}`} className="text-muted-foreground">
                          <Trans
                            i18nKey={
                              formatPersonName(log?.person)
                                ? 'timeline.log.submittedWithBy'
                                : 'timeline.log.submitted'
                            }
                            values={{
                              date: formatDateOnly(log?.dateCreated),
                              by: formatPersonName(log?.person),
                            }}
                            components={{ strong: <strong /> }}
                          />
                        </p>
                      ))
                    ) : dateSubmitted && (
                      <p className="text-muted-foreground">
                        <Trans
                          i18nKey={
                            formatPersonName(submittedByPerson)
                              ? 'timeline.log.submittedWithBy'
                              : 'timeline.log.submitted'
                          }
                          values={{
                            date: formatDateOnly(dateSubmitted),
                            by: formatPersonName(submittedByPerson),
                          }}
                          components={{ strong: <strong /> }}
                        />
                      </p>
                    )}
                    {/* 显示所有拒绝记录 */}
                    {activityLog.orderReview.rejected.map((log: ActivityLogItem, index: number) => (
                      <div key={`rejected-${index}`}>
                        <p className="text-muted-foreground">
                          <Trans
                            i18nKey={
                              formatPersonName(log?.person)
                                ? 'timeline.log.rejectedWithBy'
                                : 'timeline.log.rejected'
                            }
                            values={{
                              date: formatDateOnly(log?.dateCreated),
                              by: formatPersonName(log?.person),
                            }}
                            components={{
                              strong: <strong />,
                              rejected: <span className="font-semibold text-red-600" />,
                            }}
                          />
                        </p>
                        {log?.comment && (
                          <p className="text-muted-foreground">
                            {t('timeline.log.reason', { reason: log.comment })}
                          </p>
                        )}
                      </div>
                    ))}
                    {/* 显示所有重新提交记录 */}
                    {activityLog.orderReview.resubmitted.map((log: ActivityLogItem, index: number) => (
                      <p key={`resubmitted-${index}`} className="text-muted-foreground">
                        <Trans
                          i18nKey={
                            formatPersonName(log?.person)
                              ? 'timeline.log.resubmittedWithBy'
                              : 'timeline.log.resubmitted'
                          }
                          values={{
                            date: formatDateOnly(log?.dateCreated),
                            by: formatPersonName(log?.person),
                          }}
                          components={{ strong: <strong /> }}
                        />
                      </p>
                    ))}
                    {/* 显示所有批准记录 */}
                    {activityLog.orderReview.approved.map((log: ActivityLogItem, index: number) => (
                      <p key={`approved-${index}`} className="text-muted-foreground">
                        <Trans
                          i18nKey={
                            formatPersonName(log?.person)
                              ? 'timeline.log.approvedWithBy'
                              : 'timeline.log.approved'
                          }
                          values={{
                            date: formatDateOnly(log?.dateCreated),
                            by: formatPersonName(log?.person),
                          }}
                          components={{
                            strong: <strong />,
                            approved: <span className="font-semibold text-green-600" />,
                          }}
                        />
                      </p>
                    ))}
                  </div>
                )}

                {/* Order Fulfillment Stage */}
                {item.stage === 'OrderFulfillment' && (
                  <div className="space-y-2 text-sm">
                    {/* 合并 shipped 和 unshipped，按时间顺序显示 */}
                    {[...activityLog.orderFulfillment.shipped, ...activityLog.orderFulfillment.unshipped]
                      .sort((a, b) => new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime())
                      .map((log: ActivityLogItem, index: number) => (
                        <p key={`fulfillment-${index}`} className="text-muted-foreground">
                          <Trans
                            i18nKey={
                              formatPersonName(log?.person)
                                ? log?.type === 'Shipped' ? 'timeline.log.shippedWithBy' : 'timeline.log.unshippedWithBy'
                                : log?.type === 'Shipped' ? 'timeline.log.shipped' : 'timeline.log.unshipped'
                            }
                            values={{
                              date: formatDateOnly(log?.dateCreated),
                              by: formatPersonName(log?.person),
                            }}
                            components={{ strong: <strong /> }}
                          />
                        </p>
                      ))
                    }
                  </div>
                )}

                {/* Order Received Stage */}
                {item.stage === 'OrderReceived' && (
                  <div className="space-y-2 text-sm">
                    {/* 合并 received 和 unreceived，按时间顺序显示 */}
                    {[...activityLog.orderReceived.received, ...activityLog.orderReceived.unreceived]
                      .sort((a, b) => new Date(a?.dateCreated || 0).getTime() - new Date(b?.dateCreated || 0).getTime())
                      .map((log: ActivityLogItem, index: number) => (
                        <p key={`received-${index}`} className="text-muted-foreground">
                          <Trans
                            i18nKey={
                              formatPersonName(log?.person)
                                ? log?.type === 'Received' ? 'timeline.log.receivedWithBy' : 'timeline.log.unreceivedWithBy'
                                : log?.type === 'Received' ? 'timeline.log.received' : 'timeline.log.unreceived'
                            }
                            values={{
                              date: formatDateOnly(log?.dateCreated),
                              by: formatPersonName(log?.person),
                            }}
                            components={{ strong: <strong /> }}
                          />
                        </p>
                      ))
                    }
                  </div>
                )}

                {/* Action Buttons */}
                {item.canApprove && item.canReject && userType === 'Csr' && onApprove && onReject && (
                  <div className="flex flex-col gap-2">
                    <p className="mb-3 text-sm">{t('timeline.requestPending')}</p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onApprove}>
                        <Check className="w-4 h-4 mr-1" />
                        {t('timeline.button.approve')}
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={onReject}>
                        <X className="w-4 h-4 mr-1" />
                        {t('timeline.button.reject')}
                      </Button>
                    </div>
                  </div>
                )}
                {item.stage === 'OrderReview' && item.status === 'rejected' && userType === 'Shop' && onResubmit && (
                  <div className="mt-4">
                    <Button size="sm" variant="outline" onClick={onResubmit} className="bg-gray-100 hover:bg-gray-200">
                      {t('timeline.button.resubmit')}
                    </Button>
                  </div>
                )}
                {item.stage === 'OrderFulfillment' &&
                  (item.status === 'waiting' || (item.status === 'completed' && status === 'DealershipShipped')) &&
                  onMarkShipped &&
                  userType === 'Dealership' &&
                  !dateReceived && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkShipped(status as Status)}
                        className="bg-gray-100 hover:bg-gray-200"
                      >
                        {status === 'DealershipShipped'
                          ? t('timeline.button.unmarkShipped')
                          : t('timeline.button.markShipped')}
                      </Button>
                    </div>
                  )}
                {item.stage === 'OrderReceived' &&
                  (item.status === 'completed' || item.status === 'waiting') &&
                  onMarkReceived &&
                  userType === 'Shop' &&
                  status !== 'RepairCompleted' && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onMarkReceived(status as Status)}
                        className="bg-gray-100 hover:bg-gray-200"
                      >
                        {status === 'ShopReceived'
                          ? t('timeline.button.unmarkReceived')
                          : t('timeline.button.markReceived')}
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
