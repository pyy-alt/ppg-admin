'use client'

import { useState } from 'react'
import { Search, Plus, User } from 'lucide-react'
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
import AddNetworkUserDialog from '@/components/AddNetworkUserDialog'
import { DataTablePagination } from '@/components/data-table-pagination'

const mockUsers = [
  {
    firstName: 'Abigail',
    lastName: 'Thomas',
    email: 'athomas@vwgoa.com',
    role: 'Admin',
    region: 'All Regions',
    dateAdded: '8/22/2024',
    lastAccessed: '9/19/2025',
    status: 'Active',
    pendingRegistration: false,
  },
  {
    firstName: 'Alexander',
    lastName: 'Lee',
    email: 'alee@vwgoa.com',
    role: 'Field Staff',
    region: 'Canada',
    dateAdded: '9/5/2024',
    lastAccessed: '9/22/2025',
    status: 'Active',
    pendingRegistration: false,
  },
  {
    firstName: 'Ava',
    lastName: 'Moore',
    email: 'amoore@vwgoa.com',
    role: 'Field Staff',
    region: 'Canada',
    dateAdded: '8/12/2024',
    lastAccessed: '8/15/2025',
    status: 'Inactive',
    pendingRegistration: false,
  },
  {
    firstName: 'Benjamin',
    lastName: 'Harris',
    email: 'bharris@vwgoa.com',
    role: 'Admin',
    region: 'All Regions',
    dateAdded: '8/18/2024',
    lastAccessed: '9/21/2025',
    status: 'Active',
    pendingRegistration: false,
  },
  {
    firstName: 'Charlotte',
    lastName: 'King',
    email: 'cking@vwgoa.com',
    role: 'Field Staff',
    region: 'Eastern US',
    dateAdded: '8/10/2024',
    lastAccessed: '9/23/2025',
    status: 'Active',
    pendingRegistration: false,
  },
  {
    firstName: 'Daniel',
    lastName: 'Martinez',
    email: 'dmartinez@vwgoa.com',
    role: 'CSR',
    region: 'Canada',
    dateAdded: '6/30/2024',
    lastAccessed: '9/19/2025',
    status: 'Active',
    pendingRegistration: false,
  },
  {
    firstName: 'Daniel',
    lastName: 'Scott',
    email: 'dscott@vwgoa.com',
    role: 'CSR',
    region: 'Western US',
    dateAdded: '9/7/2024',
    lastAccessed: '9/20/2025',
    status: 'Active',
    pendingRegistration: false,
  },
  {
    firstName: 'Emily',
    lastName: 'Carter',
    email: 'ecarter@vwgoa.com',
    role: 'CSR',
    region: 'Eastern US',
    dateAdded: '8/12/2024',
    lastAccessed: '9/12/2025',
    status: 'Active',
    pendingRegistration: false,
  },
  {
    firstName: 'Matthew',
    lastName: 'White',
    email: 'mwhite@vwgoa.com',
    role: 'Field Staff',
    region: 'Western US',
    dateAdded: '9/03/2024',
    lastAccessed: '9/18/2025',
    status: 'Active',
    pendingRegistration: false,
  },
  {
    firstName: 'Pending Registration',
    lastName: 'Pending Registration',
    email: 'mnguyen@vwgoa.com',
    role: 'Field Staff',
    region: 'Western US',
    dateAdded: '9/11/2025',
    lastAccessed: null,
    status: 'Pending Registration',
    pendingRegistration: true,
  },
]

export function Users() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  // 添加状态
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const totalItems = mockUsers.length // 根据实际数据
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className='min-h-screen bg-background text-foreground'>
      {/* Header */}
      <div className='border-b bg-background'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-2xl font-bold text-foreground'>
            Manage Network Users
          </h1>
          <Button
            onClick={() => setIsAddUserOpen(true)}
          >
            <Plus className='mr-2 h-4 w-4' />
            Add New User
          </Button>
        </div>
      </div>

      <AddNetworkUserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
      />

      <div className='px-6 py-6'>
        {/* Filters */}
        <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center'>
          <div className='relative max-w-md flex-1'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Filter by First Name, Last Name, Email'
              className=' pl-10'
            />
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <Select defaultValue='all'>
              <SelectTrigger className='w-48 bg-muted'>
                <SelectValue placeholder='Role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Roles</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
                <SelectItem value='csr'>CSR</SelectItem>
                <SelectItem value='field'>Field Staff</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue='all'>
              <SelectTrigger className='w-48 bg-muted'>
                <SelectValue placeholder='CSR Region' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Regions</SelectItem>
                <SelectItem value='western'>Western US</SelectItem>
                <SelectItem value='eastern'>Eastern US</SelectItem>
                <SelectItem value='central'>Central US</SelectItem>
                <SelectItem value='canada'>Canada</SelectItem>
                <SelectItem value='all-regions'>All Regions</SelectItem>
              </SelectContent>
            </Select>

            <div className='flex items-center gap-3'>
              <Checkbox id='show-inactive' />
              <Label
                htmlFor='show-inactive'
                className='cursor-pointer text-sm font-medium'
              >
                Show Inactive Users
              </Label>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-hidden rounded-lg border bg-background shadow-sm'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted'>
                <TableHead className='font-semibold text-foreground'>
                  First Name
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Last Name
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Email
                </TableHead>
                <TableHead className='font-semibold text-foreground'>Role</TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Region
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Date Added
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Date Last Accessed
                </TableHead>
                <TableHead className='font-semibold text-foreground'>
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.email} className='hover:bg-background'>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-3'>
                      {user.pendingRegistration ? (
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-orange-100'>
                          <User className='h-5 w-5 text-orange-600' />
                        </div>
                      ) : (
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                          <User className='h-5 w-5 text-blue-600' />
                        </div>
                      )}
                      <span
                        className={
                          user.pendingRegistration
                            ? 'text-orange-600'
                            : 'text-foreground'
                        }
                      >
                        {user.firstName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className={
                      user.pendingRegistration ? 'text-orange-600' : ''
                    }
                  >
                    {user.lastName}
                  </TableCell>
                  <TableCell className='text-sm'>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.region}</TableCell>
                  <TableCell>{user.dateAdded}</TableCell>
                  <TableCell>{user.lastAccessed || '--'}</TableCell>
                  <TableCell>
                    {user.pendingRegistration ? (
                      <Badge
                        variant='destructive'
                        className='bg-orange-100 text-orange-800 hover:bg-orange-200'
                      >
                        Pending Registration
                      </Badge>
                    ) : (
                      <Badge
                        variant={
                          user.status === 'Active' ? 'default' : 'secondary'
                        }
                      >
                        {user.status}
                      </Badge>
                    )}
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
