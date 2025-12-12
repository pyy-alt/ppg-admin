import { useState, useEffect, useRef } from 'react'
import OrganizationApi from '@/js/clients/base/OrganizationApi'
import OrganizationSearchRequest from '@/js/models/OrganizationSearchRequest'
import ResultParameter from '@/js/models/ResultParameter'
import { Search, Download, TableIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
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
import { exportCurrentPageToCSV } from '@/lib/utils'
import { toast } from 'sonner'

export function Dealerships() {
  const { user } = useAuthStore((state) => state.auth)
  const [currentPage, setCurrentPage] = useState(1)
  const [smartFilter, setSmartFilter] = useState('')
  const [dealerships, setDealerships] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 20
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const dealershipsRef =useRef<HTMLTableElement>(null)
  const [headers, setHeaders] = useState<string[]>([])

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
        resultsOrderAscending: false,
      })
      requestParams.resultParameter = resultParameter

      const request = OrganizationSearchRequest.create(requestParams)

      api.search(request, {
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
      })
    } catch (error) {
      console.error('API 调用错误:', error)
      setLoading(false)
    }
  }

  // 当筛选条件改变时，重置页码并调用 API
  useEffect(() => {
    if (!user) return

    const timeoutId = setTimeout(
      () => {
        fetchDealerships()
      },
      smartFilter ? 500 : 0
    )

    return () => clearTimeout(timeoutId)
  }, [smartFilter,currentPage, user])

  const getFlattenedCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const pageData = dealerships.slice(startIndex, endIndex)

    return pageData.map((order: any) => {
      return {
        Name: order.name,
        Number: order.dealershipNumber,
        '# of Pending Orders': order.countPendingUsers || 0,
        City: order.city || '--',
        State: order.state || '--',
        '# of Active Users': order.countActiveUsers || 0,
        '# of Pending Users': order.countPendingUsers || 0,
      }
    })
  }
  const exportCSV = async () => {
    try {
      const flattenedData = getFlattenedCurrentPageData()
      const result = await exportCurrentPageToCSV(flattenedData, headers,'Manage_Dealers')
      result ? toast.success('Exported successfully') : null
    } catch (error) {
      toast.error('Export failed')
    }
  }

  useEffect(() => {
    // 确保组件已挂载且 ref 已连接到 DOM
    if (dealershipsRef.current) {
      // 2. 使用原生 DOM API 查找所有 <th> 元素
      const thElements = dealershipsRef.current.querySelectorAll('thead th')

      // 3. 提取文本内容
      const headerTexts = Array.from(thElements).map((th) =>
        th.textContent.trim()
      )
      setHeaders(headerTexts)
    }
  }, [dealerships])
 

  return (
    <div className='bg-background min-h-screen'>
      {/* Header */}
      <div className='bg-background'>
        <div className='flex items-center justify-between px-6 py-4'>
          <h1 className='text-foreground text-2xl font-bold'>Manage Dealers</h1>
          <Button onClick={exportCSV}>
            <Download className='mr-2 h-4 w-4' />
            Report
          </Button>
        </div>

        <div className='px-6 py-6'>
          {/* Search */}
          <div className='mb-6 max-w-md'>
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
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
            <div className='bg-background overflow-hidden rounded-lg shadow-sm'>
              <div className='flex items-center justify-center py-12'>
                <div className='text-muted-foreground'>loading...</div>
              </div>
            </div>
          ) : dealerships.length === 0 ? (
            <div className='bg-background overflow-hidden rounded-lg shadow-sm'>
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
              <div className='bg-background overflow-hidden rounded-lg shadow-sm'>
                <Table ref={dealershipsRef}>
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
                        City
                      </TableHead>
                      <TableHead className='text-foreground font-semibold'>
                        State
                      </TableHead>
                      <TableHead className='text-foreground font-semibold'>
                        # of Active Users
                      </TableHead>
                      <TableHead className='text-foreground font-semibold'>
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
