import { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import RequestApi from '@/js/clients/base/OrderApi';
import DefaultClientOptions from '@/js/clients/DefaultClientOptions';
import type PartsOrder from '@/js/models/PartsOrder';
import PartsOrderWorkflowActionRequest from '@/js/models/PartsOrderWorkflowActionRequest';
import type RepairOrder from '@/js/models/RepairOrder';
import FileAssetFileAssetTypeEnum from '@/js/models/enum/FileAssetFileAssetTypeEnum';
import { type PersonType } from '@/js/models/enum/PersonTypeEnum';
import {
  AlertTriangle,
  AlertCircle,
  Check,
  Map,
  MapPin,
  Pencil,
  Plus,
  Tag,
  Users,
  Warehouse,
} from 'lucide-react';
import { toast } from 'sonner';
import audiNav from '@/assets/img/repair/audi.png';
import vwNav from '@/assets/img/repair/vw.png';
import { useAuthStore } from '@/stores/auth-store';
import { formatDateOnly, convertFilesToFileAssets } from '@/lib/utils';
import { useBrand } from '@/context/brand-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MarkRepairAsCompleteDialog } from '@/components/MarkRepairAsCompleteDialog';
import PartsOrderApprovedDialog from '@/components/PartsOrderApprovedDialog';
import { PartsOrderDialog } from '@/components/PartsOrderDialog';
import RepairOrderDialog, {
  type RepairOrderData,
} from '@/components/RepairOrderDialog';
import { Timeline } from '@/components/Timeline';
import { useTranslation } from 'react-i18next';
import PersonSearchRequest from '@/js/models/PersonSearchRequest';
import PersonApi from '@/js/clients/base/PersonApi';

export function RepairOrderDetail() {
  const { t } = useTranslation();
  const [userNams, setUserName] = useState<string>('');

  const [openPartsOrderDialog, setOpenPartsOrderDialog] = useState(false);
  const [initRepaitOrderData, setInitRepaitOrderData] = useState<RepairOrder>();
  const [
    isMarkRepairAsCompleteDialogOpen,
    setIsMarkRepairAsCompleteDialogOpen,
  ] = useState(false);
  const paramsData = useParams({ from: '/_authenticated/repair_orders/$id' });
  const repairId = paramsData.id.split(',')[0];
  const partId = paramsData.id.split(',')[1];

  const [initPartsOrderData, setInitPartsOrderData] = useState<PartsOrder[]>();
  const [selectedPartsOrderData, setSelectedPartsOrderData] =
    useState<PartsOrder>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isReject, setIsReject] = useState(false);
  const [nextSupplementNum, setNextSupplementNum] = useState(0);
  const [isSupplementMode, setIsSupplementMode] = useState(false);
  const { auth } = useAuthStore();
  const userType = auth.user?.person?.type as PersonType | undefined;
  const { brand } = useBrand();
  const navImg = brand === 'vw' ? vwNav : audiNav;

  const getRepairOrderDetail = async () => {
    try {
      return new Promise((resolve, reject) => {
        const api = new RequestApi();
        api.repairOrderGet(repairId, {
          status200: (response) => {
            setInitRepaitOrderData(response);
            getOrderDetailTopInfo(response.shop?.region?.id);
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

  const getOrderDetailTopInfo = async (regionId?: number) => {
    const filterByRegionId = regionId || initRepaitOrderData?.shop?.region?.id;
    if (!filterByRegionId) return;
    
    try {
      const request = PersonSearchRequest.create({
        type: 'Network',
        filterByRegionId,
      });
      const personApi = new PersonApi();

      personApi.search(request, {
        status200: (response) => {
          const users = response.persons.filter(
            (val: any) => val.status === 'Active' && val.type !== 'ProgramAdministrator'
          );
          const userNames = users
            .map((val: any) => `${val.firstName} ${val.lastName}`)
            .join(', ');
          setUserName(userNames);
        },
        error: (error) => {
          toast.error(error.message);
        },
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error((error as any).message);
      } else {
        toast.error('An unexpected error occurred');
      }
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
            const list: any[] =
              Object.prototype.toString.call(response) === '[object Array]'
                ? (response as any[])
                : [response];
            setSelectedPartsOrderData((prev) => {
              if (list.length === 0) return undefined;
              if (currentIndex >= 0 && currentIndex < list.length) {
                return list[currentIndex] as PartsOrder;
              }
              if (prev && (prev as any).id != null) {
                const found = list.find(
                  (po) => (po as any).id === (prev as any).id
                );
                if (found) return found as PartsOrder;
              }
              return list[0] as PartsOrder;
            });
            resolve(response);
          },
          error: () => {
            toast.error(t('repairOrder.detail.fetchError'));
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
            toast.success(t('repairOrder.detail.approveSuccess'));
            getPartsOrderDetail();
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.detail.approveFailed', { error }));
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
            toast.success(t('repairOrder.detail.rejectSuccess'));
            getPartsOrderDetail();
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.detail.rejectFailed', { error }));
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
            toast.success(t('repairOrder.detail.resubmitSuccess'));
            getPartsOrderDetail();
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.detail.resubmitFailed', { error }));
            reject(false);
          },
          else: () => {
            reject(false);
          },
        });
      });
    } catch (error) {
      toast.error(t('repairOrder.detail.resubmitFailed', { error }));
    }
  };

  const onResubmit = () => {
    // Reset isSupplementMode to undefined so the dialog can determine it from initialData
    setIsSupplementMode(undefined as any);
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
            // toast.success(t('repairOrder.detail.shippedSuccess'));
            getPartsOrderDetail();
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.detail.shippedFailed', { error }));
            reject(false);
          },
          else: () => {
            reject(false);
          },
        });
      });
    } catch (error) {
      toast.error(t('repairOrder.detail.shippedFailed', { error }));
    }
  };

  const handleTimelineMarkReceived = async (status: string) => {
    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi();
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: status === 'ShopReceived' ? 'Unreceived' : 'Received',
        });
        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            // toast.success(t('repairOrder.detail.receivedSuccess'));
            getPartsOrderDetail();
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.detail.receivedFailed', { error }));
            reject(false);
          },
          else: () => {
            reject(false);
          },
        });
      });
    } catch (error) {
      toast.error(t('repairOrder.detail.receivedFailed', { error }));
    }
  };

  const handleMarkRepairAsComplete = async (photos: File[]) => {
    try {
      // Convert File[] to FileAsset[]
      const postRepairPhotoFileAssets = await convertFilesToFileAssets(
        photos,
        FileAssetFileAssetTypeEnum.POST_REPAIR_PHOTO
      );

      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi();
        const request = {
          ...(initRepaitOrderData as any), // 先展开 initRepaitOrderData
          id: (initRepaitOrderData as any).id,
          postRepairPhotoFileAssets: postRepairPhotoFileAssets, // 然后覆盖 postRepairPhotoFileAssets
        };
        api.repairOrderComplete(request, {
          status200: () => {
            toast.success(t('repairOrder.detail.completeSuccess'));
            getRepairOrderDetail();
            getPartsOrderDetail();
            resolve(true);
          },
          error: (error) => {
            toast.error(t('repairOrder.detail.completeFailed', { error }));
            reject(false);
          },
          else: () => {
            reject(false);
          },
        });
      });
    } catch (error) {
      toast.error(t('repairOrder.detail.completeFailed', { error }));
    }
  };

  const handleTimelineApprove = () => {
    setIsApprovalDialogOpen(true);
    setIsReject(false);
  };

  const handleTimelineReject = () => {
    setIsApprovalDialogOpen(true);
    setIsReject(true);
  };
  const handleOpenDialog = (
    type: 'newOriginal' | 'edit' | 'newSupplement',
    data?: any
  ) => {
    let supplementMode = false;
    let supplementNum = 1;

    if (type === 'newSupplement') {
      supplementMode = true;
      supplementNum = initPartsOrderData?.length ?? 0;
    } else if (type === 'edit') {
      supplementMode =
        data?.partsOrderNumber !== undefined && data.partsOrderNumber > 0;
      supplementNum = supplementMode ? data.partsOrderNumber : 1;
    }

    setIsSupplementMode(supplementMode);
    setNextSupplementNum(supplementNum);
    setSelectedPartsOrderData(data ?? undefined);
    setOpenPartsOrderDialog(true);
    setIsReject(false);
  };

  const showIcon = (orderAny: any) => {
    // shop
    if (
      orderAny.stage === 'OrderReview' &&
      orderAny.status === 'CsrRejected' &&
      userType === 'Shop'
    ) {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    } else if (
      orderAny.stage === 'OrderReceived' &&
      orderAny.status === 'DealershipShipped' &&
      userType === 'Shop'
    ) {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    } else if (
      orderAny.stage === 'OrderFulfillment' &&
      orderAny.status === 'DealershipShipped' &&
      userType === 'Shop'
    ) {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    // Dealership
    if (
      orderAny.stage === 'OrderFulfillment' &&
      orderAny.status === 'DealershipProcessing' &&
      userType === 'Dealership'
    ) {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    // Csr
    if (
      orderAny.stage == 'OrderReview' &&
      orderAny.status === 'CsrReview' &&
      userType === 'Csr'
    ) {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    return null;
  };

  useEffect(() => {
    if (initPartsOrderData && initPartsOrderData.length > 0) {
      const index = initPartsOrderData.findIndex(
        (po: any) => po.id === Number(partId)
      );
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
          alt={brand === 'vw' ? t('brand.vw') : t('brand.audi')}
          className="object-cover w-full h-full mt-6"
        />
        <div className="absolute -translate-y-1/2 top-1/2 left-6 right-[360px] pr-4">
          <p className="text-3xl font-bold text-white truncate">
            {(initRepaitOrderData && initRepaitOrderData.shop?.name) || '--'}
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-200">
            <div className="flex items-start gap-2">
              <Warehouse className="w-5 h-5 mt-0.5 text-white flex-shrink-0" />
              <span className="break-words">
                {t('repairOrder.detail.assignedDealership')}:{' '}
                {(initRepaitOrderData &&
                  initRepaitOrderData.shop?.sponsorDealership.name) ||
                  '--'}{' '}
                (
                {initRepaitOrderData &&
                  initRepaitOrderData.shop?.sponsorDealership.dealershipNumber}
                )
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-5 h-5 mt-0.5 text-white flex-shrink-0" />
              <span className="break-words">
                Field Support Team : {userNams}
              </span>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 right-6 max-w-[320px] -translate-y-1/2 text-sm text-gray-200">
          <div className="grid gap-1">
            <div className="grid grid-cols-[24px_1fr] items-center gap-2">
              <Tag
                className="w-5 h-5 text-white justify-self-end"
                aria-hidden="true"
              />
              <span className="truncate">
                {(initRepaitOrderData &&
                  initRepaitOrderData.shop?.shopNumber) ||
                  '--'}
              </span>
            </div>
            <div className="my-1 grid grid-cols-[24px_1fr] items-center gap-2">
              <MapPin
                className="w-5 h-5 text-white justify-self-end"
                aria-hidden="true"
              />
              <span className="truncate">
                {initRepaitOrderData?.shop?.address ?? '--'},{' '}
                {initRepaitOrderData?.shop?.city ?? '--'},{' '}
                {initRepaitOrderData?.shop?.state ?? '--'}{' '}
                {initRepaitOrderData?.shop?.zip ?? '--'}
              </span>
            </div>
            <div className="grid grid-cols-[24px_1fr] items-center gap-2">
              <Map
                className="w-5 h-5 text-white justify-self-end"
                aria-hidden="true"
              />
              <span className="truncate">
                {initRepaitOrderData?.shop?.region.name ?? '--'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 mx-4 my-6">
        <div className="flex flex-col w-full border rounded-sm">
          <div className="flex items-center justify-between w-full p-5 bg-muted text-foreground">
            <h1 className="text-2xl font-bold tracking-tight">
              {t('repairOrder.detail.title')} {initRepaitOrderData?.roNumber || '--'}
            </h1>
            <div className="flex gap-3">
              {initPartsOrderData?.every(
                (order: any) =>
                  order.status === 'ShopReceived' ||
                  order.status === 'CsrRejected'
              ) && userType === 'Shop' ? (
                <Button
                  onClick={() => setIsMarkRepairAsCompleteDialogOpen(true)}
                  className="font-medium bg-green-600 h-9 rounded-lg px-4"
                >
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  {t('repairOrder.detail.markComplete')}
                </Button>
              ) : null}
              {userType === 'Shop' &&
              initPartsOrderData?.every(
                (order: any) => order.status !== 'RepairCompleted'
              ) ? (
                <Button
                  variant="outline"
                  className="font-medium rounded-lg h-9 px-4"
                  onClick={() => setOpen(true)}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  {t('repairOrder.detail.editRepairOrder')}
                </Button>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 p-5 md:grid-cols-3">
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground">
                  {t('repairOrder.detail.customer')}
                </span>
                <p className="font-medium">
                  {initRepaitOrderData?.customer || '--'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('repairOrder.detail.vin')}
                </span>
                <p className="font-medium">
                  {initRepaitOrderData?.vin || '--'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('repairOrder.detail.ymm')}
                </span>
                <p className="font-medium">
                  {initRepaitOrderData?.year} {initRepaitOrderData?.make}{' '}
                  {initRepaitOrderData?.model}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground">
                  {t('repairOrder.detail.dateSubmitted')}
                </span>
                <p className="font-medium">
                  {formatDateOnly(
                    initRepaitOrderData?.dateLastSubmitted as Date
                  ) || '--'}{' '}
                  by{' '}
                  {
                    (selectedPartsOrderData as any)?.submittedByPerson
                      ?.firstName
                  }{' '}
                  {(selectedPartsOrderData as any)?.submittedByPerson?.lastName}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('repairOrder.detail.submittedTo')}
                </span>
                <p className="font-medium flex items-center gap-2">
                
                  {initRepaitOrderData?.dealership?.id !== 
                    initRepaitOrderData?.shop?.sponsorDealership?.id && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ordered from an alternate dealer</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                    <span>
                    {initRepaitOrderData?.dealership?.name || '--'} (
                    {initRepaitOrderData?.dealership?.dealershipNumber})
                  </span>
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('repairOrder.detail.dateClosed')}
                </span>
                <p className="font-medium">
                  {(initRepaitOrderData as any)?.closedBy
                    ? `${formatDateOnly(initRepaitOrderData?.dateClosed as Date)} by ${(initRepaitOrderData as any)?.closedBy?.firstName || ''} ${(initRepaitOrderData as any)?.closedBy?.lastName || ''}`
                    : '--'}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-muted-foreground">
                  {t('repairOrder.detail.preRepairPhotos')}
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {initRepaitOrderData &&
                  initRepaitOrderData?.preRepairPhotoFileAssets
                    ? initRepaitOrderData.preRepairPhotoFileAssets.map((f) => (
                        <a
                          key={f.id}
                          href={`${DefaultClientOptions.getEndpointUrl()}${f.downloadUrl}`}
                          className="font-medium text-blue-700 underline hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {f.filename}
                        </a>
                      ))
                    : <p className="font-medium">--</p>}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('repairOrder.detail.structuralMeasurements')}
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {initRepaitOrderData?.structuralMeasurementFileAssets &&
                  initRepaitOrderData?.structuralMeasurementFileAssets.length >
                    0
                    ? initRepaitOrderData.structuralMeasurementFileAssets.map(
                        (f) => (
                          <a
                            key={f.id}
                            href={`${DefaultClientOptions.getEndpointUrl()}${f.downloadUrl}`}
                            className="font-medium text-blue-700 underline hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {f.filename}
                          </a>
                        )
                      )
                    : <p className="font-medium">--</p>}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('repairOrder.detail.postRepairPhotos')}
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {initRepaitOrderData?.postRepairPhotoFileAssets &&
                  initRepaitOrderData?.postRepairPhotoFileAssets.length > 0
                    ? initRepaitOrderData.postRepairPhotoFileAssets.map((f) => (
                        <a
                          key={f.id}
                          href={`${DefaultClientOptions.getEndpointUrl()}${f.downloadUrl}`}
                          className="font-medium text-blue-700 underline hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {f.filename}
                        </a>
                      ))
                    : <p className="font-medium">--</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col my-5 border rounded-sm">
          <div className="flex items-center justify-between p-5 overflow-hidden bg-muted">
            <div className="flex items-center gap-6 text-sm font-medium">
              {initPartsOrderData && initPartsOrderData.length > 0 && (
                <>
                  <Button
                    variant={currentIndex === 0 ? 'default' : 'outline'}
                    className="font-medium rounded-lg h-9"
                    onClick={() => {
                      const partsOrder = initPartsOrderData.find(
                        (po: any) => po.partsOrderNumber === 0
                      );
                      setCurrentIndex(0);
                      setSelectedPartsOrderData(partsOrder);
                    }}
                  >
                    {showIcon(
                      initPartsOrderData.find(
                        (po: any) => po.partsOrderNumber === 0
                      )
                    )}
                    {t('repairOrder.detail.partsOrder')}
                  </Button>
                  {initPartsOrderData
                    .filter(
                      (po: any) =>
                        po.partsOrderNumber && po.partsOrderNumber > 0
                    )
                    .map((partsOrder: any, index: number) => (
                      <Button
                        className="font-medium rounded-lg h-9"
                        key={partsOrder.id || index}
                        variant={
                          currentIndex === index + 1 ? 'default' : 'outline'
                        }
                        onClick={() => {
                          setSelectedPartsOrderData(partsOrder);
                          setCurrentIndex(index + 1);
                        }}
                      >
                        {showIcon(partsOrder)}
                        {t('repairOrder.detail.supplement')}{' '}
                        {partsOrder.partsOrderNumber}
                      </Button>
                    ))}
                </>
              )}
            </div>
            {initPartsOrderData?.some(
              (order: any) =>
                order.status !== 'RepairCompleted' ||
                order.status === 'CsrRejected' ||
                order.status !== 'RepairCompleted'
            ) &&
              userType === 'Shop' && (
                <Button
                  onClick={() => handleOpenDialog('newSupplement')}
                  variant="outline"
                  className="font-medium rounded-lg h-9 px-4"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t('repairOrder.detail.supplementalPartsOrder')}
                </Button>
              )}
          </div>
          <div className="flex gap-8 m-5">
            <div className="flex-1 max-w-lg">
              {((selectedPartsOrderData ||
                (initPartsOrderData &&
                  initPartsOrderData.length > 0 &&
                  initPartsOrderData[0])) && (
                <Card className="border shadow-sm rounded-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold text-foreground">
                        {t('repairOrder.detail.salesOrder')}: &nbsp;
                        {(selectedPartsOrderData as any)?.salesOrderNumber ||
                          '--'}
                      </CardTitle>
                      {(userType === 'Shop' &&
                        (selectedPartsOrderData as any)?.stage ==
                          'OrderReview' &&
                        (selectedPartsOrderData as any)?.status !==
                          'DealershipProcessing' &&
                        (selectedPartsOrderData as any)?.status !==
                          'CsrRejected') ||
                      (userType === 'Csr' &&
                        (selectedPartsOrderData as any)?.status !==
                          'CsrReview' &&
                        (selectedPartsOrderData as any)?.status !==
                          'CsrRejected' &&
                        (selectedPartsOrderData as any)?.stage !==
                          'OrderReceived' &&
                        (selectedPartsOrderData as any)?.status !==
                          'RepairCompleted') ? (
                        <Button
                          onClick={() =>
                            handleOpenDialog('edit', selectedPartsOrderData)
                          }
                          variant="outline"
                          className="font-medium rounded-lg h-9 px-4"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          {(selectedPartsOrderData as any)?.partsOrderNumber > 0
                            ? t('repairOrder.detail.editSupplement', {
                                num: (selectedPartsOrderData as any)
                                  .partsOrderNumber,
                              })
                            : t('repairOrder.detail.editPartsOrder')}
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm">
                    <div>
                      <h4 className="mb-3 font-medium text-muted-foreground">
                        {t('repairOrder.detail.requestedParts')}
                      </h4>
                      <ol className=" space-y-2 text-foreground/90">
                        {((selectedPartsOrderData as any)?.parts?.length > 0 &&
                          (selectedPartsOrderData as any)?.parts?.map(
                            (part: string, idx: number) => (
                              <li key={part + idx}>
                                ({idx + 1}) {part}
                              </li>
                            )
                          )) ||
                          t('repairOrder.detail.noPartsRequested')}
                      </ol>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t('repairOrder.detail.partsEstimate')}
                      </span>
                      <br />
                      {(selectedPartsOrderData &&
                        (selectedPartsOrderData as any).estimateFileAssets &&
                        (selectedPartsOrderData as any).estimateFileAssets
                          .length > 0 &&
                        (selectedPartsOrderData as any).estimateFileAssets.map(
                          (file: any) => (
                            <a
                              key={file.id}
                              href={`${DefaultClientOptions.getEndpointUrl() + file.viewUrl}`}
                              className="block my-2 text-blue-700 underline hover:underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              {file.filename}
                              <br />
                            </a>
                          )
                        )) ||
                        t('repairOrder.detail.noEstimateFile')}
                    </div>
                  </CardContent>
                </Card>
              )) ||
                t('repairOrder.detail.noPartsOrderData')}
            </div>
            <div className="flex-1 min-w-0">
              <Timeline
                partsOrder={
                  selectedPartsOrderData ||
                  (initPartsOrderData &&
                    initPartsOrderData.length > 0 &&
                    initPartsOrderData?.[0])
                }
                onApprove={handleTimelineApprove}
                onReject={handleTimelineReject}
                onResubmit={onResubmit}
                onMarkShipped={(status: string) =>
                  handleTimelineMarkShipped(status)
                }
                onMarkReceived={(status: string) =>
                  handleTimelineMarkReceived(status)
                }
              />
            </div>
          </div>
        </div>
      </div>
      <PartsOrderDialog
        open={openPartsOrderDialog}
        onOpenChange={(newOpen) => {
          setOpenPartsOrderDialog(newOpen);
          if (!newOpen) {
            getPartsOrderDetail();
          }
        }}
        initialData={selectedPartsOrderData}
        initRepaitOrderData={initRepaitOrderData}
        supplementNumber={isSupplementMode ? nextSupplementNum : 0}
        isSupplementMode={isSupplementMode}
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
