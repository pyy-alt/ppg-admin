import { useState } from 'react'
import PersonApi from '@/js/clients/base/PersonApi'
import Person from '@/js/models/Person'
import PersonSearchRequest from '@/js/models/PersonSearchRequest'
import { PersonSearchRequestType } from '@/js/models/enum/PersonSearchRequestTypeEnum'
import { Search, Plus, TableIcon, Pencil } from 'lucide-react'
import { useDebouncedEffect } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyDescription,
  EmptyTitle,
} from '@/components/ui/empty'
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
import { ClearableInput } from '@/components/clearable-input'
import { DataTablePagination } from '@/components/data-table-pagination'

export function Users() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [users, setUsers] = useState<Person[]>([])
  const [editUser] = useState<Person | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  // 添加状态
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // 筛选条件状态
  const [smartFilter, setSmartFilter] = useState('')
  const [type, setType] = useState<PersonSearchRequestType>('Network')
  const [, setFilterByRegion] = useState('all')
  const [includeInactiveFlag, setIncludeInactiveFlag] = useState(false)

  const getUsers = (
    smartFilter: string = '',
    includeInactiveFlag: boolean = false,
    type: PersonSearchRequestType = 'Network'
    // filterByRegion: string = 'all' // 待后端确认字段
  ) => {
    try {
      const request = PersonSearchRequest.create({
        //Shop, Dealership, Network
        smartFilter,
        includeInactiveFlag,
        type,
      })
      const personApi = new PersonApi() // 创建 PersonApi 实例

      personApi.search(request, {
        status200: (response) => {
          setUsers(response.persons)
          setTotalItems(response.totalItemCount)
        },
        error: (error) => {
          console.error(error)
        },
      })
    } catch (error) {}
  }

  // TODO======
  // const getUserDetails = (id: number) => {
  //   try {
  //   } catch (error) {}
  // }

  // 筛选条件变化：使用防抖
  useDebouncedEffect(
    () => {
      getUsers(smartFilter, includeInactiveFlag, type)
    },
    [smartFilter, includeInactiveFlag, type],
    1000
  )
  return (
    <div className='bg-background text-foreground min-h-screen'>
      {/* Header */}
      <div className='bg-background border-b'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-foreground text-2xl font-bold'>
            Manage Network Users
          </h1>
          <Button onClick={() => setIsAddUserOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Add New User
          </Button>
        </div>
      </div>

      <AddNetworkUserDialog
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        initialValues={editUser}
        onSuccess={(data) => {
          console.log(data)
          getUsers()
        }}
        onError={(error) => {
          console.log(error)
        }}
      />

      <div className='px-6 py-6'>
        {/* Filters */}
        <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center'>
          <div className='relative max-w-md flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <ClearableInput
              placeholder='Filter by First Name, Last Name, Email'
              value={smartFilter}
              onChange={(e) => setSmartFilter(e.target.value)}
              className='pl-10'
            />
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <Select
              defaultValue='Network'
              onValueChange={(value) =>
                setType(value as PersonSearchRequestType)
              }
            >
              <SelectTrigger className='bg-muted w-48'>
                <SelectValue placeholder='Role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Shop'>Shop</SelectItem>
                <SelectItem value='Dealership'>Dealership</SelectItem>
                <SelectItem value='Network'>Network</SelectItem>
              </SelectContent>
            </Select>

            <Select
              defaultValue='all'
              onValueChange={(value) => setFilterByRegion(value)}
            >
              <SelectTrigger className='bg-muted w-48'>
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
              <Checkbox
                id='show-inactive'
                onCheckedChange={(checked) =>
                  setIncludeInactiveFlag(checked as boolean)
                }
              />
              <Label
                htmlFor='show-inactive'
                className='cursor-pointer text-sm font-medium'
              >
                Show Inactive Users
              </Label>
            </div>
          </div>
        </div>
        {users.length === 0 ? (
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
            <div className='bg-background overflow-hidden rounded-lg border shadow-sm'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-muted'>
                    <TableHead className='text-foreground font-semibold'>
                      First Name
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Last Name
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Email
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Role
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Region
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Date Added
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Date Last Accessed
                    </TableHead>
                    <TableHead className='text-foreground font-semibold'>
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.email} className='hover:bg-background'>
                      <TableCell className='font-medium'>
                        <div className='flex items-center gap-1'>
                          <Pencil className='h-4 w-4' />
                          <span
                            className={
                              user.status === 'Pending'
                                ? 'cursor-pointer text-orange-600 hover:underline'
                                : user.status === 'Inactive'
                                  ? 'text-gray-300'
                                  : 'text-foreground cursor-pointer hover:underline'
                            }
                            // onClick={() => getUserDetails(user.id)}
                          >
                            {user.firstName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={
                          user.status === 'Inactive'
                            ? 'text-gray-300'
                            : user.status === 'Pending'
                              ? 'text-orange-600'
                              : ''
                        }
                      >
                        {user.lastName}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {user.status === 'Inactive' ? (
                          <span className='text-gray-300'>{user.email}</span>
                        ) : (
                          user.email
                        )}
                      </TableCell>
                      <TableCell>
                        {user.status === 'Inactive' ? (
                          <span className='text-gray-300'>{user.type}</span>
                        ) : (
                          user.type
                        )}
                      </TableCell>
                      <TableCell>
                        {user.status === 'Inactive' ? (
                          <span className='text-gray-300'>缺少字段region</span>
                        ) : (
                          '缺少字段region'
                        )}
                      </TableCell>
                      <TableCell>
                        {user.status === 'Inactive' ? (
                          <span className='text-gray-300'>
                            {(user.dateCreated &&
                              new Date(
                                user.dateCreated
                              ).toLocaleDateString()) ||
                              '--'}
                          </span>
                        ) : (
                          (user.dateCreated &&
                            new Date(user.dateCreated).toLocaleDateString()) ||
                          '--'
                        )}
                      </TableCell>
                      <TableCell
                        className={
                          user.status === 'Inactive'
                            ? 'text-gray-300'
                            : user.status === 'Pending'
                              ? 'text-orange-600'
                              : ''
                        }
                      >
                        {user.dateLastAccess &&
                          new Date(user.dateLastAccess).toLocaleDateString() || '--'}
                      </TableCell>
                      <TableCell>
                        {user.status === 'Inactive' ? (
                          <span className='text-gray-300'>{user.status}</span>
                        ) : (
                          <span>{user.status}</span>
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
        )}
      </div>
    </div>
  )
}
