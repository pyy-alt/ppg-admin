import { useState } from 'react'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import navImg from '@/assets/img/repair/nav.png'
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

const repairOrders = [
  ...Array(50)
    .fill(0)
    .map((_, index) => ({
      ro: `810-${index}`,
      orders: [`SO-1045-${index}`],
      vin: `AUDIZZZ3BZWE123456-${index}`,
      vehicle: `2024 Audi Q5-${index}`,
      status: `CSR Review-${index}`,
      customer: `Mark Stevenson-${index}`,
      submitted: `02/27/2025-${index}`,
      completed: `--`,
      hasAlert: true,
    })),
]

const getStatusVariant = (status: string) => {
  if (status.includes('Rejected')) return 'destructive'
  if (status.includes('Review')) return 'secondary'
  if (status.includes('Processing')) return 'outline'
  if (status.includes('Shipped')) return 'default'
  return 'secondary'
}

export function RepairOrderList() {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // 根据实际数据计算
  const totalItems = repairOrders.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // 计算当前页应该显示的数据
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageData = repairOrders.slice(startIndex, endIndex)

  // 🚨 添加调试日志
  console.log(`Current Page: ${currentPage}`)
  console.log(`Data Length to Render: ${currentPageData.length}`)
  console.log(`Total Items: ${totalItems}`)

  const [isNewOpen, setIsNewOpen] = useState(false)

  const [openEdit, setOpenEdit] = useState(false)

  return (
    <div className='min-h-screen bg-background'>
      <img
        src={navImg}
        alt='Repair Order List'
        className='h-full w-full object-cover'
      />
      {/* Header */}
      <div className='border-b bg-background'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-2xl font-bold text-foreground'>
            Repair Order List
          </h1>
          <Button
            variant='default'
            onClick={() => setIsNewOpen(true)}
            // onClick={() => setOpenEdit(true)}
          >
            <Plus className='mr-2 h-4 w-4' />
            New Repair Order
          </Button>
        </div>
      </div>
      {/* 新增 */}
      <RepairOrderDialog
        open={isNewOpen}
        onOpenChange={setIsNewOpen}
        onSuccess={(data) => {
          console.log('RO created!', data)
          // 刷新列表或跳转详情页
        }}
      />
      {/* 编辑 */}
      <RepairOrderDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        onSuccess={(data) => {
          console.log('Updated:', data)
        }}
        initialData={{
          shopRO: '805',
          customer: 'Brian Cooper',
          vin: 'WVWZZZ5CZKK246801',
          make: 'audi',
          year: '2017',
          model: 's3',
          measurementsFiles: [], // 如果有已上传的文件
          photoFiles: [],
          orderFromDealership: 'Pacific VW Motors | 88321 (Assigned Dealer)',
        }}
      />
      <div className='px-6 py-6'>
        {/* Filters */}
        <div className='lg:items-cente mb-6 flex flex-col items-center gap-4 lg:flex-row'>
          <div className='relative max-w-md'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Filter by RO#, Order #, VIN, Customer'
              className='pl-10'
            />
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <Select defaultValue='all'>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='review'>CSR Review</SelectItem>
                <SelectItem value='processing'>Dealer Processing</SelectItem>
                <SelectItem value='shipped'>Dealer Shipped</SelectItem>
                <SelectItem value='received'>Shop Received</SelectItem>
                <SelectItem value='rejected'>CSR Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue='last7'>
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Date Range' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='last7'>Last 7 Days</SelectItem>
                <SelectItem value='last30'>Last 30 Days</SelectItem>
                <SelectItem value='custom'>Custom Range</SelectItem>
              </SelectContent>
            </Select>

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
            <div className='flex items-center gap-2'>
              <Checkbox id='show-completed' className='rounded-full' />
              <Label
                htmlFor='show-completed'
                className='cursor-pointer text-sm font-medium'
              >
                Show Repair Completed
              </Label>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted'>
                <TableHead className='font-semibold text-foreground'>RO #</TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Order #
                </TableHead>
                <TableHead className='font-semibold text-foreground'>VIN</TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Year/Make/Model
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Status
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Customer
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Date Submitted
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Date Completed
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* ✅ 修复：使用分页后的数据 currentPageData */}
              {currentPageData.map((order) => (
                <TableRow key={order.ro} className='hover:bg-muted/50'>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-2'>
                      {order.hasAlert && (
                        <AlertTriangle className='h-4 w-4 text-destructive' />
                      )}
                      <span className='cursor-pointer text-primary hover:underline'>
                        {order.ro}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-1'>
                      {order.orders.map((o) => (
                        <div key={o}>{o}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className='font-mono text-sm'>
                    {order.vin}
                  </TableCell>
                  <TableCell>{order.vehicle}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(order.status)}
                      className='whitespace-nowrap'
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.submitted}</TableCell>
                  <TableCell className='text-muted-foreground'>
                    {order.completed}
                  </TableCell>
                </TableRow>
              ))}
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
  )
}
