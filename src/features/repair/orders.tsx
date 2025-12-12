import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import RequestApi from '@/js/clients/base/OrderApi'
import PartsOrder from '@/js/models/PartsOrder'
import type RepairOrder from '@/js/models/RepairOrder'
import RepairOrderSearchRequest from '@/js/models/RepairOrderSearchRequest'
import ResultParameter from '@/js/models/ResultParameter'
import {
  Plus,
  Search,
  AlertTriangle,
  TableIcon,
  Users,
  Warehouse,
  Tag,
  MapPin,
  Map,
} from 'lucide-react'
import { toast } from 'sonner'
import audiNav from '@/assets/img/repair/audi.png'
import vwNav from '@/assets/img/repair/vw.png'
import { useAuthStore } from '@/stores/auth-store'
import { calculateDateRange, formatDateOnly } from '@/lib/utils'
import { useBrand } from '@/context/brand-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PartsOrderDialog } from '@/components/PartsOrderDialog'
import RepairOrderDialog, {
  type RepairOrderData,
} from '@/components/RepairOrderDialog'
import { DataTablePagination } from '@/components/data-table-pagination'
import { DatePicker } from '@/components/date-picker'

const getStatusVariant = (status: string) => {
  if (status.includes('Rejected')) return 'destructive'
  if (status.includes('Review')) return 'secondary'
  if (status.includes('Processing')) return 'outline'
  if (status.includes('Shipped')) return 'default'
  return 'secondary'
}
interface RepairOrderListProps {
  repairOrders: []
  totalItems: number
}
export function RepairOrderList() {
  const { user } = useAuthStore((state) => state.auth)
  const [dateLastSubmittedFrom, setFromDate] = useState<Date | undefined>(
    undefined
  )
  const [repairOrders, setRepairOrders] = useState<RepairOrderListProps[]>([])
  const [dateLastSubmittedTo, setToDate] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const [totalItems, setTotalItems] = useState(0)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const [isOpen, setOpen] = useState(false)
  const [showRepairCompleted, setShowRepairCompleted] = useState(false)
  const [filterByStatus, setFilterByStatus] = useState('all')
  const [smartFilter, setSmartFilter] = useState('')
  const [dateRangePreset, setDateRangePreset] = useState('all')

  const [initialData, setInitialData] = useState<RepairOrder | undefined>(
    undefined
  )

  const [openPartsOrderDialog, setOpenPartsOrderDialog] = useState(false)
  const [selectedPartsOrderData, setSelectedPartsOrderData] =
    useState<PartsOrder>()

  const [initRepaitOrderData, setInitRepaitOrderData] = useState<RepairOrder>()

  const { brand } = useBrand()
  const navImg = brand === 'vw' ? vwNav : audiNav

  const getRepairOrderDetail = async (id: string) => {
    try {
      return new Promise((resolve, reject) => {
        const api = new RequestApi()
        api.repairOrderGet(id, {
          status200: (response) => {
            setInitRepaitOrderData(response)
            setOpenPartsOrderDialog(true)
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

  const getPartsOrderDetail = async (id: string) => {
    try {
      return new Promise((resolve, reject) => {
        const api = new RequestApi()
        api.partsOrderGetAllForRepairOrder(id, {
          status200: (response) => {
            setSelectedPartsOrderData(response)
            resolve(response)
          },
          error: () => {
            reject()
          },
          else: (_statusCode) => {
            reject()
          },
        })
      })
    } catch (e) {
      console.error(e)
    }
  }
  const getRepairOrders = async () => {
    try {
      const api = new RequestApi()
      const shopId = user?.person?.shop?.id

      if (shopId == null) {
        return
      }

      // 处理 filterByStatus：如果是 'all'，传 undefined
      const statusFilter = filterByStatus === 'all' ? undefined : filterByStatus

      const request = RepairOrderSearchRequest.create({
        shopId: shopId,
        smartFilter: smartFilter || undefined, // 空字符串转为 undefined
        filterByStatus: statusFilter,
        showRepairCompleted,
        dateLastSubmittedFrom,
        dateLastSubmittedTo,
      })

      // 在序列化前，手动将日期字段格式化为字符串（覆盖 ModelBaseClass 的转换）
      if ((request as any).dateLastSubmittedFrom) {
        ;(request as any).dateLastSubmittedFrom = formatDateOnly(
          dateLastSubmittedFrom
        )
      }
      if ((request as any).dateLastSubmittedTo) {
        ;(request as any).dateLastSubmittedTo =
          formatDateOnly(dateLastSubmittedTo)
      }

      const resultParameter = ResultParameter.create({
        resultsLimitOffset: (currentPage - 1) * itemsPerPage,
        resultsLimitCount: itemsPerPage,
        resultsOrderBy: 'dateLastSubmitted',
        resultsOrderAscending: false,
      })
      ;(request as any).resultParameter = resultParameter

      api.repairOrderSearch(request, {
        status200: (response) => {
          setRepairOrders((response as any).repairOrders)
          setTotalItems((response as any).totalItemCount || 0)
        },
        error: (error) => {
          console.error('Error:', error)
        },
      })
    } catch (e) {
      console.error(e)
    }
  }
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return // 等待用户信息加载

    const userType = user?.person?.type
    // ✅ 新增：Dealership 用户不允许访问修复订单列表
    if (
      userType === 'Dealership' ||
      userType === 'Csr' ||
      userType === 'FieldStaff'
    ) {
      console.warn('Dealership user cannot access repair order list')
      navigate({ to: '/parts_orders', replace: true })
      return
    }
    // 调用 API（对于文本输入，使用防抖）
    const timeoutId = setTimeout(
      () => {
        getRepairOrders()
      },
      smartFilter ? 500 : 0
    ) // 文本输入延迟 500ms，其他条件立即执行

    return () => clearTimeout(timeoutId)
  }, [
    smartFilter,
    filterByStatus,
    showRepairCompleted,
    dateLastSubmittedFrom,
    dateLastSubmittedTo,
    user,
    currentPage,
  ])

  // 当预设范围改变时，自动计算日期
  useEffect(() => {
    if (dateRangePreset !== 'custom') {
      const { from, to } = calculateDateRange(dateRangePreset)
      setFromDate(from)
      setToDate(to)
    }
  }, [dateRangePreset])

  return (
    <div className='bg-background min-h-screen'>
      <div className='relative h-40 w-full'>
        <img
          src={navImg}
          alt={brand === 'vw' ? 'VW Navigation' : 'Audi Navigation'}
          className='mt-6 h-full w-full object-cover'
        />
        <div className='absolute top-1/2 left-6 -translate-y-1/2'>
          <p className='text-3xl font-bold text-white'>
            {user?.person?.shop?.name ?? '--'}
          </p>
          <p className='mt-4 flex items-center space-x-4 text-sm text-gray-200'>
            {/* 房子图标 */}
            <Warehouse className='h-5 w-5 text-white' />
            <span>
              Assigned Dealership:{' '}
              {user?.person?.shop?.sponsorDealership.name ?? '--'}({' '}
              {user?.person?.shop?.sponsorDealership.dealershipNumber})
            </span>
            <Users className='ml-6 h-5 w-5 text-white' />
            <span>
              {' '}
              Field Support Team: {user?.person?.firstName}{' '}
              {user?.person?.lastName}
            </span>
          </p>
        </div>
        <div className='absolute top-1/2 right-6 max-w-[320px] -translate-y-1/2 text-sm text-gray-100'>
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
      {/* Header */}
      <div className='bg-background border-b'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-foreground text-2xl font-bold'>
            Repair Order List
          </h1>
          <Button
            variant='default'
            onClick={() => {
              setOpen(true)
              setInitialData(undefined)
            }}
            // onClick={() => setOpenEdit(true)}
          >
            <Plus className='mr-2 h-4 w-4' />
            New Repair Order
          </Button>
        </div>
      </div>
      {/* 新增 or 编辑*/}
      <RepairOrderDialog
        open={isOpen}
        onOpenChange={setOpen}
        onSuccess={async (data: any) => {
          const snapshot = JSON.parse(JSON.stringify(data))
          await getRepairOrders()
          const id = snapshot.id
          if (id) {
            await getPartsOrderDetail(data.id)
            await getRepairOrderDetail(data.id)
          } else {
            toast.error('Repair Order Failed to Create')
          }
        }}
        initialData={initialData as RepairOrderData}
      />
      <PartsOrderDialog
        open={openPartsOrderDialog}
        onOpenChange={setOpenPartsOrderDialog}
        initialData={selectedPartsOrderData}
        initRepaitOrderData={initRepaitOrderData}
        onSuccess={getRepairOrders}
      />
      <div className='px-6 py-6'>
        {/* Filters */}
        <div className='lg:items-cente mb-6 flex flex-col items-center justify-between gap-4 lg:flex-row'>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='relative w-65'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                value={smartFilter}
                onChange={(e) => setSmartFilter(e.target.value)}
                placeholder='Filter by RO#, Order #,VIN,Customer'
                className='pl-10 text-sm placeholder:text-xs'
              />
            </div>
            <Select
              defaultValue='all'
              onValueChange={(value) => setFilterByStatus(value)}
            >
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='CsrReview'>CsrReview</SelectItem>
                <SelectItem value='CsrRejected'>CsrRejected</SelectItem>
                <SelectItem value='DealershipProcessing'>
                  DealershipProcessing
                </SelectItem>
                <SelectItem value='DealershipShipped'>
                  DealershipShipped
                </SelectItem>
                <SelectItem value='ShopReceived'>ShopReceived</SelectItem>
                <SelectItem value='RepairCompleted'>RepairCompleted</SelectItem>
              </SelectContent>
            </Select>

            <Select
              defaultValue={dateRangePreset}
              onValueChange={(value) => setDateRangePreset(value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Date Range' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Dates</SelectItem>
                <SelectItem value='7'>Past 7 days</SelectItem>
                <SelectItem value='30'>Past 30 Days</SelectItem>
                <SelectItem value='month-to-date'>Month-To-Date</SelectItem>
                <SelectItem value='quarter-to-date'>Quarter-To-Date</SelectItem>
                <SelectItem value='year-to-date'>Year-To-Date</SelectItem>
                <SelectItem value='last-month'>Last Month</SelectItem>
                <SelectItem value='last-quarter'>Last Quarter</SelectItem>
                <SelectItem value='last-year'>Last Year</SelectItem>
                <SelectItem value='custom'>Custom</SelectItem>
              </SelectContent>
            </Select>

            {/* 日期范围选择 */}
            {dateRangePreset === 'custom' && (
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>From</span>
                <DatePicker
                  selected={dateLastSubmittedFrom}
                  disabled={dateRangePreset != 'custom'}
                  onSelect={(date) => setFromDate(date)}
                  placeholder='Select from date'
                />
                <span className='text-sm font-medium'>To</span>
                <DatePicker
                  selected={dateLastSubmittedTo}
                  disabled={dateRangePreset != 'custom'}
                  onSelect={(date) => setToDate(date)}
                  placeholder='Select to date'
                />
              </div>
            )}
          </div>
          <div className='flex items-center justify-end gap-2'>
            <Checkbox
              id='show-completed'
              checked={showRepairCompleted}
              onCheckedChange={(checked) =>
                setShowRepairCompleted(checked as boolean)
              }
              className='rounded-full'
            />
            <Label
              htmlFor='show-completed'
              className='cursor-pointer text-sm font-medium'
            >
              Show Repair Completed
            </Label>
          </div>
        </div>
        {repairOrders.length === 0 ? (
          <div>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <TableIcon className='h-4 w-4' />
                </EmptyMedia>
                <EmptyTitle>No data to display</EmptyTitle>
                <EmptyDescription>
                  There are no records in this table yet. Add your first entry
                  to get started.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div>
            {/* Table */}
            <div className='bg-card overflow-hidden rounded-lg border shadow-sm'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-muted'>
                    <TableHead className='text-foreground font-semibold'>
                      RO #
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Order #
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      VIN
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Year/Make/Model
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Status
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Customer
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Date Submitted
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Date Completed
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repairOrders.map((order) => {
                    // 使用类型断言访问属性，因为类型定义可能不完整
                    const orderAny = order as any
                    // 组合车辆信息
                    const vehicle =
                      orderAny.year && orderAny.make && orderAny.model
                        ? `${orderAny.year} ${orderAny.make} ${orderAny.model}`
                        : '--'
                    return (
                      <TableRow
                        key={orderAny.id || orderAny.roNumber}
                        className='hover:bg-muted/50'
                      >
                        <TableCell className='font-medium'>
                          <div className='flex items-center gap-2'>
                            {/* hasAlert 字段可能不存在，暂时移除或使用可选 */}
                            {orderAny.hasAlert && (
                              <AlertTriangle className='text-destructive h-4 w-4' />
                            )}
                            <span
                              className='cursor-pointer text-blue-600 hover:underline'
                              onClick={() => {
                                navigate({
                                  to: '/repair_orders/$id',
                                  params: { id: orderAny.id.toString() },
                                })
                              }}
                            >
                              {orderAny.roNumber || '--'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* orders 字段可能不存在，需要从 PartsOrder 获取，暂时显示 -- */}
                          <div className='space-y-1'>
                            {orderAny.salesOrderNumber ? (
                              <div>{orderAny.salesOrderNumber}</div>
                            ) : (
                              <div>--</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {orderAny.vin || '--'}
                        </TableCell>
                        <TableCell>{vehicle}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(orderAny.status || '')}
                            className='whitespace-nowrap'
                          >
                            {orderAny.status || '--'}
                          </Badge>
                        </TableCell>
                        <TableCell>{orderAny.customer || '--'}</TableCell>
                        <TableCell>
                          {formatDateOnly(orderAny.dateLastSubmitted)}
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {formatDateOnly(orderAny.dateClosed)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
