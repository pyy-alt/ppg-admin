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
    const logList =
      orderReviewActivityLogItems && orderReviewActivityLogItems.length > 0
        ? orderReviewActivityLogItems
        : orderFulfillmentActivityLogItems && orderFulfillmentActivityLogItems.length > 0
          ? orderFulfillmentActivityLogItems
          : orderReceivedActivityLogItems && orderReceivedActivityLogItems.length > 0
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
    if (userType === 'Csr' && item.stage === 'OrderReview' && status === 'CsrReview' && item.status === 'waiting') {
      return <Badge className="text-white bg-blue-700">{t('timeline.badge.waitingOnYou')}</Badge>;
    }
    if (userType === 'Csr' && item.stage === 'OrderFulfillment' && item.status === 'waiting') {
      return <Badge className="bg-orange-400 text-muted">{t('timeline.badge.pendingDealer')}</Badge>;
    }
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
    if (userType === 'Dealership' && item.stage === 'OrderFulfillment' && item.status === 'waiting') {
      return <Badge className="text-blue-700 bg-blue-100">{t('timeline.badge.waitingOnYou')}</Badge>;
    }
    
    if (
      (userType === 'Dealership' || userType === 'Csr') &&
      item.stage === 'OrderReceived' &&
      item.status === 'waiting'
    ) {
      return <Badge className="bg-orange-400 text-muted">{t('timeline.badge.pendingShop')}</Badge>;
    }
    if (item.status === 'waiting' && userType !== 'ProgramAdministrator') {
      return <Badge className="text-blue-700 bg-blue-100">{t('timeline.badge.waitingOnYou')}</Badge>;
    }
    return null;
  };

  const timelineItems = generateTimelineItems();

  return (
    <Card className="p-6">
      <h2 className="mb-6 text-2xl font-bold">{t('timeline.title')}</h2>

      {/* 时间线容器：左侧留出空间用于连线 */}
      <div className="relative pl-12">
        {timelineItems.map((item, index) => {
          const isLast = index === timelineItems.length - 1;
          const isCompleted = item.status === 'completed' || item.status === 'approved';
          return (
            <div key={item.id} className="relative flex items-start min-h-32">
              {/* 左侧：圆点 + 连线 */}
              <div className="absolute top-0 left-0 flex items-start h-full">
                {/* 圆点 */}
                <div
                  className={`relative z-10 flex h-6 w-6 shrink-0  items-center justify-center rounded-full  text-white ${
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
                    <span>{item.id}</span>
                  )}
                </div>

                {/* 向下连线：仅在非最后一个节点时绘制，且充满剩余高度 */}
                {!isLast && (
                  <div
                    className={`absolute left-3 top-0 w-0.5  h-full ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`}
                  />
                )}
              </div>

              {/* 右侧内容区域 */}
              <div className="flex-1 pb-12 ml-8">
                {/* 标题 + Badge */}
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  {getStatusBadge(item)}
                </div>

                {/* Order Review Stage */}
                {item.stage === 'OrderReview' && (
                  <div className="space-y-2 text-sm">
                    {activityLog ? (
                      <>
                        {activityLog.submitted && (
                          <p className="text-muted-foreground">
                            <Trans
                              i18nKey={
                                formatPersonName(activityLog.submitted.person)
                                  ? 'timeline.log.submittedWithBy'
                                  : 'timeline.log.submitted'
                              }
                              values={{
                                date: formatDateOnly(activityLog.submitted.dateCreated),
                                by: formatPersonName(activityLog.submitted.person),
                              }}
                              components={{ strong: <strong /> }}
                            />
                          </p>
                        )}
                        {activityLog.rejected && (
                          <>
                            <p className="text-muted-foreground">
                              <Trans
                                i18nKey={
                                  formatPersonName(activityLog.rejected.person)
                                    ? 'timeline.log.rejectedWithBy'
                                    : 'timeline.log.rejected'
                                }
                                values={{
                                  date: formatDateOnly(activityLog.rejected.dateCreated),
                                  by: formatPersonName(activityLog.rejected.person),
                                }}
                                components={{
                                  strong: <strong />,
                                  rejected: <span className="font-semibold text-red-600" />,
                                }}
                              />
                            </p>
                            {activityLog.rejected.comment && (
                              <p className="text-muted-foreground">
                                {t('timeline.log.reason', { reason: activityLog.rejected.comment })}
                              </p>
                            )}
                          </>
                        )}
                        {activityLog.resubmitted && (
                          <p className="text-muted-foreground">
                            <Trans
                              i18nKey={
                                formatPersonName(activityLog.resubmitted.person)
                                  ? 'timeline.log.resubmittedWithBy'
                                  : 'timeline.log.resubmitted'
                              }
                              values={{
                                date: formatDateOnly(activityLog.resubmitted.dateCreated),
                                by: formatPersonName(activityLog.resubmitted.person),
                              }}
                              components={{ strong: <strong /> }}
                            />
                          </p>
                        )}
                        {activityLog.approved && (
                          <p className="text-muted-foreground">
                            <Trans
                              i18nKey={
                                formatPersonName(activityLog.approved.person)
                                  ? 'timeline.log.approvedWithBy'
                                  : 'timeline.log.approved'
                              }
                              values={{
                                date: formatDateOnly(activityLog.approved.dateCreated),
                                by: formatPersonName(activityLog.approved.person),
                              }}
                              components={{
                                strong: <strong />,
                                approved: <span className="font-semibold text-green-600" />,
                              }}
                            />
                          </p>
                        )}
                      </>
                    ) : (
                      dateSubmitted && (
                        <p className="text-muted-foreground">
                          <Trans
                            i18nKey={
                              formatPersonName(submittedByPerson)
                                ? 'timeline.log.submittedBasicWithBy'
                                : 'timeline.log.submittedBasic'
                            }
                            values={{
                              date: formatDateOnly(dateSubmitted),
                              by: formatPersonName(submittedByPerson),
                            }}
                            components={{ strong: <strong /> }}
                          />
                        </p>
                      )
                    )}
                  </div>
                )}

                {/* Order Fulfillment Stage */}
                {item.stage === 'OrderFulfillment' && (
                  <div className="space-y-2 text-sm">
                    {activityLog ? (
                      <>
                        {activityLog.shipped && (
                          <p className="text-muted-foreground">
                            <Trans
                              i18nKey={
                                formatPersonName(activityLog.shipped.person)
                                  ? 'timeline.log.shippedWithBy'
                                  : 'timeline.log.shipped'
                              }
                              values={{
                                date: formatDateOnly(activityLog.shipped.dateCreated),
                                by: formatPersonName(activityLog.shipped.person),
                              }}
                              components={{ strong: <strong /> }}
                            />
                          </p>
                        )}
                        {activityLog.unshipped && (
                          <p className="text-muted-foreground">
                            <Trans
                              i18nKey={
                                formatPersonName(activityLog.unshipped.person)
                                  ? 'timeline.log.unshippedWithBy'
                                  : 'timeline.log.unshipped'
                              }
                              values={{
                                date: formatDateOnly(activityLog.unshipped.dateCreated),
                                by: formatPersonName(activityLog.unshipped.person),
                              }}
                              components={{ strong: <strong /> }}
                            />
                          </p>
                        )}
                      </>
                    ) : (
                      dateSubmitted && (
                        <p className="text-muted-foreground">
                          <Trans
                            i18nKey={
                              formatPersonName(submittedByPerson)
                                ? 'timeline.log.submittedBasicWithBy'
                                : 'timeline.log.submittedBasic'
                            }
                            values={{
                              date: formatDateOnly(dateSubmitted),
                              by: formatPersonName(submittedByPerson),
                            }}
                            components={{ strong: <strong /> }}
                          />
                        </p>
                      )
                    )}
                  </div>
                )}

                {/* Order Received Stage */}
                {item.stage === 'OrderReceived' && (
                  <div className="space-y-2 text-sm">
                    {activityLog ? (
                      <>
                        {activityLog.received && (
                          <p className="text-muted-foreground">
                            <Trans
                              i18nKey={
                                formatPersonName(activityLog.received.person)
                                  ? 'timeline.log.receivedWithBy'
                                  : 'timeline.log.received'
                              }
                              values={{
                                date: formatDateOnly(activityLog.received.dateCreated),
                                by: formatPersonName(activityLog.received.person),
                              }}
                              components={{ strong: <strong /> }}
                            />
                          </p>
                        )}
                      </>
                    ) : (
                      dateSubmitted && (
                        <p className="text-muted-foreground">
                          <Trans
                            i18nKey={
                              formatPersonName(submittedByPerson)
                                ? 'timeline.log.submittedBasicWithBy'
                                : 'timeline.log.submittedBasic'
                            }
                            values={{
                              date: formatDateOnly(dateSubmitted),
                              by: formatPersonName(submittedByPerson),
                            }}
                            components={{ strong: <strong /> }}
                          />
                        </p>
                      )
                    )}
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
