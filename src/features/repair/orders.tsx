import { useEffect, useState } from 'react'
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import RequestApi from '@/js/clients/base/OrderApi'
import PartsOrder from '@/js/models/PartsOrder'
import type RepairOrder from '@/js/models/RepairOrder'
import RepairOrderSearchRequest from '@/js/models/RepairOrderSearchRequest'
import ResultParameter from '@/js/models/ResultParameter'
import {
  Search,
  AlertTriangle,
  TableIcon,
  Users,
  Warehouse,
  Tag,
  MapPin,
  Map,
  Plus,
} from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import audiNav from '@/assets/img/repair/audi.png'
import vwNav from '@/assets/img/repair/vw.png'
import { useAuthStore } from '@/stores/auth-store'
import { calculateDateRange, formatDateOnly } from '@/lib/utils'
import { useBrand } from '@/context/brand-context'
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
import { DateRangePicker } from '@/components/DateRangePicker'
import { PartsOrderDialog } from '@/components/PartsOrderDialog'
import RepairOrderDialog, {
  type RepairOrderData,
} from '@/components/RepairOrderDialog'
import { DataTablePagination } from '@/components/data-table-pagination'

// const getStatusVariant = (status: string) => {
//   if (status.includes('Rejected')) return 'destructive'
//   if (status.includes('Review')) return 'secondary'
//   if (status.includes('Processing')) return 'outline'
//   if (status.includes('Shipped')) return 'default'
//   return 'secondary'
// }
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

  const [initialData] = useState<RepairOrder | undefined>(undefined)

  const [openPartsOrderDialog, setOpenPartsOrderDialog] = useState(false)
  const [selectedPartsOrderData, setSelectedPartsOrderData] =
    useState<PartsOrder>()

  const [initRepaitOrderData, setInitRepaitOrderData] = useState<RepairOrder>()

  const [displayOrders, setDisplayOrders] = useState<any[]>([])

  const { id }: any = useSearch({ from: '/_authenticated/repair_orders' })

  const [range, setRange] = useState<DateRange>()

  const { brand } = useBrand()
  const navImg = brand === 'vw' ? vwNav : audiNav

  const getRepairOrderDetail = async (id: string) => {
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

  const getPartsOrderDetail = async (id: string, flag?: boolean) => {
    try {
      return new Promise((resolve, reject) => {
        const api = new RequestApi()
        api.partsOrderGetAllForRepairOrder(id, {
          status200: (response) => {
            setSelectedPartsOrderData(response)
            flag ? setOpenPartsOrderDialog(true) : ''
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
  const getRepairOrders = async (flag: boolean = false) => {
    try {
      const api = new RequestApi()
      const shopId = user?.person?.shop?.id || id
      if (shopId == null) {
        router.history.go(-1)
        return
      }

      const statusFilter = filterByStatus === 'all' ? undefined : filterByStatus
      const request = RepairOrderSearchRequest.create({
        shopId: Number(shopId),
        smartFilter: smartFilter || undefined,
        filterByStatus: statusFilter,
        showRepairCompleted: !showRepairCompleted,
        dateLastSubmittedFrom,
        dateLastSubmittedTo,
      })

      // Date handling remains unchanged
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

      if (flag) {
        ;(request as any).dateLastSubmittedFrom = undefined
        ;(request as any).dateLastSubmittedTo = undefined
      }

      api.repairOrderSearch(request, {
        status200: async (response) => {
          let orders = (response as any).repairOrders || []

          // Concurrent retrieval of part order data for each record
          const ordersWithParts = await Promise.all(
            orders.map(async (order: any) => {
              try {
                const partsResponse = await getPartsOrderDetail(
                  order.id.toString()
                )

                // Unified handling of return（Array or object）
                const partsOrders = Array.isArray(partsResponse)
                  ? partsResponse
                  : partsResponse
                    ? [partsResponse]
                    : []

                // Calculate the number of each state
                const statusCounts = {
                  CsrReview: 0,
                  CsrRejected: 0,
                  DealershipProcessing: 0,
                  DealershipShipped: 0,
                  ShopReceived: 0,
                  RepairCompleted: 0,
                }

                partsOrders.forEach((part: any) => {
                  const status = part.status
                  if (statusCounts.hasOwnProperty(status)) {
                    statusCounts[status as keyof typeof statusCounts]++
                  }
                })

                return {
                  ...order,
                  partsOrders, // Complete part order data（Optional）
                  statusCounts, // Object of each state count
                }
              } catch (err) {
                console.error(`Failed to load parts for RO ${order.id}:`, err)
                return {
                  ...order,
                  partsOrders: [],
                  statusCounts: {
                    CsrReview: 0,
                    CsrRejected: 0,
                    DealershipProcessing: 0,
                    DealershipShipped: 0,
                    ShopReceived: 0,
                    RepairCompleted: 0,
                  },
                }
              }
            })
          )

          setRepairOrders(orders)
          // Display data with statistics，For table rendering
          setDisplayOrders(ordersWithParts)
          setTotalItems((response as any).totalItemCount || 0)
        },
        error: (error) => {
          console.error('Error:', error)
          toast.error('Failed to load repair orders')
        },
      })
    } catch (e) {
      console.error(e)
    }
  }
  // const getRepairOrders = async () => {
  //   try {
  //     const api = new RequestApi()
  //     const shopId = user?.person?.shop?.id || id
  //     // Need to passshopId to perform the query
  //     if (shopId == null) {
  //       router.history.go(-1)
  //       return
  //     }
  //     // Process filterByStatus：If it is 'all'，Pass undefined
  //     const statusFilter = filterByStatus === 'all' ? undefined : filterByStatus

  //     const request = RepairOrderSearchRequest.create({
  //       shopId: Number(shopId),
  //       smartFilter: smartFilter || undefined, // Convert empty string to undefined
  //       filterByStatus: statusFilter,
  //       showRepairCompleted,
  //       dateLastSubmittedFrom,
  //       dateLastSubmittedTo,
  //     })

  //     // Before serialization，Manually format date fields as strings（Override ModelBaseClass conversion）
  //     if ((request as any).dateLastSubmittedFrom) {
  //       ;(request as any).dateLastSubmittedFrom = formatDateOnly(
  //         dateLastSubmittedFrom
  //       )
  //     }
  //     if ((request as any).dateLastSubmittedTo) {
  //       ;(request as any).dateLastSubmittedTo =
  //         formatDateOnly(dateLastSubmittedTo)
  //     }

  //     const resultParameter = ResultParameter.create({
  //       resultsLimitOffset: (currentPage - 1) * itemsPerPage,
  //       resultsLimitCount: itemsPerPage,
  //       resultsOrderBy: 'dateLastSubmitted',
  //       resultsOrderAscending: false,
  //     })
  //     ;(request as any).resultParameter = resultParameter

  //     api.repairOrderSearch(request, {
  //       status200: (response) => {
  //         setRepairOrders((response as any).repairOrders)
  //         setTotalItems((response as any).totalItemCount || 0)
  //       },
  //       error: (error) => {
  //         console.error('Error:', error)
  //       },
  //     })
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }
  const navigate = useNavigate()
  const router = useRouter()

  useEffect(() => {
    if (!user) return // Waiting for user information to load

    const userType = user?.person?.type
    // ✅ Add：Dealership User not allowed to access repair order list
    if (
      userType === 'Dealership' ||
      userType === 'Csr' ||
      userType === 'FieldStaff'
    ) {
      console.warn('Dealership user cannot access repair order list')
      navigate({ to: '/parts_orders', replace: true })
      return
    }
    // Call API（For text input，Use debounce）
    const timeoutId = setTimeout(
      () => {
        getRepairOrders()
      },
      smartFilter ? 500 : 0
    ) // Text input delay 500ms，Other conditions execute immediately

    return () => clearTimeout(timeoutId)
  }, [
    smartFilter,
    filterByStatus,
    showRepairCompleted,
    user,
    currentPage,
    dateLastSubmittedFrom,
    dateLastSubmittedTo,
  ])

  // When preset range changes，Automatically calculate date
  useEffect(() => {
    if (dateRangePreset !== 'custom') {
      const { from, to } = calculateDateRange(dateRangePreset)
      setFromDate(from)
      setToDate(to)
      setRange(undefined) // Clear custom range
    }
  }, [dateRangePreset])

  const showIcon = (orderAny: any) => {
    if (!orderAny.dateLastSubmitted) return null

    const submittedDate = new Date(orderAny.dateLastSubmitted)
    const diffMs = Date.now() - submittedDate.getTime()
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
    const isOver7Days = diffMs >= SEVEN_DAYS_MS

    // Condition1：There are in part order ShopReceived or CsrRejected
    const hasAlertPartsStatus =
      orderAny?.partsOrders?.length > 0 &&
      orderAny.partsOrders.some(
        (val: any) =>
          val.status === 'ShopReceived' || val.status === 'CsrRejected'
      )

    // Condition2：Exceeds7Days and the user is Shop type
    const isShopAndOver7Days = isOver7Days && user?.person?.type === 'Shop'

    // show icon if any condition is met
    if (hasAlertPartsStatus || isShopAndOver7Days) {
      return <AlertTriangle className='text-destructive h-4 w-4' />
    }

    return null
  }

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
            {/* house icon */}
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
          {user?.person?.type === 'Shop' && (
            <Button
              variant='outline'
              onClick={() => {
                setOpen(true)
              }}
            >
              <Plus className='mr-1.5 h-4 w-4' />
              New Repair Order
            </Button>
          )}
        </div>
      </div>
      {/* add or edit*/}
      <RepairOrderDialog
        open={isOpen}
        onOpenChange={setOpen}
        onSuccess={async (data: any) => {
          const snapshot = JSON.parse(JSON.stringify(data))
          // await getRepairOrders()
          const id = snapshot.id
          if (id) {
            await getRepairOrderDetail(data.id)
            await getPartsOrderDetail(data.id, true)
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
                <SelectItem value='CsrReview'>CSR Review</SelectItem>
                <SelectItem value='CsrRejected'>CSR Rejected</SelectItem>
                <SelectItem value='DealershipProcessing'>
                  FF Dealership ProcessingF
                </SelectItem>
                <SelectItem value='DealershipShipped'>
                  Dealership Shipped
                </SelectItem>
                <SelectItem value='ShopReceived'>Shop Received</SelectItem>
                <SelectItem value='RepairCompleted'>
                  Repair Completed
                </SelectItem>
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

            {/* date range selection */}
            {dateRangePreset === 'custom' && (
              <DateRangePicker
                value={range}
                onChange={(newRange) => {
                  setRange(newRange)
                  // sync to original state，for API query
                  setFromDate(newRange?.from ?? undefined)
                  setToDate(newRange?.to ?? undefined)
                }}
                onClose={() => {
                  // re-query the list when the popup is closed
                  getRepairOrders(true)
                }}
                placeholder='Select date range'
                disabled={false}
              />
            )}
          </div>
          <div className='flex items-center justify-end gap-2'>
            <Checkbox
              id='show-completed'
              checked={showRepairCompleted}
              onCheckedChange={(checked: boolean) => {
                setShowRepairCompleted(checked)
              }}
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
                  {displayOrders.map((order) => {
                    // use type assertion to access properties，because the type definition may be incomplete
                    const orderAny = order as any
                    // combine vehicle information
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
                            {/* hasAlert field may not exist，temporarily remove or use optional */}
                            {showIcon(orderAny)}
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
                          {/* orders field may not exist，need to get from PartsOrder obtain，temporarily display -- */}
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
                          {/* <Badge
                            variant={getStatusVariant(orderAny.status || '')}
                            className='whitespace-nowrap'
                          >
                            {orderAny.status || '--'}
                          </Badge> */}
                          <div className='space-y-1 text-sm'>
                            {orderAny.statusCounts.DealershipShipped > 0 && (
                              <div>
                                Dealer Shipped (
                                {orderAny.statusCounts.DealershipShipped})
                              </div>
                            )}
                            {orderAny.statusCounts.ShopReceived > 0 && (
                              <div>
                                Shop Received (
                                {orderAny.statusCounts.ShopReceived})
                              </div>
                            )}
                            {orderAny.statusCounts.CsrReview > 0 && (
                              <div>
                                CSR Review ({orderAny.statusCounts.CsrReview})
                              </div>
                            )}
                            {orderAny.statusCounts.CsrRejected > 0 && (
                              <div>
                                CSR Rejected (
                                {orderAny.statusCounts.CsrRejected})
                              </div>
                            )}
                            {orderAny.statusCounts.DealershipProcessing > 0 && (
                              <div>
                                Dealer Processing (
                                {orderAny.statusCounts.DealershipProcessing})
                              </div>
                            )}
                            {orderAny.statusCounts.RepairCompleted > 0 && (
                              <div>
                                Repair Completed (
                                {orderAny.statusCounts.RepairCompleted})
                              </div>
                            )}
                            {/* if all quantities are0，display -- */}
                            {Object.values(orderAny.statusCounts).every(
                              (count) => count === 0
                            ) && <div>--</div>}
                          </div>
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
