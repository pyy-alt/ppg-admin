import { useState } from 'react'
import { Search, Download, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// 正确的 Table 导入方式（2025 年最新 shadcn 标准）
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

// 模拟数据（保持不变）
const mockOrders = [
  {
    ro: '805',
    salesOrder: 'SO-10028',
    type: 'Supplement 1',
    vin: 'WVWZZZ5CZKK246801',
    yearMakeModel: '2019 VW Atlas',
    status: 'CSR Review',
    shop: 'Sunset Auto Collision (2458)',
    dealer: 'Pacific VW Motors (98321)',
    region: 'Western US',
    dateCompleted: '02/25/2025',
    dateClosed: null,
    hasNote: false,
  },
  {
    ro: '805',
    salesOrder: 'SO-10027',
    type: 'Parts Order',
    vin: 'WVWZZZ5CZKK246801',
    yearMakeModel: '2019 VW Atlas',
    status: 'Dealer Shipped',
    shop: 'Sunset Auto Collision (2458)',
    dealer: 'Pacific VW Motors (98321)',
    region: 'Western US',
    dateCompleted: '02/25/2025',
    dateClosed: null,
    hasNote: false,
  },
  {
    ro: '542',
    salesOrder: 'SO-9640',
    type: 'Parts Order',
    vin: 'WAUZZZ1BZME123456',
    yearMakeModel: '2019 Audi A4',
    status: 'CSR Rejected',
    shop: 'Nova Scotia Audi (3481)',
    dealer: 'Halifax VW & Audi (2145)',
    region: 'Canada',
    dateCompleted: '02/23/2025',
    dateClosed: null,
    hasNote: false,
  },
  {
    ro: '21984',
    salesOrder: 'SO-8516',
    type: 'Parts Order',
    vin: 'WAUZZZKNZNE234567',
    yearMakeModel: '2020 Audi Q5',
    status: 'Shop Received',
    shop: 'Waikiki Audi Repair (2231)',
    dealer: 'Island Breeze VW & Audi (3076)',
    region: 'Western US',
    dateCompleted: '02/23/2025',
    dateClosed: null,
    hasNote: false,
  },
  {
    ro: '7781',
    salesOrder: 'SO-7640',
    type: 'Supplement 2',
    vin: 'WVWZZZ9NZJP987654',
    yearMakeModel: '2021 VW Golf GTI',
    status: 'Dealer Processing',
    shop: 'Sunset Auto Collision (2458)',
    dealer: 'Pacific VW Motors (98321)',
    region: 'Western US',
    dateCompleted: '02/22/2025',
    dateClosed: null,
    hasNote: true,
  },
  {
    ro: '25',
    salesOrder: 'SO-8513',
    type: 'Parts Order',
    vin: 'WVWZZZ16ZHM234567',
    yearMakeModel: '2018 VW Beetle',
    status: 'Dealer Processing',
    shop: 'Volkswagen Garage (34021)',
    dealer: 'Pacific VW Motors (98321)',
    region: 'Western US',
    dateCompleted: '02/23/2025',
    dateClosed: null,
    hasNote: false,
  },
  {
    ro: '456',
    salesOrder: 'SO-7429',
    type: 'Supplement 2',
    vin: 'WVWZZZ1KZAW654321',
    yearMakeModel: '2020 VW Passat',
    status: 'Shop Received',
    shop: 'SoCal VW Specialists (4501)',
    dealer: 'Unity VW & Audi (8563)',
    region: 'Western US',
    dateCompleted: '02/22/2025',
    dateClosed: null,
    hasNote: false,
  },
  {
    ro: '7781',
    salesOrder: 'SO-7638',
    type: 'Supplement 1',
    vin: 'WVWZZZ9NZJP987654',
    yearMakeModel: '2021 VW Golf GTI',
    status: 'CSR Rejected',
    shop: 'VW Motorworks (13204)',
    dealer: 'Pacific Motors (98321)',
    region: 'Western US',
    dateCompleted: '02/21/2025',
    dateClosed: null,
    hasNote: true,
  },
  {
    ro: '7781',
    salesOrder: 'SO-7637',
    type: 'Parts Order',
    vin: 'WVWZZZ9NZJP987654',
    yearMakeModel: '2021 VW Golf GTI',
    status: 'Shop Received',
    shop: 'VW Motorworks (13204)',
    dealer: 'Pacific VW Motors (98321)',
    region: 'Western US',
    dateCompleted: '02/21/2025',
    dateClosed: '02/28/2025',
    hasNote: true,
  },
  {
    ro: '804',
    salesOrder: 'SO-6197',
    type: 'Parts Order',
    vin: 'WVWZZZ3BZWE123456',
    yearMakeModel: '2019 VW Jetta',
    status: 'Repair Completed',
    shop: 'Sunset Auto Collision (2458)',
    dealer: 'Pacific VW Motors (98321)',
    region: 'Western US',
    dateCompleted: '02/21/2025',
    dateClosed: null,
    hasNote: false,
  },
]

export function PartsOrders() {
  const [onlyMyOrders, setOnlyMyOrders] = useState(true)
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  const [dateSubmittedRange, setDateSubmittedRange] = useState<string>('7')
  const [typeOfOrder, setTypeOfOrder] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [csrRegion, setCsrRegion] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const totalItems = mockOrders.length // 根据实际数据
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const [open, setOpen] = useState(false)

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

  return (
    <div className='bg-background text-foreground min-h-screen'>
      {/* Header */}
      <div className='bg-background border-b'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-foreground text-2xl font-bold'>
            Parts Order List
          </h1>
          <Button>
            <Download className='mr-2 h-4 w-4' />
            Report
          </Button>
        </div>
      </div>
      <div className='px-6 py-6'>
        {/* Search + Checkbox */}
        <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center'>
          <div className='relative max-w-md flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Filter by RO#, Sales Order #, VIN, Shop, Dealer'
              className='pl-10'
            />
          </div>
          <div className='flex items-center gap-3'>
            <Checkbox
              id='my-orders'
              checked={onlyMyOrders}
              onCheckedChange={(checked) => setOnlyMyOrders(checked as boolean)}
              className='bg-muted rounded-full'
            />
            <Label
              htmlFor='my-orders'
              className='flex cursor-pointer items-center gap-2 text-sm font-medium'
            >
              {/* <AlertCircle className="h-4 w-4 text-gray-600" /> */}
              Only View Parts Orders that are waiting On Me
            </Label>
          </div>
        </div>

        {/* 完整筛选条件 */}
        <div className='mb-6 flex flex-wrap items-center gap-3'>
          <Select
            defaultValue={typeOfOrder}
            onValueChange={(value) => setTypeOfOrder(value)}
          >
            <SelectTrigger className='bg-muted w-48'>
              <SelectValue placeholder='Type of Order' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='parts'>Parts Order</SelectItem>
              <SelectItem value='supplement1'>Supplement 1</SelectItem>
              <SelectItem value='supplement2'>Supplement 2</SelectItem>
            </SelectContent>
          </Select>

          <Select
            defaultValue={status}
            onValueChange={(value) => setStatus(value)}
          >
            <SelectTrigger className='bg-muted w-48'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value=' csr-Review'>CSR Review</SelectItem>
              <SelectItem value=' csr-rejected'>CSR Rejected</SelectItem>
              <SelectItem value=' dealer-processing'>
                Dealer Processing
              </SelectItem>
              <SelectItem value='dealer-shipped'>Dealer Shipped</SelectItem>
              <SelectItem value='shop-received'>Shop Received</SelectItem>
              <SelectItem value='repair-completed'>Repair Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            defaultValue={csrRegion}
            onValueChange={(value) => setCsrRegion(value)}
          >
            <SelectTrigger className='bg-muted w-48'>
              <SelectValue placeholder='CSR Region' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Regions</SelectItem>
              <SelectItem value='western'>Western US</SelectItem>
              <SelectItem value='canada'>Canada</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Date Submitted Range</span>
            <Select
              defaultValue={dateSubmittedRange}
              onValueChange={(value) => setDateSubmittedRange(value)}
            >
              <SelectTrigger className='bg-muted w-48'>
                <SelectValue placeholder='ALL Dates' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7'>Past 7 Days</SelectItem>
                <SelectItem value='30'>Past 30 Days</SelectItem>
                <SelectItem value='month-to-date'>Month-To-Date</SelectItem>
                <SelectItem value='quarter-to-date'>Quarter-To-Date</SelectItem>
                <SelectItem value='year-to-date'>Year-To-Date</SelectItem>
                <SelectItem value='last-month'>Last Month</SelectItem>
                <SelectItem value='last-quarter'>Last Quarter</SelectItem>
                <SelectItem value='last-year'>Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 日期范围选择 */}
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>From</span>
            <DatePicker
              selected={fromDate}
              onSelect={(date) => setFromDate(date)}
              placeholder='Select from date'
            />
            <span className='text-sm font-medium'>To</span>
            <DatePicker
              selected={toDate}
              onSelect={(date) => setToDate(date)}
              placeholder='Select to date'
            />
          </div>
        </div>

        {/* Table */}
        <div className='bg-card text-card-foreground overflow-hidden rounded-lg border shadow-sm'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted hover:bg-muted'>
                <TableHead className='text-foreground font-semibold'>
                  RO #
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  Sales #
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
              {mockOrders.map((order) => (
                <TableRow
                  key={`${order.ro}-${order.salesOrder}`}
                  className='hover:bg-muted/50'
                >
                  <TableCell
                    className='text-primary cursor-pointer font-medium'
                    onClick={() => setOpen(true)}
                  >
                    {order.ro}
                  </TableCell>
                  <TableCell>{order.salesOrder}</TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell className='font-mono text-xs'>
                    {order.vin}
                  </TableCell>
                  <TableCell>{order.yearMakeModel}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(order.status)}
                      className='whitespace-nowrap'
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-sm'>{order.shop}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {order.hasNote && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle className='h-4 w-4 cursor-help text-yellow-600 dark:text-yellow-500' />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ordered from an alternate dealer</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <span className='text-sm'>{order.dealer}</span>
                    </div>
                  </TableCell>
                  <TableCell>{order.region}</TableCell>
                  <TableCell>{order.dateCompleted}</TableCell>
                  <TableCell>{order.dateClosed || '--'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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
  )
}
