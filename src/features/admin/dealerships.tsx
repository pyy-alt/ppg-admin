'use client'

import { Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState } from 'react'
import { DataTablePagination } from '@/components/data-table-pagination'

// 真实模拟经销商数据（已覆盖美加多地）
const mockDealers = [
  {
    name: 'Bayview VW',
    number: '80231',
    pendingOrders: 5,
    city: 'San Francisco',
    state: 'CA',
    activeUsers: 6,
    pendingUsers: 1,
  },
  {
    name: 'Cascade VW',
    number: '77412',
    pendingOrders: 2,
    city: 'Seattle',
    state: 'WA',
    activeUsers: 5,
    pendingUsers: 1,
  },
  {
    name: 'Desert Star Audi',
    number: '65902',
    pendingOrders: 1,
    city: 'Phoenix',
    state: 'AZ',
    activeUsers: 4,
    pendingUsers: 0,
  },
  {
    name: 'Empire State Audi',
    number: '91822',
    pendingOrders: 0,
    city: 'New York',
    state: 'NY',
    activeUsers: 4,
    pendingUsers: 3,
  },
  {
    name: 'Great Lakes Audi',
    number: '73219',
    pendingOrders: 9,
    city: 'Chicago',
    state: 'IL',
    activeUsers: 5,
    pendingUsers: 2,
  },
  {
    name: 'Lone Star VW',
    number: '44387',
    pendingOrders: 3,
    city: 'Dallas',
    state: 'TX',
    activeUsers: 7,
    pendingUsers: 0,
  },
  {
    name: 'Maple Leaf VW',
    number: '55721',
    pendingOrders: 4,
    city: 'Toronto',
    state: 'ON',
    activeUsers: 8,
    pendingUsers: 0,
  },
  {
    name: 'Northern Lights Audi',
    number: '62988',
    pendingOrders: 4,
    city: 'Edmonton',
    state: 'AB',
    activeUsers: 2,
    pendingUsers: 2,
  },
  {
    name: 'Rocky Mountain VW',
    number: '88365',
    pendingOrders: 3,
    city: 'Denver',
    state: 'CO',
    activeUsers: 3,
    pendingUsers: 1,
  },
  {
    name: 'Sunshine Audi',
    number: '70154',
    pendingOrders: 7,
    city: 'Orlando',
    state: 'FL',
    activeUsers: 6,
    pendingUsers: 2,
  },
  {
    name: 'Pacific Coast VW',
    number: '91234',
    pendingOrders: 6,
    city: 'Los Angeles',
    state: 'CA',
    activeUsers: 9,
    pendingUsers: 1,
  },
  {
    name: 'Atlantic Audi',
    number: '34567',
    pendingOrders: 2,
    city: 'Boston',
    state: 'MA',
    activeUsers: 5,
    pendingUsers: 4,
  },
]

export function Dealerships() {
  // 添加状态
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 20
const totalItems = mockDealers.length // 根据实际数据
const totalPages = Math.ceil(totalItems / itemsPerPage)
  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='border-b bg-background'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-2xl font-bold text-foreground'>Manage Dealers</h1>
          <Button>
            <Download className='mr-2 h-4 w-4' />
            Report
          </Button>
        </div>

      <div className='px-6 py-6'>
        {/* Search */}
        <div className='mb-6 max-w-md'>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Filter by Name, #, City'
              className='border-gray-300 pl-10'
            />
          </div>
        </div>

        {/* Table */}
        <div className='overflow-hidden rounded-lg border bg-background shadow-sm'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted'>
                <TableHead className='font-semibold text-foreground'>Name</TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Number
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  # of Pending Orders
                </TableHead>
                <TableHead className='font-semibold text-foreground'>City</TableHead>
                <TableHead className='font-semibold text-foreground'>
                  State
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  # of Active Users
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  # of Pending Users
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDealers.map((dealer) => (
                <TableRow key={dealer.number} className='hover:bg-background'>
                  <TableCell className='cursor-pointer font-medium text-blue-600 hover:underline'>
                    {dealer.name}
                  </TableCell>
                  <TableCell>{dealer.number}</TableCell>
                  <TableCell className='text-center font-medium'>
                    {dealer.pendingOrders}
                  </TableCell>
                  <TableCell>{dealer.city}</TableCell>
                  <TableCell>{dealer.state}</TableCell>
                  <TableCell className='text-center'>
                    {dealer.activeUsers}
                  </TableCell>
                  <TableCell className='text-center'>
                    {dealer.pendingUsers}
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
    </div>
  )
}
