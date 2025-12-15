import { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import RequestApi from '@/js/clients/base/OrderApi'
import type PartsOrder from '@/js/models/PartsOrder'
import PartsOrderWorkflowActionRequest from '@/js/models/PartsOrderWorkflowActionRequest'
import type RepairOrder from '@/js/models/RepairOrder'
import { type PersonType } from '@/js/models/enum/PersonTypeEnum'
import {
  AlertTriangle,
  Check,
  Map,
  MapPin,
  Pencil,
  Plus,
  Tag,
  Users,
  Warehouse,
} from 'lucide-react'
import { toast } from 'sonner'
import audiNav from '@/assets/img/repair/audi.png'
import vwNav from '@/assets/img/repair/vw.png'
import { useAuthStore } from '@/stores/auth-store'
import { formatDateOnly } from '@/lib/utils'
import { useBrand } from '@/context/brand-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkRepairAsCompleteDialog } from '@/components/MarkRepairAsCompleteDialog'
import PartsOrderApprovedDialog from '@/components/PartsOrderApprovedDialog'
import { PartsOrderDialog } from '@/components/PartsOrderDialog'
import RepairOrderDialog, {
  type RepairOrderData,
} from '@/components/RepairOrderDialog'
import { Timeline } from '@/components/Timeline'

export function RepairOrderDetail() {
  const [openPartsOrderDialog, setOpenPartsOrderDialog] = useState(false)
  const [initRepaitOrderData, setInitRepaitOrderData] = useState<RepairOrder>()
  const [
    isMarkRepairAsCompleteDialogOpen,
    setIsMarkRepairAsCompleteDialogOpen,
  ] = useState(false)
  const id = useParams({ from: '/_authenticated/repair_orders/$id' }).id
  const [initPartsOrderData, setInitPartsOrderData] = useState<PartsOrder[]>()
  const [selectedPartsOrderData, setSelectedPartsOrderData] =
    useState<PartsOrder>()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setOpen] = useState(false)

  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [isReject, setIsReject] = useState(false)
  // ✅ 获取当前用户角色
  const { auth } = useAuthStore()
  const userType = auth.user?.person?.type as PersonType | undefined
  const { user } = useAuthStore((state) => state.auth)
  const { brand } = useBrand()
  const navImg = brand === 'vw' ? vwNav : audiNav

  const getRepairOrderDetail = async () => {
    try {
      return new Promise((resolve, reject) => {
        const api = new RequestApi()
        api.repairOrderGet(id, {
          status200: (response) => {
            setInitRepaitOrderData(response)
            resolve(response)
          },
          error: (error) => {
            console.error('Error:', error)
            reject(error)
          },
        })
      })
    } catch (e) {
      console.error(e)
    }
  }

  const getPartsOrderDetail = async () => {
    try {
      return new Promise((resolve, reject) => {
        const api = new RequestApi()
        api.partsOrderGetAllForRepairOrder(id, {
          status200: (response) => {
            if (Object.prototype.toString.call(response) === '[object Array]') {
              setInitPartsOrderData(response)
            } else {
              setInitPartsOrderData([response])
            }
            // 标准化为数组
            const list: any[] =
              Object.prototype.toString.call(response) === '[object Array]'
                ? (response as any[])
                : [response]

            // 根据 currentIndex 或已选中的 id 同步更新 selectedPartsOrderData
            setSelectedPartsOrderData((prev) => {
              if (list.length === 0) return undefined
              if (currentIndex >= 0 && currentIndex < list.length) {
                return list[currentIndex] as PartsOrder
              }
              //按 id 匹配之前选中的那条
              if (prev && (prev as any).id != null) {
                const found = list.find(
                  (po) => (po as any).id === (prev as any).id
                )
                if (found) return found as PartsOrder
              }
              return list[0] as PartsOrder
            })

            resolve(response)
          },
          error: (error) => {
            toast.error('Error:', error)
            reject()
          },
          else: (_statusCode, responseText) => {
            toast.error(responseText)
            reject()
          },
        })
      })
    } catch (e) {
      console.error(e)
    }
  }
  // ✅ 批准 Parts Order
  const handleApprove = async (salesOrderNumber: string) => {
    if (!selectedPartsOrderData || !(selectedPartsOrderData as any).id) return

    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi()
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: 'Approved',
          salesOrderNumber: salesOrderNumber,
        })

        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            toast.success('Parts order approved successfully')
            getPartsOrderDetail() // 刷新数据
            resolve(true)
          },
          error: (error) => {
            toast.error(`Failed to approve parts order ${error}|`)
            console.error(error)
            reject(false)
          },
          else: () => {
            reject(false)
          },
        })
      })
    } catch (error) {
      console.error(error)
    }
  }

  // ✅ 拒绝 Parts Order
  const handleReject = async (comment: string) => {
    if (!selectedPartsOrderData || !(selectedPartsOrderData as any).id) return

    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi()
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: 'Rejected',
          comment: comment,
        })

        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            toast.success('Parts order rejected successfully')
            getPartsOrderDetail() // 刷新数据
            resolve(true)
          },
          error: (error) => {
            toast.error(`Failed to reject parts order ${error}|`)
            reject(false)
          },
          else: () => {
            reject(false)
          },
        })
      })
    } catch (error) {
      console.error(error)
    }
  }
  // ✅ 重新提交 Parts Order
  const handleTimelineResubmit = async (comment: string) => {
    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi()
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: 'Resubmitted',
          comment: comment,
          salesOrderNumber: (selectedPartsOrderData as any).salesOrderNumber,
        })
        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            toast.success('Parts order resubmitted successfully')
            getPartsOrderDetail() // 刷新数据
            resolve(true)
          },
          error: (error) => {
            toast.error(`Failed to resubmit parts order ${error}|`)
            reject(false)
          },
          else: () => {
            reject(false)
          },
        })
      })
    } catch (error) {
      toast.error(`Failed to resubmit parts order ${error}|`)
    }
  }
  const onResubmit = () => {
    setOpenPartsOrderDialog(true)
    setIsReject(true)
  }
  const handleTimelineMarkShipped = async (status: string) => {
    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi()
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: status === 'DealershipShipped' ? 'Unshipped' : 'Shipped',
        })
        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            toast.success('Parts order marked as shipped successfully')
            getPartsOrderDetail() // 刷新数据
            resolve(true)
          },
          error: (error) => {
            toast.error(`Failed to mark parts order as shipped ${error}|`)
            reject(false)
          },
          else: () => {
            reject(false)
          },
        })
      })
    } catch (error) {
      toast.error(`Failed to mark parts order as shipped ${error}|`)
    }
  }
  const handleTimelineMarkReceived = async (status: string) => {
    console.log(status)
    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi()
        const request = PartsOrderWorkflowActionRequest.create({
          partsOrderId: (selectedPartsOrderData as any).id,
          action: status === 'ShopReceived' ? 'Unreceived' : 'Received',
        })
        api.partsOrderSubmitWorkflowAction(request, {
          status200: () => {
            toast.success('Parts order marked as received successfully')
            getPartsOrderDetail() // 刷新数据
            resolve(true)
          },
          error: (error) => {
            toast.error(`Failed to mark parts order as received ${error}|`)
            reject(false)
          },
          else: () => {
            reject(false)
          },
        })
      })
    } catch (error) {
      toast.error(`Failed to mark parts order as received ${error}|`)
    }
  }
  const handleMarkRepairAsComplete = async (photos: File[]) => {
    try {
      await new Promise<boolean>((resolve, reject) => {
        const api = new RequestApi()
        const request = {
          id: (initRepaitOrderData as any).id,
          preRepairPhotoFileAssets: photos,
          ...(initRepaitOrderData as any),
        }
        api.repairOrderComplete(request, {
          status200: () => {
            toast.success('Repair order marked as complete successfully')
            getRepairOrderDetail() // 刷新数据
            getPartsOrderDetail()
            resolve(true)
          },
          error: (error) => {
            toast.error(`Failed to mark repair order as complete ${error}|`)
            reject(false)
          },
          else: () => {
            reject(false)
          },
        })
      })
    } catch (error) {
      toast.error(`Failed to mark repair order as complete ${error}|`)
    }
  }
  // ✅ Timeline 的 onApprove 和 onReject 回调
  const handleTimelineApprove = () => {
    setIsApprovalDialogOpen(true)
    setIsReject(false)
  }

  const handleTimelineReject = () => {
    setIsApprovalDialogOpen(true)
    setIsReject(true)
  }

  useEffect(() => {
    getRepairOrderDetail()
    getPartsOrderDetail()
  }, [])
  return (
    <div className='bg-background text-foreground'>
      <div className='relative h-40 w-full'>
        <img
          src={navImg}
          alt={brand === 'vw' ? 'VW Navigation' : 'Audi Navigation'}
          className='mt-6 h-full w-full object-cover'
        />
        <div className='absolute top-1/2 left-6 -translate-y-1/2'>
          <p className='text-3xl font-bold text-white'>
            {user?.person?.shop?.name ||
              (user?.person?.csrRegion && user?.person?.csrRegion.name) ||
              '--'}
          </p>
          <p className='mt-4 flex items-center space-x-4 text-sm text-gray-200'>
            {/* 房子图标 */}
            <Warehouse className='h-5 w-5 text-white' />
            {(user?.person?.shop && (
              <span>
                Assigned Dealership:{' '}
                {user?.person?.shop?.sponsorDealership.name ?? '--'}({' '}
                {user?.person?.shop?.sponsorDealership.dealershipNumber})
              </span>
            )) ||
              '--'}
            <Users className='ml-6 h-5 w-5 text-white' />
            <span>
              {' '}
              Field Support Team: {user?.person?.firstName}{' '}
              {user?.person?.lastName}
            </span>
          </p>
        </div>
        <div className='absolute top-1/2 right-6 max-w-[320px] -translate-y-1/2 text-sm text-gray-200'>
          <div className='grid gap-1'>
            <div className='grid grid-cols-[24px_1fr] items-center gap-2'>
              <Tag
                className='h-5 w-5 justify-self-end text-white'
                aria-hidden='true'
              />
              <span className='truncate'>
                {user?.person?.shop?.shopNumber ?? '--'}
              </span>
            </div>

            <div className='my-1 grid grid-cols-[24px_1fr] items-center gap-2'>
              <MapPin
                className='h-5 w-5 justify-self-end text-white'
                aria-hidden='true'
              />
              <span className='truncate'>
                {user?.person?.shop?.address ?? '--'},
                {user?.person?.shop?.city ?? '--'},
                {user?.person?.shop?.state ?? '--'}&nbsp;
                {user?.person?.shop?.zip ?? '--'}
              </span>
            </div>

            <div className='grid grid-cols-[24px_1fr] items-center gap-2'>
              <Map
                className='h-5 w-5 justify-self-end text-white'
                aria-hidden='true'
              />
              <span className='truncate'>
                {user?.person?.shop?.region.name ?? '--'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className='mx-4 my-6 p-3'>
        <div className='flex w-full flex-col rounded-sm border'>
          <div className='bg-muted text-foreground flex w-full items-center justify-between p-5'>
            <h1 className='text-2xl font-bold tracking-tight'>
              Repair Order # :{initRepaitOrderData?.roNumber || '--'}
            </h1>
            <div className='flex gap-3'>
              {initPartsOrderData?.every(
                (order: any) =>
                  order.status === 'ShopReceived' ||
                  order.status === 'CsrRejected'
              ) && userType === 'Shop' ? (
                <Button
                  onClick={() => setIsMarkRepairAsCompleteDialogOpen(true)}
                  size='sm'
                  className='h-9 bg-green-600 text-xs font-medium'
                >
                  <Check className='mr-1.5 h-3.5 w-3.5' />
                  Mark Repair as Complete
                </Button>
              ) : null}
              {userType === 'Shop' &&
              initPartsOrderData?.every(
                (order: any) => order.status !== 'RepairCompleted'
              ) ? (
                <Button
                  size='sm'
                  variant='outline'
                  className='h-9 text-xs font-medium'
                  onClick={() => setOpen(true)}
                >
                  <Pencil className='mr-1.5 h-3.5 w-3.5' />
                  Edit Repair Order
                </Button>
              ) : null}
            </div>
          </div>
          {/* 2. 信息区 - 极简三列，字体 14px 正文感 */}
          <div className='grid grid-cols-1 gap-8 p-5 md:grid-cols-3'>
            {/* 左列 */}
            <div className='space-y-3'>
              <div>
                <span className='text-muted-foreground'>Customer</span>
                <p className='font-medium'>
                  {initRepaitOrderData?.customer || '--'}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground'>VIN</span>
                <p className='font-mono'>{initRepaitOrderData?.vin || '--'}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Year/Make/Model</span>
                <p className='font-medium'>
                  {initRepaitOrderData?.year}/{initRepaitOrderData?.make}/
                  {initRepaitOrderData?.model}
                </p>
              </div>
            </div>
            {/* 中列 */}
            <div className='space-y-3'>
              <div>
                <span className='text-muted-foreground'>Date Submitted</span>
                <p>
                  {formatDateOnly(
                    initRepaitOrderData?.dateLastSubmitted as Date
                  ) || '--'}
                  {' by' + ' '}
                  {(selectedPartsOrderData as any)?.submittedByPerson
                    ?.firstName +
                    ' ' +
                    (selectedPartsOrderData as any)?.submittedByPerson
                      ?.lastName}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground'>Submitted To</span>
                <p className='font-medium'>
                  {initRepaitOrderData?.dealership?.name || '--'}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground'>Date Closed</span>
                <p className='text-muted-foreground'>
                  {formatDateOnly(initRepaitOrderData?.dateClosed as Date) ||
                    '--'}
                  {initRepaitOrderData?.dateClosed && ' by' + ' '}
                  {initRepaitOrderData?.dateClosed &&
                    (selectedPartsOrderData as any)?.reviewedByPerson
                      ?.firstName +
                      ' ' +
                      (selectedPartsOrderData as any)?.reviewedByPerson
                        ?.lastName}
                </p>
              </div>
            </div>
            {/* 右列 - 文件链接更紧凑 */}
            <div className='space-y-3 text-sm'>
              <div>
                <span className='text-muted-foreground'>Pre-Repair Photos</span>
                <div className='mt-1 flex flex-wrap gap-2'>
                  {initRepaitOrderData &&
                  initRepaitOrderData?.preRepairPhotoFileAssets &&
                  initRepaitOrderData?.preRepairPhotoFileAssets.length > 0
                    ? initRepaitOrderData?.preRepairPhotoFileAssets?.map(
                        (f) => (
                          <a
                            key={f.id}
                            href={`${import.meta.env.VITE_API_URL}${f.downloadUrl}`}
                            className='text-blue-700 underline hover:underline'
                            target='_blank'
                          >
                            {f.filename}
                          </a>
                        )
                      )
                    : '--'}
                </div>
              </div>
              <div>
                <span className='text-muted-foreground'>
                  Structural Measurements
                </span>
                <br />
                <div className='text-primary hover:underline'>
                  {initRepaitOrderData?.structuralMeasurementFileAssets &&
                  initRepaitOrderData?.structuralMeasurementFileAssets.length >
                    0
                    ? initRepaitOrderData?.structuralMeasurementFileAssets?.map(
                        (f) => (
                          <a
                            key={f.id}
                            href={`${import.meta.env.VITE_API_URL}${f.downloadUrl}`}
                            className='text-blue-700 underline hover:underline'
                            target='_blank'
                          >
                            {f.filename}
                          </a>
                        )
                      )
                    : '--'}
                </div>
              </div>
              <div>
                <span className='text-muted-foreground'>
                  Post-Repair Photos
                </span>
                <div className='mt-1 flex flex-wrap gap-2'>
                  {initRepaitOrderData?.postRepairPhotoFileAssets &&
                  initRepaitOrderData?.postRepairPhotoFileAssets.length > 0
                    ? initRepaitOrderData?.postRepairPhotoFileAssets?.map(
                        (f) => (
                          <a
                            key={f.id}
                            href={f.downloadUrl}
                            className='text-blue-700 underline hover:underline'
                          >
                            {f.filename}
                          </a>
                        )
                      )
                    : '--'}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='my-5 flex flex-col rounded-sm border'>
          {/* 3. Tabs + 主内容区 */}
          <div className='bg-muted flex items-center justify-between overflow-hidden p-5'>
            {/* 左侧：平铺标签 + 警告 */}
            <div className='flex items-center gap-6 text-sm font-medium'>
              {initPartsOrderData && initPartsOrderData.length > 0 && (
                <>
                  {/* Parts Order 按钮（第一个，partsOrderNumber === 0） */}
                  <Button
                    variant={currentIndex === 0 ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => {
                      const partsOrder = initPartsOrderData.find(
                        (po: any) => po.partsOrderNumber === 0
                      )
                      setCurrentIndex(0)
                      setSelectedPartsOrderData(partsOrder)
                    }}
                  >
                    Parts Order
                  </Button>

                  {/* Supplement 按钮（partsOrderNumber > 0） */}
                  {initPartsOrderData
                    .filter(
                      (po: any) =>
                        po.partsOrderNumber && po.partsOrderNumber > 0
                    )
                    .map((partsOrder: any, index: number) => (
                      <Button
                        key={partsOrder.id || index}
                        variant={
                          currentIndex === index + 1 ? 'default' : 'outline'
                        }
                        onClick={() => {
                          setSelectedPartsOrderData(partsOrder)
                          setCurrentIndex(index + 1)
                        }}
                      >
                        {partsOrder.hasAlert && (
                          <AlertTriangle className='text-destructive h-4 w-4' />
                        )}
                        Supplement {partsOrder.partsOrderNumber}
                      </Button>
                    ))}
                </>
              )}

              {/* <Button
                variant='outline'
                className='ring-border flex items-center gap-2 rounded-lg px-4 py-2 ring-1'
              >
                Parts Order
              </Button>

              <button className='text-muted-foreground hover:text-foreground bg-accent flex items-center gap-2'>
                <AlertTriangle className='text-destructive h-4 w-4' />
                Supplement 1
              </button>

              <button className='text-muted-foreground hover:text-foreground bg-accent'>
                Supplement 2
              </button> */}
            </div>

            {/* 右侧：新增按钮 */}
            {initPartsOrderData?.some(
              (order: any) =>
                order.status !== 'RepairCompleted' ||
                order.status === 'CsrRejected' ||
                order.status !== 'RepairCompleted'
            ) &&
              userType === 'Shop' && (
                <Button
                  onClick={() => {
                    setSelectedPartsOrderData(undefined)
                    setOpenPartsOrderDialog(true)
                    setIsReject(false)
                  }}
                  variant='outline'
                  size='sm'
                  className='h-9 rounded-lg font-medium'
                >
                  <Plus className='mr-1.5 h-3.5 w-3.5' />
                  Supplemental Parts Order
                </Button>
              )}
          </div>
          {/* 3. 真正的左右布局 */}
          <div className='m-5 flex gap-8'>
            <div className='max-w-lg flex-1'>
              {((selectedPartsOrderData ||
                (initPartsOrderData &&
                  initPartsOrderData.length > 0 &&
                  initPartsOrderData[0])) && (
                <Card className='rounded-xl border shadow-sm'>
                  <CardHeader className='pb-4'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-foreground text-base font-semibold'>
                        Sales Order #{' '}
                        {(selectedPartsOrderData as any)?.salesOrderNumber ||
                          '--'}
                      </CardTitle>
                      {(userType === 'Shop' &&
                        (selectedPartsOrderData as any)?.stage ==
                          'OrderReview' &&
                        (selectedPartsOrderData as any)?.status !==
                          'DealershipProcessing') ||
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
                          onClick={() => {
                            setSelectedPartsOrderData(selectedPartsOrderData)
                            setOpenPartsOrderDialog(true)
                          }}
                          size='sm'
                          variant='outline'
                          className='h-9 px-4 text-xs'
                        >
                          <Pencil className='h-3.5 w-3.5' />
                          Edit Parts Order
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-6 text-sm'>
                    <div>
                      <h4 className='text-muted-foreground mb-3 font-medium'>
                        Requested Parts
                      </h4>
                      <ol className='text-foreground/90 space-y-2 pl-5 font-mono'>
                        {((selectedPartsOrderData as any)?.parts?.length > 0 &&
                          (selectedPartsOrderData as any)?.parts?.map(
                            (part: string, idx: number) => (
                              <li key={part + idx}>
                                ({idx + 1}) {part}
                              </li>
                            )
                          )) ||
                          '-- No parts requested'}
                      </ol>
                    </div>

                    <div>
                      <span className='text-muted-foreground'>
                        Parts Estimate
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
                              href={`${import.meta.env.VITE_API_URL + file.viewUrl}`}
                              className='text-blue-700 underline hover:underline'
                            >
                              {file.filename}
                            </a>
                          )
                        )) ||
                        '-- No estimate file'}
                    </div>
                  </CardContent>
                </Card>
              )) ||
                '-- No parts order data'}
            </div>
            {/* 右侧：Parts Tracker 时间线（纯文字 + 绿色实线） */}
            <div className='min-w-0 flex-1'>
              {/* min-w-0 防止 flex 溢出 */}
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
        onOpenChange={setOpenPartsOrderDialog}
        initialData={selectedPartsOrderData}
        initRepaitOrderData={initRepaitOrderData}
        onSuccess={() => {
          getPartsOrderDetail()
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
  )
}
