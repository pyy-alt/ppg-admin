'use client'

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
import { useState } from 'react'

// 真实模拟店铺数据（已覆盖所有状态和地区）
const mockShops = [
  {
    name: 'Bay Area Auto Care',
    number: '4127',
    pendingOrders: 4,
    activeUsers: 5,
    pendingUsers: 2,
    status: 'Certified',
    certification: 'Audi Ultra',
    address: '101 Mission St',
    city: 'San Francisco',
    state: 'CA',
    dealer: 'VW San Francisco',
    dealerNumber: '65478',
    region: 'Western US',
  },
  {
    name: 'Boston Performance',
    number: '5289',
    pendingOrders: 3,
    activeUsers: 7,
    pendingUsers: 1,
    status: 'Certified',
    certification: 'Audi Ultra',
    address: '222 Commonwealth Ave',
    city: 'Boston',
    state: 'MA',
    dealer: 'Audi of Boston',
    dealerNumber: '37219',
    region: 'Eastern US',
  },
  {
    name: 'Chicago Car Specialists',
    number: '3098',
    pendingOrders: 1,
    activeUsers: 3,
    pendingUsers: 0,
    status: 'Certified',
    certification: 'Volkswagen',
    address: '789 Wacker Dr',
    city: 'Chicago',
    state: 'IL',
    dealer: 'Audi of Chicago',
    dealerNumber: '76532',
    region: 'Central US',
  },
  {
    name: 'Dallas Pro Shop',
    number: '6345',
    pendingOrders: 7,
    activeUsers: 6,
    pendingUsers: 3,
    status: 'Certified',
    certification: 'Audi Hybrid',
    address: '353 Elm St',
    city: 'Dallas',
    state: 'TX',
    dealer: 'VW Dallas',
    dealerNumber: '98123',
    region: 'Central US',
  },
  {
    name: 'LA Performance Garage',
    number: '1032',
    pendingOrders: 3,
    activeUsers: 2,
    pendingUsers: 2,
    status: 'Certified',
    certification: 'Audi Hybrid',
    address: '777 Sunset Blvd',
    city: 'Los Angeles',
    state: 'CA',
    dealer: 'Audi Los Angeles',
    dealerNumber: '89176',
    region: 'Western US',
  },
  {
    name: 'NYC Car Center',
    number: '9234',
    pendingOrders: 2,
    activeUsers: 8,
    pendingUsers: 0,
    status: 'Certified',
    certification: 'Volkswagen',
    address: '666 5th Ave',
    city: 'New York',
    state: 'NY',
    dealer: 'VW of New York',
    dealerNumber: '67895',
    region: 'Eastern US',
  },
  {
    name: 'Santa Monica Service',
    number: '2045',
    pendingOrders: 5,
    activeUsers: 5,
    pendingUsers: 1,
    status: 'Certified',
    certification: 'Volkswagen',
    address: '456 Ocean Ave',
    city: 'Santa Monica',
    state: 'CA',
    dealer: 'VW Santa Monica',
    dealerNumber: '92341',
    region: 'Western US',
  },
  {
    name: 'Vancouver Car Experts',
    number: '7456',
    pendingOrders: 2,
    activeUsers: 6,
    pendingUsers: 2,
    status: 'Certified',
    certification: 'Audi Hybrid',
    address: '444 Granville St',
    city: 'Vancouver',
    state: 'BC',
    dealer: 'Audi Vancouver',
    dealerNumber: '56784',
    region: 'Canada',
  },
]

export function Shops() {
  // 添加状态
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const totalItems = mockShops.length // 根据实际数据
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className='min-h-screen bg-background text-foreground'>
      {/* Header */}
      <div className='border-b bg-background'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-2xl font-bold text-foreground'>Manage Shops</h1>
          <Button>
            <Download className='mr-2 h-4 w-4' />
            Report
          </Button>
        </div>
      </div>

      <div className='px-6 py-6'>
        {/* Search + Filters */}
        <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center'>
          <div className='relative max-w-md flex-1'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Filter by Name, #, City'
              className='pl-10'
            />
          </div>

          <div className='flex flex-wrap gap-3'>
            <Select defaultValue='all'>
              <SelectTrigger className='bg-muted'>
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
              <SelectTrigger className='bg-muted'>
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
              <SelectTrigger className='bg-muted'>
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
        <div className='overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted hover:bg-muted'>
                <TableHead className='font-semibold text-foreground'>Name</TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Number
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  # of Pending Orders
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  # of Active Users
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  # of Pending Users
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Status
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Certification
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Address
                </TableHead>
                <TableHead className='font-semibold text-foreground'>City</TableHead>
                <TableHead className='font-semibold text-foreground'>
                  State
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Dealer
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Dealer #
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Region
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockShops.map((shop) => (
                <TableRow key={shop.number} className='hover:bg-muted/50'>
                  <TableCell className='cursor-pointer font-medium text-primary hover:underline'>
                    {shop.name}
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
                      className='bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800'
                    >
                      {shop.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{shop.certification}</TableCell>
                  <TableCell className='text-muted-foreground'>
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