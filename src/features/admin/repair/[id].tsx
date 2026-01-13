import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import RequestApi from '@/js/clients/base/OrderApi';
import type PartsOrder from '@/js/models/PartsOrder';
import PartsOrderWorkflowActionRequest from '@/js/models/PartsOrderWorkflowActionRequest';
import type RepairOrder from '@/js/models/RepairOrder';
import { type PersonType } from '@/js/models/enum/PersonTypeEnum';
import { AlertTriangle, Check, Map, MapPin, Pencil, Plus, Tag, Users, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import audiNav from '@/assets/img/repair/audi.png';
import vwNav from '@/assets/img/repair/vw.png';
import { useAuthStore } from '@/stores/auth-store';
import { formatDateOnly } from '@/lib/utils';
import { useBrand } from '@/context/brand-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkRepairAsCompleteDialog } from '@/components/MarkRepairAsCompleteDialog';
import PartsOrderApprovedDialog from '@/components/PartsOrderApprovedDialog';
import { PartsOrderDialog } from '@/components/PartsOrderDialog';
import RepairOrderDialog, { type RepairOrderData } from '@/components/RepairOrderDialog';
import { Timeline } from '@/components/Timeline';
import { useTranslation } from 'react-i18next';

export function RepairOrderDetail() {
  const { t } = useTranslation();
  const [openPartsOrderDialog, setOpenPartsOrderDialog] = useState(false);
  const [initRepaitOrderData, setInitRepaitOrderData] = useState<RepairOrder>();
  const [isMarkRepairAsCompleteDialogOpen, setIsMarkRepairAsCompleteDialogOpen] = useState(false);
  const paramsData = useParams({ from: '/_authenticated/repair_orders/$id' });
  const repairId = paramsData.id.split(',')[0];
  const partId = paramsData.id.split(',')[1];
  const [initPartsOrderData, setInitPartsOrderData] = useState<PartsOrder[]>();
  const [selectedPartsOrderData, setSelectedPartsOrderData] = useState<PartsOrder>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setOpen] = useState(false);

  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isReject, setIsReject] = useState(false);
  // ✅ Get current user role
  const { auth } = useAuthStore();
  const userType = auth.user?.person?.type as PersonType | undefined;
  const { user } = useAuthStore((state) => state.auth);
  const { brand } = useBrand();
  const navImg = brand === 'vw' ? vwNav : audiNav;
  const getRepairOrderDetail = async () => {
    try {
      return new Promise((resolve, reject) => {
        const api = new RequestApi();
        api.repairOrderGet(repairId, {
          status200: (response) => {
            setInitRepaitOrderData(response);
            resolve(response);
          },
          error: (error) => {
            console.error('Error:', error);
            reject(error);
          },
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getPartsOrderDetail = async () => {
    try {
      return new Promise((resolve, reject) => {
        const api = new RequestApi();
        api.partsOrderGetAllForRepairOrder(repairId, {
          status200: (response) => {
            if (Object.prototype.toString.call(response) === '[object Array]') {
              setInitPartsOrderData(response);
            } else {
              setInitPartsOrderData([response]);
            }
            // Standardize to array
            const list: any[] =
              Object.prototype.toString.call(response) === '[object Array]' ? (response as any[]) : [response];

            // According to currentIndex or selected id Synchronously update selectedPartsOrderData
            setSelectedPartsOrderData((prev) => {
              if (list.length === 0) return undefined;
              if (currentIndex >= 0 && currentIndex < list.length) {
                return list[currentIndex] as PartsOrder;
              }
              //By id Match the previously selected one
              if (prev && (prev as any).id != null) {
                const found = list.find((po) => (po as any).id === (prev as any).id);
                if (found) return found as PartsOrder;
              }
              return list[0] as PartsOrder;
            });

            resolve(response);
          },
          error: (error) => {
            toast.error(t('repairOrder.messages.error', { error }));
            reject();
          },
          else: (_statusCode, responseText) => {
            toast.error(responseText);
            reject();
          },
        });
      });
    } catch (e) {
      console.error(e);
    }
  };
  // ✅ Approve Parts Order
  const handleApprove = async (salesOrderNumber: string) => {
    if (!selectedPartsOrderData || !(selectedPartsOrderData as any).id) return;

    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi();
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: 'Approved',
          salesOrderNumber: salesOrderNumber,
        });

        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            toast.success(t('repairOrder.messages.approveSuccess'));
            getPartsOrderDetail(); // Refresh data
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.messages.approveFailed', { error }));
            console.error(error);
            reject(false);
          },
          else: () => {
            reject(false);
          },
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Reject Parts Order
  const handleReject = async (comment: string) => {
    if (!selectedPartsOrderData || !(selectedPartsOrderData as any).id) return;

    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi();
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: 'Rejected',
          comment: comment,
        });

        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            toast.success(t('repairOrder.messages.rejectSuccess'));
            getPartsOrderDetail(); // Refresh data
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.messages.rejectFailed', { error }));
            reject(false);
          },
          else: () => {
            reject(false);
          },
        });
      });
    } catch (error) {
      console.error(error);
    }
  };
  // ✅ Resubmit Parts Order
  const handleTimelineResubmit = async (comment: string) => {
    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi();
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: 'Resubmitted',
          comment: comment,
          salesOrderNumber: (selectedPartsOrderData as any).salesOrderNumber,
        });
        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            toast.success(t('repairOrder.messages.resubmitSuccess'));
            getPartsOrderDetail(); // Refresh data
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.messages.resubmitFailed', { error }));
            reject(false);
          },
          else: () => {
            reject(false);
          },
        });
      });
    } catch (error) {
      toast.error(`Failed to resubmit parts order ${error}|`);
    }
  };
  const onResubmit = () => {
    setOpenPartsOrderDialog(true);
    setIsReject(true);
  };
  const handleTimelineMarkShipped = async (status: string) => {
    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi();
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: status === 'DealershipShipped' ? 'Unshipped' : 'Shipped',
        });
        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            toast.success(t('repairOrder.messages.shippedSuccess'));
            getPartsOrderDetail(); // Refresh data
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.messages.shippedFailed', { error }));
            reject(false);
          },
          else: () => {
            reject(false);
          },
        });
      });
    } catch (error) {
      toast.error(`Failed to mark parts order as shipped ${error}|`);
    }
  };
  const handleTimelineMarkReceived = async (status: string) => {
    console.log(status);
    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi();
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: status === 'ShopReceived' ? 'Unreceived' : 'Received',
        });
        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            toast.success(t('repairOrder.messages.receivedSuccess'));
            getPartsOrderDetail(); // Refresh data
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.messages.receivedFailed', { error }));
            reject(false);
          },
          else: () => {
            reject(false);
          },
        });
      });
    } catch (error) {
      toast.error(`Failed to mark parts order as received ${error}|`);
    }
  };
  const handleMarkRepairAsComplete = async (photos: File[]) => {
    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi();
        const request = {
          id: (initRepaitOrderData as any).id,
          preRepairPhotoFileAssets: photos,
          ...(initRepaitOrderData as any),
        };
        api.repairOrderComplete(request, {
          status200: () => {
            toast.success(t('repairOrder.messages.completeSuccess'));
            getRepairOrderDetail(); // Refresh data
            getPartsOrderDetail();
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.messages.completeFailed', { error }));
            reject(false);
          },
          else: () => {
            reject(false);
          },
        });
      });
    } catch (error) {
      toast.error(`Failed to mark repair order as complete ${error}|`);
    }
  };
  // ✅ Timeline of onApprove and onReject Callback
  const handleTimelineApprove = () => {
    setIsApprovalDialogOpen(true);
    setIsReject(false);
  };

  const handleTimelineReject = () => {
    setIsApprovalDialogOpen(true);
    setIsReject(true);
  };

  useEffect(() => {
    if (initPartsOrderData && initPartsOrderData.length > 0) {
      const index = initPartsOrderData.findIndex((po: any) => po.id === Number(partId));
      index >= 0 ? setCurrentIndex(index) : setCurrentIndex(0);
    } else {
      setCurrentIndex(0);
    }

  }, [initPartsOrderData, partId]);

  useEffect(() => {
    getRepairOrderDetail();
    getPartsOrderDetail();
  }, []);
  return (
    <div className="bg-background text-foreground">
      <div className="relative w-full h-40">
        <img
          src={navImg}
          alt={brand === 'vw' ? t('repairOrder.navigation.vw') : t('repairOrder.navigation.audi')}
          className="object-cover w-full h-full mt-6"
        />
        <div className="absolute -translate-y-1/2 top-1/2 left-6">
          <p className="text-3xl font-bold text-white">
            {user?.person?.shop?.name || (user?.person?.csrRegion && user?.person?.csrRegion.name) || '--'}
          </p>
          <p className="flex items-center mt-4 space-x-4 text-sm text-gray-200">
            {/* House icon */}
            <Warehouse className="w-5 h-5 text-white" />
            {(user?.person?.shop && (
              <span>
                {t('repairOrder.header.assignedDealership')}: {user?.person?.shop?.sponsorDealership.name ?? '--'}({' '}
                {user?.person?.shop?.sponsorDealership.dealershipNumber})
              </span>
            )) ||
              '--'}
            <Users className="w-5 h-5 ml-6 text-white" />
            <span>
              {' '}
              { user?.person?.type==='ProgramAdministrator'
                ? t('user.list.role.programAdministrator') 
                : user?.person?.type === 'Csr'
                  ? 'CSR'
                  : user?.person?.type
              }: {user?.person?.firstName} {user?.person?.lastName}
            </span>
          </p>
        </div>
        <div className="absolute top-1/2 right-6 max-w-[320px] -translate-y-1/2 text-sm text-gray-200">
          <div className="grid gap-1">
            <div className="grid grid-cols-[24px_1fr] items-center gap-2">
              <Tag className="w-5 h-5 text-white justify-self-end" aria-hidden="true" />
              <span className="truncate">{user?.person?.shop?.shopNumber ?? '--'}</span>
            </div>

            <div className="my-1 grid grid-cols-[24px_1fr] items-center gap-2">
              <MapPin className="w-5 h-5 text-white justify-self-end" aria-hidden="true" />
              <span className="truncate">
                {user?.person?.shop?.address ?? '--'},{user?.person?.shop?.city ?? '--'},
                {user?.person?.shop?.state ?? '--'}&nbsp;
                {user?.person?.shop?.zip ?? '--'}
              </span>
            </div>

            <div className="grid grid-cols-[24px_1fr] items-center gap-2">
              <Map className="w-5 h-5 text-white justify-self-end" aria-hidden="true" />
              <span className="truncate">{user?.person?.shop?.region.name ?? '--'}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 mx-4 my-6">
        <div className="flex flex-col w-full border rounded-sm">
          <div className="flex items-center justify-between w-full p-5 bg-muted text-foreground">
            <h1 className="text-2xl font-bold tracking-tight">
              {t('repairOrder.detail.title')}: &nbsp;{initRepaitOrderData?.roNumber || '--'}
            </h1>
            <div className="flex gap-3">
              {initPartsOrderData?.every(
                (order: any) => order.status === 'ShopReceived' || order.status === 'CsrRejected'
              ) && userType === 'Shop' ? (
                <Button
                  onClick={() => setIsMarkRepairAsCompleteDialogOpen(true)}
                  size="sm"
                  className="text-xs font-medium bg-green-600 h-9"
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  {t('repairOrder.detail.markComplete')}
                </Button>
              ) : null}
              {userType === 'Shop' && initPartsOrderData?.every((order: any) => order.status !== 'RepairCompleted') ? (
                <Button size="sm" variant="outline" className="text-xs font-medium h-9" onClick={() => setOpen(true)}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  {t('repairOrder.detail.editRepairOrder')}
                </Button>
              ) : null}
            </div>
          </div>
          {/* 2. Information area - Minimal three-column，Font 14px Body feeling */}
          <div className="grid grid-cols-1 gap-8 p-5 md:grid-cols-3">
            {/* Left column */}
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground">{t('repairOrder.detail.customer')}</span>
                <p className="font-medium">{initRepaitOrderData?.customer || '--'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('repairOrder.detail.vin')}</span>
                <p>{initRepaitOrderData?.vin || '--'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('repairOrder.detail.ymm')}</span>
                <p className="font-medium">
                  {initRepaitOrderData?.year}&nbsp;{initRepaitOrderData?.make}&nbsp;{initRepaitOrderData?.model}
                </p>
              </div>
            </div>
            {/* Middle column */}
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground">{t('repairOrder.detail.dateSubmitted')}</span>
                <p>
                  {formatDateOnly(initRepaitOrderData?.dateLastSubmitted as Date) || '--'}
                  {' ' + t('repairOrder.detail.by') + ' '}
                  {(selectedPartsOrderData as any)?.submittedByPerson?.firstName +
                    ' ' +
                    (selectedPartsOrderData as any)?.submittedByPerson?.lastName}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('repairOrder.detail.submittedTo')}</span>
                <p className="font-medium">{initRepaitOrderData?.dealership?.name || '--'}&nbsp;({initRepaitOrderData?.dealership?.dealershipNumber})</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('repairOrder.detail.dateClosed')}</span>
                <p className="text-muted-foreground">
                  {formatDateOnly(initRepaitOrderData?.dateClosed as Date) || '--'}
                  {initRepaitOrderData?.dateClosed && ' by' + ' '}
                  {initRepaitOrderData?.dateClosed &&
                    (selectedPartsOrderData as any)?.reviewedByPerson?.firstName +
                      ' ' +
                      (selectedPartsOrderData as any)?.reviewedByPerson?.lastName}
                </p>
              </div>
            </div>
            {/* Right column - File links more compact */}
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t('repairOrder.detail.preRepairPhotos')}</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {initRepaitOrderData &&
                  initRepaitOrderData?.preRepairPhotoFileAssets &&
                  initRepaitOrderData?.preRepairPhotoFileAssets.length > 0
                    ? initRepaitOrderData?.preRepairPhotoFileAssets?.map((f) => (
                        <a
                          key={f.id}
                          href={`${import.meta.env.VITE_API_URL}${f.downloadUrl}`}
                          className="text-blue-700 underline hover:underline"
                          target="_blank"
                        >
                          {f.filename}
                        </a>
                      ))
                    : '--'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">{t('repairOrder.detail.structuralMeasurements')}</span>
                <br />
                <div className="text-primary hover:underline">
                  {initRepaitOrderData?.structuralMeasurementFileAssets &&
                  initRepaitOrderData?.structuralMeasurementFileAssets.length > 0
                    ? initRepaitOrderData?.structuralMeasurementFileAssets?.map((f) => (
                        <a
                          key={f.id}
                          href={`${import.meta.env.VITE_API_URL}${f.downloadUrl}`}
                          className="text-blue-700 underline hover:underline"
                          target="_blank"
                        >
                          {f.filename}
                        </a>
                      ))
                    : '--'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">{t('repairOrder.detail.postRepairPhotos')}</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {initRepaitOrderData?.postRepairPhotoFileAssets &&
                  initRepaitOrderData?.postRepairPhotoFileAssets.length > 0
                    ? initRepaitOrderData?.postRepairPhotoFileAssets?.map((f) => (
                        <a
                          key={f.id}
                          href={`${import.meta.env.VITE_API_URL}${f.downloadUrl}`}
                          className="text-blue-700 underline hover:underline"
                          target="_blank"
                        >
                          {f.filename}
                        </a>
                      ))
                    : '--'}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col my-5 border rounded-sm">
          {/* 3. Tabs + Main content area */}
          <div className="flex items-center justify-between p-5 overflow-hidden bg-muted">
            {/* Left side：Tiled labels + Warning */}
            <div className="flex items-center gap-6 text-sm font-medium">
              {initPartsOrderData && initPartsOrderData.length > 0 && (
                <>
                  {/* Parts Order Button（First，partsOrderNumber === 0） */}
                  <Button
                    variant={currentIndex === 0 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const partsOrder = initPartsOrderData.find((po: any) => po.partsOrderNumber === 0);
                      setCurrentIndex(0);
                      setSelectedPartsOrderData(partsOrder);
                    }}
                  >
                    {t('partsOrder.types.0')}
                  </Button>

                  {/* Supplement Button（partsOrderNumber > 0） */}
                  {initPartsOrderData
                    .filter((po: any) => po.partsOrderNumber && po.partsOrderNumber > 0)
                    .map((partsOrder: any, index: number) => (
                      <Button
                        key={partsOrder.id || index}
                        variant={currentIndex === index + 1 ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedPartsOrderData(partsOrder);
                          setCurrentIndex(index + 1);
                        }}
                      >
                        {partsOrder.hasAlert && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        {t('partsOrder.supplement')} {partsOrder.partsOrderNumber}
                      </Button>
                    ))}
                </>
              )}
            </div>

            {/* Right side：Add button */}
            {initPartsOrderData?.some(
              (order: any) =>
                order.status !== 'RepairCompleted' ||
                order.status === 'CsrRejected' ||
                order.status !== 'RepairCompleted'
            ) &&
              userType === 'Shop' && (
                <Button
                  onClick={() => {
                    setSelectedPartsOrderData(undefined);
                    setOpenPartsOrderDialog(true);
                    setIsReject(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="font-medium rounded-lg h-9"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t('repairOrder.detail.supplementalPartsOrder')}
                </Button>
              )}
          </div>
          {/* 3. True left-right layout */}
          <div className="flex gap-8 m-5">
            <div className="flex-1 max-w-lg">
              {((selectedPartsOrderData ||
                (initPartsOrderData && initPartsOrderData.length > 0 && initPartsOrderData[0])) && (
                <Card className="border shadow-sm rounded-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-foreground">
                        {t('repairOrder.detail.salesOrder')}: &nbsp;{(selectedPartsOrderData as any)?.salesOrderNumber || '--'}
                      </CardTitle>
                      {(userType === 'Shop' &&
                        (selectedPartsOrderData as any)?.stage == 'OrderReview' &&
                        (selectedPartsOrderData as any)?.status !== 'DealershipProcessing') ||
                      (userType === 'Csr' &&
                        (selectedPartsOrderData as any)?.status !== 'CsrReview' &&
                        (selectedPartsOrderData as any)?.status !== 'CsrRejected' &&
                        (selectedPartsOrderData as any)?.stage !== 'OrderReceived' &&
                        (selectedPartsOrderData as any)?.status !== 'RepairCompleted') ? (
                        <Button
                          onClick={() => {
                            setSelectedPartsOrderData(selectedPartsOrderData);
                            setOpenPartsOrderDialog(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="px-4 text-xs h-9"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {t('repairOrder.detail.editPartsOrder')}
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 text-sm">
                    <div>
                      <h4 className="mb-3 font-medium text-muted-foreground">{t('repairOrder.detail.requestedParts')}</h4>
                      <ol className="pl-5 space-y-2 text-foreground/90">
                        {((selectedPartsOrderData as any)?.parts?.length > 0 &&
                          (selectedPartsOrderData as any)?.parts?.map((part: string, idx: number) => (
                            <li key={part + idx}>
                              ({idx + 1}) {part}
                            </li>
                          ))) ||
                          t('repairOrder.detail.noPartsRequested')}
                      </ol>
                    </div>

                    <div>
                      <span className="text-muted-foreground">{t('repairOrder.detail.partsEstimate')}</span>
                      <br />
                      {(selectedPartsOrderData &&
                        (selectedPartsOrderData as any).estimateFileAssets &&
                        (selectedPartsOrderData as any).estimateFileAssets.length > 0 &&
                        (selectedPartsOrderData as any).estimateFileAssets.map((file: any) => (
                          <a
                            key={file.id}
                            href={`${import.meta.env.VITE_API_URL + file.viewUrl}`}
                            className="text-blue-700 underline hover:underline"
                          >
                            {file.filename}
                          </a>
                        ))) ||
                        t('repairOrder.detail.noEstimateFile')}
                    </div>
                  </CardContent>
                </Card>
              )) ||
                '-- No parts order data'}
            </div>
            {/* Right side：Parts Tracker Timeline（Plain text + Green solid line） */}
            <div className="flex-1 min-w-0">
              {/* min-w-0 Prevent flex Overflow */}
              <Timeline
                partsOrder={
                  selectedPartsOrderData ||
                  (initPartsOrderData && initPartsOrderData.length > 0 && initPartsOrderData?.[0])
                }
                onApprove={handleTimelineApprove}
                onReject={handleTimelineReject}
                onResubmit={onResubmit}
                onMarkShipped={(status: string) => handleTimelineMarkShipped(status)}
                onMarkReceived={(status: string) => handleTimelineMarkReceived(status)}
              />
            </div>
          </div>
        </div>
      </div>
      <PartsOrderDialog
        open={openPartsOrderDialog}
        onOpenChange={setOpenPartsOrderDialog}
        initialData={selectedPartsOrderData}
        initRepaitOrderData={initRepaitOrderData}
        onSuccess={() => {
          getPartsOrderDetail();
        }}
        isReject={isReject}
        onHandleResubmit={handleTimelineResubmit}
      />
      <PartsOrderApprovedDialog
        open={isApprovalDialogOpen}
        onOpenChange={setIsApprovalDialogOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        isReject={isReject}
        initRepaitOrderData={initRepaitOrderData}
        selectPartsOrderData={selectedPartsOrderData}
      />
      <MarkRepairAsCompleteDialog
        open={isMarkRepairAsCompleteDialogOpen}
        onOpenChange={setIsMarkRepairAsCompleteDialogOpen}
        initRepaitOrderData={initRepaitOrderData}
        onComplete={(photos: File[]) => handleMarkRepairAsComplete(photos)}
      />
      <RepairOrderDialog
        open={isOpen}
        onOpenChange={setOpen}
        initialData={initRepaitOrderData as RepairOrderData}
        onSuccess={getRepairOrderDetail}
      />
    </div>
  );
}
