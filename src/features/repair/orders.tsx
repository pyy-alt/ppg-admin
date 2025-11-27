import { useEffect, useState } from 'react'
import RequestApi from '@/js/clients/base/OrderApi'
import RepairOrderSearchRequest from '@/js/models/RepairOrderSearchRequest'
import { Plus, Search, AlertTriangle, TableIcon } from 'lucide-react'
import navImg from '@/assets/img/repair/nav.png'
import { useAuthStore } from '@/stores/auth-store'
import { calculateDateRange, formatDateOnly } from '@/lib/utils'
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
import RepairOrderDialog from '@/components/RepairOrderDialog'
import { DataTablePagination } from '@/components/data-table-pagination'
import { DatePicker } from '@/components/date-picker'

// const repairOrders = [
//   ...Array(50)
//     .fill(0)
//     .map((_, index) => ({
//       ro: `810-${index}`,
//       orders: [`SO-1045-${index}`],
//       vin: `AUDIZZZ3BZWE123456-${index}`,
//       vehicle: `2024 Audi Q5-${index}`,
//       status: `CSR Review-${index}`,
//       customer: `Mark Stevenson-${index}`,
//       submitted: `02/27/2025-${index}`,
//       completed: `--`,
//       hasAlert: true,
//     })),
// ]

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

  const [totalItems, setTotalItems] = useState(repairOrders.length || 0)
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  // 计算当前页应该显示的数据
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageData = repairOrders.slice(startIndex, endIndex)

  // 🚨 添加调试日志
  // console.log(`Current Page: ${currentPage}`)
  // console.log(`Data Length to Render: ${currentPageData.length}`)
  // console.log(`Total Items: ${totalItems}`)

  const [isOpen, setOpen] = useState(false)
  const [showRepairCompleted, setShowRepairCompleted] = useState(false)
  const [filterByStatus, setFilterByStatus] = useState('all')
  const [smartFilter, setSmartFilter] = useState('')
  const [dateRangePreset, setDateRangePreset] = useState('all')
  // 当点击了列表ID之后设置isEdit=true
  const [isEdit] = useState(false)
  const getRepairOrders = async () => {
    try {
      const api = new RequestApi()
      let shopId: number | null = null

      if (user?.type === 'Shop') {
        // Shop 用户：使用自己的 roNumber
        // shopId = parseInt(user.roNumber, 10)
        shopId = 10
      } else if (user?.type === 'ProgramAdministrator') {
        // 管理员用户：尝试传入 0（可能需要根据后端实际行为调整）
        shopId = 300
      }
      if (shopId === null) {
        console.error('Unable to determine shopId for user type:', user?.type)
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

  // 当搜索条件改变时，重置页码并调用 API
  useEffect(() => {
    if (!user) return // 等待用户信息加载

    // 重置到第一页
    setCurrentPage(1)

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
      <img
        src={navImg}
        alt='Repair Order List'
        className='h-full w-full object-cover'
      />
      {/* Header */}
      <div className='bg-background border-b'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-foreground text-2xl font-bold'>
            Repair Order List
          </h1>
          <Button
            variant='default'
            onClick={() => setOpen(true)}
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
        onSuccess={(data) => {
          console.log('RO created!', data)
          // 刷新列表或跳转详情页
        }}
        initialData={
          isEdit
            ? {
                roNumber: '805',
                customer: 'Brian Cooper',
                vin: 'WVWZZZ5CZKK246801',
                make: 'audi',
                year: '2017',
                model: 's3',
                structuralMeasurementFileAssets: [], // 如果有已上传的文件
                preRepairPhotoFileAssets: [],
                orderFromDealership:
                  'Pacific VW Motors | 88321 (Assigned Dealer)',
              }
            : undefined
        }
      />
      <div className='px-6 py-6'>
        {/* Filters */}
        <div className='lg:items-cente mb-6 flex flex-col items-center gap-4 lg:flex-row'>
          <div className='relative max-w-md'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              value={smartFilter}
              onChange={(e) => setSmartFilter(e.target.value)}
              placeholder='Filter by RO#, Order #, VIN, Customer'
              className='pl-10'
            />
          </div>

          <div className='flex flex-wrap items-center gap-3'>
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
            <div className='flex items-center gap-2'>
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
                  {/* ✅ 修复：使用分页后的数据 currentPageData */}
                  {currentPageData.map((order) => {
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
                            <span className='text-primary cursor-pointer hover:underline'>
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
                        <TableCell>{orderAny.dateLastSubmitted}</TableCell>
                        <TableCell className='text-muted-foreground'>
                          {orderAny.dateClosed}
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
