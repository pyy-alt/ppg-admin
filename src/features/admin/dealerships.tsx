import { useState, useEffect } from 'react'
import { Search, Download, TableIcon } from 'lucide-react'
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
import { DataTablePagination } from '@/components/data-table-pagination'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import OrganizationApi from '@/js/clients/base/OrganizationApi'
import OrganizationSearchRequest from '@/js/models/OrganizationSearchRequest'
import ResultParameter from '@/js/models/ResultParameter'
import { useAuthStore } from '@/stores/auth-store'

export function Dealerships() {
  const { user } = useAuthStore((state) => state.auth)
  const [currentPage, setCurrentPage] = useState(1)
  const [smartFilter, setSmartFilter] = useState('')
  const [dealerships, setDealerships] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 20
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // 获取经销商数据
  const fetchDealerships = async () => {
    if (!user) return

    setLoading(true)
    try {
      const api = new OrganizationApi()

      // 构建请求参数
      const requestParams: any = {
        type: 'Dealership', // 必须设置为 'Dealership' 来搜索经销商
        smartFilter: smartFilter || undefined,
      }

      // 添加分页参数
      const resultParameter = ResultParameter.create({
        resultsLimitOffset: (currentPage - 1) * itemsPerPage,
        resultsLimitCount: itemsPerPage,
        resultsOrderBy: 'Name', // 可以根据需要调整排序字段
        resultsOrderAscending: true,
      })
      requestParams.resultParameter = resultParameter

      const request = OrganizationSearchRequest.create(requestParams)

      api.search(
        request,
        {
          status200: (response: any) => {
            setDealerships(response.organizations || [])
            setTotalItems(response.totalItemCount || 0)
            setLoading(false)
          },
          error: (error: any) => {
            console.error('获取经销商列表失败:', error)
            setLoading(false)
          },
          status403: (message: string) => {
            console.error('权限不足:', message)
            setLoading(false)
          },
        }
      )
    } catch (error) {
      console.error('API 调用错误:', error)
      setLoading(false)
    }
  }

  // 当筛选条件改变时，重置页码并调用 API
  useEffect(() => {
    if (!user) return

    // 重置到第一页
    setCurrentPage(1)

    // 调用 API（对于文本输入，使用防抖）
    const timeoutId = setTimeout(
      () => {
        fetchDealerships()
      },
      smartFilter ? 500 : 0
    )

    return () => clearTimeout(timeoutId)
  }, [
    smartFilter,
    user,
  ])

  // 当页码改变时，重新获取数据
  useEffect(() => {
    if (!user) return
    fetchDealerships()
  }, [currentPage])

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='bg-background'>
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
                value={smartFilter}
                onChange={(e) => setSmartFilter(e.target.value)}
                placeholder='Filter by Name, #, City'
                className='border-gray-300 pl-10'
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className='overflow-hidden rounded-lg bg-background shadow-sm'>
              <div className='flex items-center justify-center py-12'>
                <div className='text-muted-foreground'>loading...</div>
              </div>
            </div>
          ) : dealerships.length === 0 ? (
            <div className='overflow-hidden rounded-lg bg-background shadow-sm'>
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
            <>
              <div className='overflow-hidden rounded-lg bg-background shadow-sm'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted'>
                      <TableHead className='font-semibold text-foreground'>
                        Name
                      </TableHead>
                      <TableHead className='font-semibold text-foreground'>
                        Number
                      </TableHead>
                      <TableHead className='font-semibold text-foreground'>
                        # of Pending Orders
                      </TableHead>
                      <TableHead className='font-semibold text-foreground'>
                        City
                      </TableHead>
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
                    {dealerships.map((dealer: any) => (
                      <TableRow key={dealer.id} className='hover:bg-background'>
                        <TableCell className='cursor-pointer font-medium text-blue-600 hover:underline'>
                          {dealer.name || '--'}
                        </TableCell>
                        <TableCell>{dealer.dealershipNumber || '--'}</TableCell>
                        <TableCell className='text-center font-medium'>
                          {dealer.countPendingOrders ?? 0}
                        </TableCell>
                        <TableCell>{dealer.city || '--'}</TableCell>
                        <TableCell>{dealer.state || '--'}</TableCell>
                        <TableCell className='text-center'>
                          {dealer.countActiveUsers ?? 0}
                        </TableCell>
                        <TableCell className='text-center'>
                          {dealer.countPendingUsers ?? 0}
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}