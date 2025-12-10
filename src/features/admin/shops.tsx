import { useState, useEffect } from 'react'
import OrganizationApi from '@/js/clients/base/OrganizationApi'
import OrganizationSearchRequest from '@/js/models/OrganizationSearchRequest'
import ResultParameter from '@/js/models/ResultParameter'
import { Search, Download, TableIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Badge } from '@/components/ui/badge'
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

export function Shops() {
  const { user } = useAuthStore((state) => state.auth)
  const [currentPage, setCurrentPage] = useState(1)
  const [smartFilter, setSmartFilter] = useState('')
  const [filterByShopStatus, setFilterByShopStatus] = useState<string>('all')
  const [filterByShopCertification, setFilterByShopCertification] =
    useState<string>('all')
  const [filterByRegionId, setFilterByRegionId] = useState<string>('all')
  const [shops, setShops] = useState<any[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 20
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // 获取店铺数据
  const fetchShops = async () => {
    if (!user) return

    setLoading(true)
    try {
      const api = new OrganizationApi()

      // 构建请求参数
      const requestParams: any = {
        type: 'Shop', // 必须设置为 'Shop' 来搜索店铺
        smartFilter: smartFilter,
        filterByRegionId: filterByRegionId && parseInt(filterByRegionId),
      }

      // 处理状态筛选
      if (filterByShopStatus !== 'all') {
        requestParams.filterByShopStatus = filterByShopStatus
      }

      // 处理认证筛选
      if (filterByShopCertification !== 'all') {
        requestParams.filterByShopCertification = filterByShopCertification
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
          setShops(response.organizations || [])
          setTotalItems(response.totalItemCount || 0)
          setLoading(false)
        },
        error: (error: any) => {
          console.error('获取店铺列表失败:', error)
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

    // 重置到第一页
    setCurrentPage(1)

    // 调用 API（对于文本输入，使用防抖）
    const timeoutId = setTimeout(
      () => {
        fetchShops()
      },
      smartFilter ? 500 : 0
    )

    return () => clearTimeout(timeoutId)
  }, [
    smartFilter,
    filterByShopStatus,
    filterByShopCertification,
    filterByRegionId,
    user,
  ])

  // ✅ 当页码改变时单独调用（不重置页码）
  useEffect(() => {
    if (!user || currentPage === 1) return
    fetchShops()
  }, [currentPage, user])

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

      <div className='px-6 py-6'>
        {/* Search + Filters */}
        <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center'>
          <div className='relative max-w-md flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              value={smartFilter}
              onChange={(e) => setSmartFilter(e.target.value)}
              placeholder='Filter by Name, #, City'
              className='pl-10'
            />
          </div>

          <div className='flex flex-wrap gap-3'>
            <Select
              value={filterByShopStatus}
              onValueChange={(value) => setFilterByShopStatus(value)}
            >
              <SelectTrigger className='bg-muted w-48'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='Certified'>Certified</SelectItem>
                <SelectItem value='Closed'>Closed</SelectItem>
                <SelectItem value='InProcess'>In-Process</SelectItem>
                <SelectItem value='Suspended'>Suspended</SelectItem>
                <SelectItem value='Terminated'>Terminated</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterByShopCertification}
              onValueChange={(value) => setFilterByShopCertification(value)}
            >
              <SelectTrigger className='bg-muted w-48'>
                <SelectValue placeholder='Certification' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Certifications</SelectItem>
                <SelectItem value='AudiUltra'>Audi Ultra</SelectItem>
                <SelectItem value='AudiHybrid'>Audi Hybrid</SelectItem>
                <SelectItem value='VW'>Volkswagen</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterByRegionId}
              onValueChange={(value) => setFilterByRegionId(value)}
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
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className='bg-background overflow-hidden rounded-lg border shadow-sm'>
            <div className='flex items-center justify-center py-12'>
              <div className='text-muted-foreground'>loading...</div>
            </div>
          </div>
        ) : shops.length === 0 ? (
          <div className='bg-background overflow-hidden rounded-lg border shadow-sm'>
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
                  {shops.map((shop: any) => {
                    const dealer = shop.sponsorDealership
                    const dealerName = dealer?.name || '--'
                    const dealerNumber = dealer?.dealershipNumber || '--'
                    const region = shop.region?.name || '--'
                    const statusValue = shop.filterByShopStatus || '--'
                    const certificationValue =
                      shop.filterByShopCertification || '--'

                    return (
                      <TableRow key={shop.id} className='hover:bg-background'>
                        <TableCell className='font-medium text-blue-600'>
                          <span className='cursor-pointer hover:underline'>
                            {shop.name || '--'}
                          </span>
                        </TableCell>
                        <TableCell>{shop.shopNumber || '--'}</TableCell>
                        <TableCell className='text-center font-medium'>
                          {shop.countPendingOrders ?? 0}
                        </TableCell>
                        <TableCell className='text-center'>
                          {shop.countActiveUsers ?? 0}
                        </TableCell>
                        <TableCell className='text-center'>
                          {shop.countPendingUsers ?? 0}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              statusValue === 'certified'
                                ? 'default'
                                : 'secondary'
                            }
                            className={
                              statusValue === 'certified'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : ''
                            }
                          >
                            {statusValue}
                          </Badge>
                        </TableCell>
                        <TableCell>{certificationValue}</TableCell>
                        <TableCell className='text-muted-foreground text-sm'>
                          {shop.address || '--'}
                        </TableCell>
                        <TableCell>{shop.city || '--'}</TableCell>
                        <TableCell>{shop.state || '--'}</TableCell>
                        <TableCell>{dealerName}</TableCell>
                        <TableCell>{dealerNumber}</TableCell>
                        <TableCell>{region}</TableCell>
                      </TableRow>
                    )
                  })}
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
  )
}
