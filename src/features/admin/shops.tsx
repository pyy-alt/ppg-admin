import { useState } from 'react'
import { Search, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { DataTablePagination } from '@/components/data-table-pagination'

// 真实模拟店铺数据（已覆盖所有状态和地区）
// 动态生成数据
const mockShops = Array.from({ length: 100 }, (_, index) => ({
  name: `Shop ${index + 1}`,
  number: `1234567890${index + 1}`,
  pendingOrders: Math.floor(Math.random() * 100),
  activeUsers: Math.floor(Math.random() * 100),
  pendingUsers: Math.floor(Math.random() * 100),
  status: Math.random() > 0.5 ? 'certified' : 'pending',
  certification: Math.random() > 0.5 ? 'Audi Ultra' : 'Audi Hybrid',
  address: `123 Main St, ${index + 1}`,
  city: `City ${index + 1}`,
  state: `State ${index + 1}`,
  dealer: `Dealer ${index + 1}`,
  dealerNumber: `1234567890${index + 1}`,
  region: `Region ${index + 1}`,
}))


export function Shops() {

   // 添加状态
   const [currentPage, setCurrentPage] = useState(1)
   const itemsPerPage = 20
   const totalItems = mockShops.length // 根据实际数据
   const totalPages = Math.ceil(totalItems / itemsPerPage)

      // 计算当前页应该显示的数据
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedShops = mockShops.slice(startIndex, endIndex)
   

  return (
    <div className='bg-background min-h-screen'>
      {/* Header */}
      <div className='bg-background'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-foreground text-2xl font-bold'>Manage Shops</h1>
          <Button>
            <Download className='mr-2 h-4 w-4' />
            Report
          </Button>
        </div>
      </div>

      <div className='px-6 py-1'>
        {/* Search + Filters */}
        <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center'>
          <div className='relative max-w-md flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input placeholder='Filter by Name, #, City' className='pl-10' />
          </div>

          <div className='flex flex-wrap gap-3'>
            <Select defaultValue='all'>
              <SelectTrigger className='bg-muted w-48'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='certified'>Certified</SelectItem>
                <SelectItem value='pending'>
                  Pending Approval Pending
                </SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue='all'>
              <SelectTrigger className='bg-muted w-48'>
                <SelectValue placeholder='Certification' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Certifications</SelectItem>
                <SelectItem value='audi-ultra'>Audi Ultra</SelectItem>
                <SelectItem value='audi-hybrid'>Audi Hybrid</SelectItem>
                <SelectItem value='vw'>Volkswagen</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue='all'>
              <SelectTrigger className='bg-muted w-48'>
                <SelectValue placeholder='CSR Region' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Regions</SelectItem>
                <SelectItem value='western'>Western US</SelectItem>
                <SelectItem value='eastern'>Eastern US</SelectItem>
                <SelectItem value='central'>Central US</SelectItem>
                <SelectItem value='canada'>Canada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className='bg-background overflow-hidden rounded-lg border shadow-sm'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted'>
                <TableHead className='text-foreground font-semibold'>
                  Name
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  Number
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  # of Pending Orders
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  # of Active Users
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  # of Pending Users
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  Status
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  Certification
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  Address
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  City
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  State
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  Dealer
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  Dealer #
                </TableHead>
                <TableHead className='text-foreground font-semibold'>
                  Region
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedShops.map((shop) => (
                <TableRow key={shop.number} className='hover:bg-background'>
                  <TableCell className='font-medium text-blue-600'>
                    <span className='cursor-pointer hover:underline'>
                      {' '}
                      {shop.name}
                    </span>
                  </TableCell>
                  <TableCell>{shop.number}</TableCell>
                  <TableCell className='text-center font-medium'>
                    {shop.pendingOrders}
                  </TableCell>
                  <TableCell className='text-center'>
                    {shop.activeUsers}
                  </TableCell>
                  <TableCell className='text-center'>
                    {shop.pendingUsers}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='default'
                      className='bg-green-100 text-green-800 hover:bg-green-200'
                    >
                      {shop.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{shop.certification}</TableCell>
                  <TableCell className='text-muted-foreground text-sm'>
                    {shop.address}
                  </TableCell>
                  <TableCell>{shop.city}</TableCell>
                  <TableCell>{shop.state}</TableCell>
                  <TableCell>{shop.dealer}</TableCell>
                  <TableCell>{shop.dealerNumber}</TableCell>
                  <TableCell>{shop.region}</TableCell>
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
