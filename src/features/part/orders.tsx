import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import OrderApi from '@/js/clients/base/OrderApi'
import PartsOrderSearchRequest from '@/js/models/PartsOrderSearchRequest'
import ResultParameter from '@/js/models/ResultParameter'
import { Search, Download, AlertCircle, TableIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
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
import { DateRangePicker } from '@/components/DateRangePicker'
import { DataTablePagination } from '@/components/data-table-pagination'

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

  const [range, setRange] = useState<DateRange>()

  const getFlattenedCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const pageData = orders.slice(startIndex, endIndex)

    return pageData.map((order: any) => {
      const ro = order.repairOrder || {}
      const shop = ro.shop || {}
      const dealer = ro.dealership || {}

      return {
        'RO#': ro.roNumber || '--', // ← Must be in quotation marks.！
        'Sales#': order.salesOrderNumber || '--', // ← Must be in quotation marks.！
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
    // Ensure the component is mounted and ref Connected to DOM
    if (partsOrderRef.current) {
      // 2. Use native DOM API Find all <th> Element
      const thElements = partsOrderRef.current.querySelectorAll('thead th')

      // 3. Extract text content.
      const headerTexts = Array.from(thElements).map((th) =>
        th.textContent.trim()
      )
      setHeaders(headerTexts)
    }
  }, [orders])
  // const getStatusVariant = (
  //   status: string
  // ): 'default' | 'secondary' | 'destructive' | 'outline' => {
  //   if (status.includes('Review') || status.includes('Rejected'))
  //     return 'destructive'
  //   if (status.includes('Shipped') || status.includes('Completed'))
  //     return 'default'
  //   if (status.includes('Received')) return 'secondary'
  //   if (status.includes('Processing')) return 'outline'
  //   return 'secondary'
  // }
  const getStatusTxt = (status: string) => {
    switch (status) {
      case 'CsrReview':
        return 'CSR Review'
      case 'CsrRejected':
        return 'Csr Rejected'
      case 'DealershipProcessing':
        return 'Dealer Processing'
      case 'DealershipShipped':
        return 'Dealer Shipped'
      case 'ShopReceived':
        return 'Shop Received'
      case 'RepairCompleted':
        return 'Repair Completed'
    }
  }

  // Obtain parts order data
  const fetchPartsOrders = async (flag: boolean = false) => {
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

      // Build request parameters
      const requestParams: any = {
        smartFilter,
        filterByWaitingOnMe,
        filterByDealershipId:
          user?.person?.type === 'Dealership'
            ? user?.person?.dealership.id
            : undefined,
      }
      // Processing order type filtering
      if (filterByPartsOrderNumber !== 'all') {
        requestParams.filterByPartsOrderNumber = parseInt(
          filterByPartsOrderNumber
        )
      }

      // Processing status filter
      if (filterByStatus !== 'all') {
        requestParams.filterByStatus = filterByStatus
      }
      if (filterByRegionId !== 'all') {
        requestParams.filterByRegionId = parseInt(filterByRegionId)
      }
      // // Add pagination parameters.
      const resultParameter = ResultParameter.create({
        resultsLimitOffset: (currentPage - 1) * itemsPerPage,
        resultsLimitCount: itemsPerPage,
        resultsOrderBy: 'dateSubmitted', // The sorting fields can be adjusted as needed.
        resultsOrderAscending: false, // Descending order，The latest is in front.
      })
      requestParams.resultParameter = resultParameter

      const request = PartsOrderSearchRequest.create(requestParams)
      // Before serialization，Manually format the date field as a string.（Covering ModelBaseClass The conversion）
      if (dateFrom) {
        ;(request as any).dateSubmittedFrom = dateFrom
      }
      if (dateTo) {
        ;(request as any).dateSubmittedTo = dateTo
      }

      if (flag) {
        ;(request as any).dateSubmittedFrom = undefined
        ;(request as any).dateSubmittedTo = undefined
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
        },
      })
    } catch (error) {
      console.error('API Call error:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    // Invoke API（For text input，Use anti-shake.）
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

  // When the preset range changes，Automatically calculate the date.
  useEffect(() => {
    if (dateSubmittedRange !== 'custom') {
      const { from, to } = calculateDateRange(dateSubmittedRange)
      setFromDate(from)
      setToDate(to)
    }
  }, [dateSubmittedRange])

  // Format date display
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

  // Get order type display text.
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
            {/* Only CSRs（Customer Service Representative） and Distributor (Dealers) Can only be seen and used. */}
            {(user?.person?.type === 'Csr' ||
              user?.person?.type === 'Dealership') && (
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
            )}
          </div>

          {/* Complete screening criteria */}
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
                <SelectItem value='CsrReview'>CSR Review</SelectItem>
                <SelectItem value='CsrRejected'>CSR Rejected</SelectItem>
                <SelectItem value='DealershipProcessing'>
                  Dealer Processing
                </SelectItem>
                <SelectItem value='DealershipShipped'>
                  Dealer Shipped
                </SelectItem>
                <SelectItem value='ShopReceived'>Shop Received</SelectItem>
                <SelectItem value='RepairCompleted'>
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

            {/* Date range selection */}
            {dateSubmittedRange === 'custom' && (
              <DateRangePicker
                value={range}
                onChange={(newRange) => {
                  setRange(newRange)
                  // Sync to the original state.，Used for API Inquiry
                  setFromDate(newRange?.from ?? undefined)
                  setToDate(newRange?.to ?? undefined)
                }}
                onClose={() => {
                  // Re-query the list when the popup is closed.
                  fetchPartsOrders(true)
                }}
                placeholder='Select date range'
                disabled={false}
              />
            )}
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
                    const region = user?.person?.csrRegion?.name || '--'
                    const dateCompleted = formatDate(order.dateCreated)
                    const dateClosed = formatDate(repairOrder?.dateClosed)
                    // Determine if there are any remarks.（Order from the backup dealer.）
                    const hasNote =
                      repairOrder?.dealership.id !== repairOrder?.shop.sponsorDealership.id

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
                            // variant={getStatusVariant(filterByStatus)}
                            variant='secondary'
                            className='whitespace-nowrap'
                          >
                            {getStatusTxt(status)}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm'>{shop}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {hasNote && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className='h-4 w-4 cursor-help text-yellow-500' />
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
