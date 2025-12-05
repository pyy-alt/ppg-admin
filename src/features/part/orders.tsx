import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import OrderApi from '@/js/clients/base/OrderApi'
import PartsOrderSearchRequest from '@/js/models/PartsOrderSearchRequest'
import { Search, Download, AlertCircle, TableIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import {
  calculateDateRange,
  exportCurrentPageToCSV,
  formatDateOnly,
} from '@/lib/utils'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTablePagination } from '@/components/data-table-pagination'
import { DatePicker } from '@/components/date-picker'

// import ResultParameter from '@/js/models/ResultParameter'

export function PartOrders() {
  const { user } = useAuthStore((state) => state.auth)
  const [filterByWaitingOnMe, setOnlyMyOrders] = useState<boolean>(true)
  const [dateSubmittedFrom, setFromDate] = useState<Date | undefined>(undefined)
  const [dateSubmittedTo, setToDate] = useState<Date | undefined>(undefined)
  const [dateSubmittedRange, setDateSubmittedRange] = useState<string>('7')
  const [filterByPartsOrderNumber, setTypeOfOrder] = useState<string>('all')
  const [filterByStatus, setFilterByStatus] = useState<string>('all')
  const [filterByRegionId, setCsrRegion] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [smartFilter, setSmartFilter] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 20
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const navigate = useNavigate()

  const partsOrderRef = useRef<HTMLTableElement>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const getFlattenedCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const pageData = orders.slice(startIndex, endIndex)

    return pageData.map((order: any) => {
      const ro = order.repairOrder || {}
      const shop = ro.shop || {}
      const dealer = ro.dealership || {}

      return {
        'RO#': ro.roNumber || '--', // ← 必须加引号！
        'Sales#': order.salesOrderNumber || '--', // ← 必须加引号！
        Type: getOrderTypeText(order.partsOrderNumber || 0),
        VIN: ro.vin || '--',
        'Year/Make/Model':
          [ro.year, ro.make, ro.model].filter(Boolean).join(' ') || '--',
        Status: order.status || '--',
        Shop: shop.name ? `${shop.name} (${shop.id})` : '--',
        Dealer: dealer.name ? `${dealer.name} (${dealer.id})` : '--',
        'CSR Region': ro.region || '--',
        'Date Completed': formatDate(order.dateCreated),
        'Date Closed': formatDate(ro.dateClosed) || '--',
      }
    })
  }
  const exportCSV = async () => {
    try {
      const flattenedData = getFlattenedCurrentPageData()
      const result = await exportCurrentPageToCSV(flattenedData, headers)
      result ? toast.success('Exported successfully') : null
    } catch (error) {
      toast.error('Export failed')
    }
  }

  useEffect(() => {
    // 确保组件已挂载且 ref 已连接到 DOM
    if (partsOrderRef.current) {
      // 2. 使用原生 DOM API 查找所有 <th> 元素
      const thElements = partsOrderRef.current.querySelectorAll('thead th')

      // 3. 提取文本内容
      const headerTexts = Array.from(thElements).map((th) =>
        th.textContent.trim()
      )
      setHeaders(headerTexts)
    }
  }, [orders])
  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status.includes('Review') || status.includes('Rejected'))
      return 'destructive'
    if (status.includes('Shipped') || status.includes('Completed'))
      return 'default'
    if (status.includes('Received')) return 'secondary'
    if (status.includes('Processing')) return 'outline'
    return 'secondary'
  }

  // 获取零件订单数据
  const fetchPartsOrders = async () => {
    if (!user) return

    setLoading(true)
    try {
      const api = new OrderApi()

      const dateFrom = dateSubmittedFrom
        ? formatDateOnly(dateSubmittedFrom)
        : undefined
      const dateTo = dateSubmittedTo
        ? formatDateOnly(dateSubmittedTo)
        : undefined

      // 构建请求参数
      const requestParams: any = {
        smartFilter,
        filterByWaitingOnMe,
        filterByDealershipId:
          user?.person?.type === 'Dealership'
            ? user?.person?.dealership.id
            : undefined,
      }
      // 处理订单类型筛选
      if (filterByPartsOrderNumber !== 'all') {
        requestParams.filterByPartsOrderNumber = parseInt(
          filterByPartsOrderNumber
        )
      }

      // 处理状态筛选
      if (filterByStatus !== 'all') {
        requestParams.filterByStatus = filterByStatus
      }
      if (filterByRegionId !== 'all') {
        requestParams.filterByRegionId = parseInt(filterByRegionId)
      }
      // // 添加分页参数
      // const resultParameter = ResultParameter.create({
      //   resultsLimitOffset: (currentPage - 1) * itemsPerPage,
      //   resultsLimitCount: itemsPerPage,
      //   resultsOrderBy: 'DateSubmitted', // 可以根据需要调整排序字段
      //   resultsOrderAscending: false, // 降序，最新的在前
      // })
      // requestParams.resultParameter = resultParameter

      const request = PartsOrderSearchRequest.create(requestParams)
      // 在序列化前，手动将日期字段格式化为字符串（覆盖 ModelBaseClass 的转换）
      if (dateFrom) {
        ;(request as any).dateSubmittedFrom = dateFrom
      }
      if (dateTo) {
        ;(request as any).dateSubmittedTo = dateTo
      }

      api.partsOrderSearch(request, {
        status200: (response: any) => {
          setOrders(response.partOrders || [])
          setTotalItems(response.totalItemCount || 0)
          setLoading(false)
        },
        error: (error: any) => {
          toast.error(`Error: ${error || 'Failed to fetch data'}`)
          setLoading(false)
        },
        else: () => {
          setLoading(false)
        }
      })
    } catch (error) {
      console.error('API 调用错误:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    // 调用 API（对于文本输入，使用防抖）
    const timeoutId = setTimeout(
      () => {
        fetchPartsOrders()
      },
      smartFilter ? 500 : 0
    )

    return () => clearTimeout(timeoutId)
  }, [
    smartFilter,
    filterByWaitingOnMe,
    filterByPartsOrderNumber,
    filterByStatus,
    filterByRegionId,
    dateSubmittedRange,
    dateSubmittedFrom,
    dateSubmittedTo,
    currentPage,
    user,
  ])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    smartFilter,
    filterByWaitingOnMe,
    filterByPartsOrderNumber,
    filterByStatus,
    filterByRegionId,
    dateSubmittedRange,
    dateSubmittedFrom,
    dateSubmittedTo,
  ])

  // 当预设范围改变时，自动计算日期
  useEffect(() => {
    if (dateSubmittedRange !== 'custom') {
      const { from, to } = calculateDateRange(dateSubmittedRange)
      setFromDate(from)
      setToDate(to)
    }
  }, [dateSubmittedRange])

  // 格式化日期显示
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '--'
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '--'
    return d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
  }

  // 获取订单类型显示文本
  const getOrderTypeText = (partsOrderNumber: number): string => {
    if (partsOrderNumber === 0) return 'Parts Order'
    if (partsOrderNumber === 1) return 'Supplement 1'
    if (partsOrderNumber === 2) return 'Supplement 2'
    return `Supplement ${partsOrderNumber}`
  }

  return (
    <div className='min-h-scree'>
      {/* Header */}
      <div className='bg-background'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-foreground text-2xl font-bold'>
            Parts Order List
          </h1>
          <Button onClick={exportCSV}>
            <Download className='mr-2 h-4 w-4' />
            Report
          </Button>
        </div>

        <div className='px-6 py-6'>
          {/* Search + Checkbox */}
          <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center'>
            <div className='relative max-w-md flex-1'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                value={smartFilter}
                onChange={(e) => setSmartFilter(e.target.value)}
                placeholder='Filter by RO#, Sales Order #, VIN, Shop, Dealer'
                className='pl-10'
              />
            </div>
            {/* 只有 CSRs（客户服务代表） 和 经销商 (Dealers) 才能看到并使用 */}
            {user?.person?.type === 'Csr' ||
              (user?.person?.type === 'FieldStaff' && (
                <div className='flex items-center gap-3'>
                  <Checkbox
                    id='my-orders'
                    checked={filterByWaitingOnMe}
                    onCheckedChange={(checked) =>
                      setOnlyMyOrders(checked as boolean)
                    }
                    className='bg-muted rounded-full'
                  />
                  <Label
                    htmlFor='my-orders'
                    className='flex cursor-pointer items-center gap-2 text-sm font-medium'
                  >
                    Only View Parts Orders that are waiting On Me
                  </Label>
                </div>
              ))}
          </div>

          {/* 完整筛选条件 */}
          <div className='mb-6 flex flex-wrap items-center gap-3'>
            <Select
              value={filterByPartsOrderNumber}
              onValueChange={(value) => setTypeOfOrder(value)}
            >
              <SelectTrigger className='bg-muted w-48'>
                <SelectValue placeholder='Type of Order' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='0'>original Parts Order</SelectItem>
                <SelectItem value='1'>Supplement #1</SelectItem>
                <SelectItem value='2'>Supplement #2</SelectItem>
                <SelectItem value='3'>Supplement #3</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterByStatus}
              onValueChange={(value) => setFilterByStatus(value)}
            >
              <SelectTrigger className='bg-muted w-48'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='csr-Review'>CSR Review</SelectItem>
                <SelectItem value='csr-rejected'>CSR Rejected</SelectItem>
                <SelectItem value='dealer-processing'>
                  Dealer Processing
                </SelectItem>
                <SelectItem value='dealer-shipped'>Dealer Shipped</SelectItem>
                <SelectItem value='shop-received'>Shop Received</SelectItem>
                <SelectItem value='repair-completed'>
                  Repair Completed
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterByRegionId}
              onValueChange={(value) => setCsrRegion(value)}
            >
              <SelectTrigger className='bg-muted w-48'>
                <SelectValue placeholder='CSR Region' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Regions</SelectItem>
                {user?.regions?.map((region) => (
                  <SelectItem
                    key={region.id}
                    value={region.id?.toString() || ''}
                  >
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Date Submitted Range</span>
              <Select
                value={dateSubmittedRange}
                onValueChange={(value) => setDateSubmittedRange(value)}
              >
                <SelectTrigger className='bg-muted w-48'>
                  <SelectValue placeholder='ALL Dates' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='7'>Past 7 days</SelectItem>
                  <SelectItem value='30'>Past 30 Days</SelectItem>
                  <SelectItem value='month-to-date'>Month-To-Date</SelectItem>
                  <SelectItem value='quarter-to-date'>
                    Quarter-To-Date
                  </SelectItem>
                  <SelectItem value='year-to-date'>Year-To-Date</SelectItem>
                  <SelectItem value='last-month'>Last Month</SelectItem>
                  <SelectItem value='last-quarter'>Last Quarter</SelectItem>
                  <SelectItem value='last-year'>Last Year</SelectItem>
                  <SelectItem value='custom'>Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 日期范围选择 */}
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>From</span>
              <DatePicker
                disabled={dateSubmittedRange !== 'custom'}
                selected={dateSubmittedFrom}
                onSelect={(date) => setFromDate(date)}
                placeholder='Select from date'
              />
              <span className='text-sm font-medium'>To</span>
              <DatePicker
                disabled={dateSubmittedRange !== 'custom'}
                selected={dateSubmittedTo}
                onSelect={(date) => setToDate(date)}
                placeholder='Select to date'
              />
            </div>
          </div>

          {/* Table */}
          <div className='bg-background overflow-hidden rounded-lg border shadow-sm'>
            <Table ref={partsOrderRef}>
              <TableHeader>
                <TableRow className='bg-muted'>
                  <TableHead className='text-foreground font-semibold'>
                    RO#
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Sales#
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Type
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
                    Shop
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Dealer
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    CSR Region
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Date Completed
                  </TableHead>
                  <TableHead className='text-foreground font-semibold'>
                    Date Closed
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className='py-8 text-center'>
                      loading...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className='py-8 text-center'>
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant='icon'>
                            <TableIcon className='h-4 w-4' />
                          </EmptyMedia>
                          <EmptyTitle>No data to display</EmptyTitle>
                          <EmptyDescription>
                            There are no records in this table yet. Add your
                            first entry to get started.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order: any) => {
                    const repairOrder = order.repairOrder
                    const roNumber = repairOrder?.roNumber || '--'
                    const salesOrder = order.salesOrderNumber || '--'
                    const type = getOrderTypeText(order.partsOrderNumber || 0)
                    const vin = repairOrder?.vin || '--'
                    const yearMakeModel = repairOrder
                      ? `${repairOrder.year || ''} ${repairOrder.make || ''} ${repairOrder.model || ''}`.trim() ||
                        '--'
                      : '--'
                    const status = order.status || '--'
                    const shop = repairOrder?.shop
                      ? `${repairOrder.shop.name || ''} (${repairOrder.shop.id || ''})`
                      : '--'
                    const dealer = repairOrder?.dealership
                      ? `${repairOrder.dealership.name || ''} (${repairOrder.dealership.id || ''})`
                      : '--'
                    const region = repairOrder?.region || '--'
                    const dateCompleted = formatDate(order.dateCreated)
                    const dateClosed = formatDate(repairOrder?.dateClosed)
                    // 判断是否有备注（从备用经销商订购）
                    const hasNote =
                      repairOrder?.orderFromAlternateDealership || false

                    return (
                      <TableRow key={order.id} className='hover:bg-muted/50'>
                        <TableCell
                          className='cursor-pointer text-blue-600 hover:underline'
                          onClick={() => {
                            navigate({
                              to: '/repair_orders/$id',
                              params: { id: order.repairOrder.id.toString() },
                            })
                          }}
                        >
                          {roNumber}
                        </TableCell>
                        <TableCell>{salesOrder}</TableCell>
                        <TableCell>{type}</TableCell>
                        <TableCell className='font-mono text-xs'>
                          {vin}
                        </TableCell>
                        <TableCell>{yearMakeModel}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(filterByStatus)}
                            className='whitespace-nowrap'
                          >
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm'>{shop}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {hasNote && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className='h-4 w-4 cursor-help text-yellow-600' />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Ordered from an alternate dealer</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <span className='text-sm'>{dealer}</span>
                          </div>
                        </TableCell>
                        <TableCell>{region}</TableCell>
                        <TableCell>{dateCompleted}</TableCell>
                        <TableCell>{dateClosed || '--'}</TableCell>
                      </TableRow>
                    )
                  })
                )}
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
      </div>
    </div>
  )
}
