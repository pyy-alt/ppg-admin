import { useState, useEffect, useRef } from 'react';
import OrganizationApi from '@/js/clients/base/OrganizationApi';
import PersonApi from '@/js/clients/base/PersonApi';
import OrganizationSearchRequest from '@/js/models/OrganizationSearchRequest';
import PersonSearchRequest from '@/js/models/PersonSearchRequest';
import ResultParameter from '@/js/models/ResultParameter';
import { Search, Download, TableIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { exportCurrentPageToCSV } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/data-table-pagination';
import ViewTeamDialog from '@/components/ViewTeamDialog';
import { ClearableInput } from '@/components/clearable-input';
import { SortableTableHead } from '@/components/SortableTableHead';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

export function Shops() {
  const { t } = useTranslation();
  const { user } = useAuthStore((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [smartFilter, setSmartFilter] = useState('');
  const [filterByShopStatus, setFilterByShopStatus] =
    useState<string>('Certified');
  const [filterByRegionId, setFilterByRegionId] = useState<string>('all');
  const [shops, setShops] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [headers, setHeaders] = useState<string[]>([]);
  const shopsOrderRef = useRef<HTMLTableElement>(null);

  const [isShowAdminTeam, setIsShowAdminTeam] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamSortBy, setTeamSortBy] = useState<string>('firstName');
  const [teamSortAscending, setTeamSortAscending] = useState(true);
  const [currentTeamParams, setCurrentTeamParams] = useState<{
    userType: 'Shop' | 'Dealership';
    organizationId: number | undefined;
    useActive: string | undefined;
  } | null>(null);

  const [sortBy, setSortBy] = useState<
    | 'name'
    | 'shopNumber'
    | 'countActiveUsers'
    | 'countPendingUsers'
    | 'countPendingOrders'
    | 'region'
    | string
  >('name');

  const [sortAscending, setSortAscending] = useState(true); // true 为升序（A-Z）

  const navigate = useNavigate();

  const getTeamMembers = async (
    userType: 'Shop' | 'Dealership',
    organizationId: number | undefined,
    useActive: string | undefined = undefined,
    sortBy: string = 'firstName',
    sortAscending: boolean = true
  ) => {
    try {
      // 保存当前查询参数，供排序时使用
      setCurrentTeamParams({ userType, organizationId, useActive });

      const personApi = new PersonApi();
      const request: any = PersonSearchRequest.create({
        type: userType,
        organizationId,
        includeInactiveFlag: true,
      });
      const resultParameter = ResultParameter.create({
        resultsOrderBy: sortBy,
        resultsOrderAscending: sortAscending,
      });
      request.resultParameter = resultParameter;

      personApi.search(request, {
        status200: (data) => {
          if (useActive === 'Active') {
            const users = data.persons.filter(
              (item: any) => item.status === 'Active'
            );
            setTeamMembers(users);
          } else if (useActive === 'Pending') {
            const users = data.persons.filter(
              (item: any) =>
                item.status === 'Pending' ||
                item.status === 'RegistrationRequested'
            );
            setTeamMembers(users);
          } else {
            setTeamMembers(data.persons);
          }
          setIsShowAdminTeam(true);
        },
        error: (error) => {
          console.error('Person search error:', error);
        },
        else: (statusCode, message) => {
          console.error('Unhandled search response:', statusCode, message);
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 处理团队成员操作成功后的回调
  const handleTeamMembersSuccess = (
    _userType?: 'Shop' | 'Dealership',
    _organizationId?: number
  ) => {
    // 刷新团队成员列表
    if (currentTeamParams) {
      getTeamMembers(
        currentTeamParams.userType,
        currentTeamParams.organizationId,
        currentTeamParams.useActive,
        teamSortBy,
        teamSortAscending
      );
    }
    // 刷新主表格数据以更新 countActiveUsers 和 countPendingUsers
    fetchShops();
  };

  // Get store data
  const fetchShops = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const api = new OrganizationApi();

      // Build request parameters
      const requestParams: any = {
        type: 'Shop', // Must be set to 'Shop' to search for stores
        smartFilter: smartFilter,
        filterByRegionId: filterByRegionId && parseInt(filterByRegionId),
      };

      // Handle status filtering
      if (filterByShopStatus !== 'all') {
        requestParams.filterByShopStatus = filterByShopStatus;
      }

      // Add pagination parameters
      const resultParameter = ResultParameter.create({
        resultsLimitOffset: (currentPage - 1) * itemsPerPage,
        resultsLimitCount: itemsPerPage,
        resultsOrderBy: sortBy,
        resultsOrderAscending: sortAscending,
      });
      requestParams.resultParameter = resultParameter;

      const request = OrganizationSearchRequest.create(requestParams);

      api.search(request, {
        status200: (response: any) => {
          setShops(response.organizations || []);
          setTotalItems(response.totalItemCount || 0);
          setLoading(false);
        },
        error: (error: any) => {
          console.error('Failed to retrieve store list:', error);
          setLoading(false);
        },
        status403: (message: string) => {
          console.error('Insufficient permissions:', message);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('API Call error:', error);
      setLoading(false);
    }
  };

  // When filter conditions change，Reset page number and call API
  useEffect(() => {
    if (!user) return;

    // Reset to the first page
    setCurrentPage(1);

    // Call API（For text input，Use debounce）
    const timeoutId = setTimeout(
      () => {
        fetchShops();
      },
      smartFilter ? 500 : 0
    );

    return () => clearTimeout(timeoutId);
  }, [
    smartFilter,
    filterByShopStatus,
    filterByRegionId,
    user,
    sortBy,
    sortAscending,
  ]);

  // ✅ Individually call when page number changes（Do not reset page number）
  useEffect(() => {
    if (!user || currentPage === 1) return;
    fetchShops();
  }, [currentPage, user]);

  // 获取所有数据用于导出（不分页）
  const fetchAllDataForExport = async (): Promise<any[]> => {
    if (!user) return [];

    try {
      const api = new OrganizationApi();

      // 构建请求参数（与 fetchShops 相同，但不分页）
      const requestParams: any = {
        type: 'Shop',
        smartFilter: smartFilter,
        filterByRegionId: filterByRegionId && parseInt(filterByRegionId),
      };

      if (filterByShopStatus !== 'all') {
        requestParams.filterByShopStatus = filterByShopStatus;
      }

      // 不分页，获取所有数据
      const resultParameter = ResultParameter.create({
        resultsLimitOffset: 0,
        resultsLimitCount: 999999,
        resultsOrderBy: sortBy,
        resultsOrderAscending: sortAscending,
      });
      requestParams.resultParameter = resultParameter;

      const request = OrganizationSearchRequest.create(requestParams);

      return new Promise((resolve, reject) => {
        api.search(request, {
          status200: (response: any) => {
            resolve(response.organizations || []);
          },
          error: (error: any) => {
            reject(error);
          },
          status403: () => {
            resolve([]);
          },
        });
      });
    } catch (error) {
      console.error('获取导出数据失败:', error);
      return [];
    }
  };

  // 格式化数据用于导出
  const getFlattenedAllData = (allShops: any[]) => {
    return allShops.map((order: any) => {
      return {
        Name: order.name,
        Number: order.shopNumber,
        '# of Pending Orders': order.countPendingUsers || 0,
        '# of Active Users': order.countActiveUsers || 0,
        '# of Pending Users': order.countPendingUsers || 0,
        Status: order.status || '--',
        Certification: order.certification || '--',
        address: order.address || '--',
        City: order.city || '--',
        State: order.state || '--',
        Dealer: order.sponsorDealership.name || '--',
        'Dealer #': order.sponsorDealership.dealershipNumber || '--',
        Region: order.region.name || '--',
      };
    });
  };

  const exportCSV = async () => {
    try {
      toast.loading(t('common.messages.exportLoading'));
      const allShops = await fetchAllDataForExport();
      const flattenedData = getFlattenedAllData(allShops);
      const result = await exportCurrentPageToCSV(
        flattenedData,
        headers,
        'Manage_Shops'
      );
      toast.dismiss();
      result ? toast.success(t('common.messages.exportSuccess')) : null;
    } catch (error) {
      toast.dismiss();
      toast.error(t('common.messages.exportFailed'));
    }
  };
  const handleSort = (field: string) => {
    if (sortBy === field) {
      if (sortAscending) {
        // 当前是升序 → 第三次点击：切换为降序
        setSortAscending(false);
      } else {
        // 当前是降序 → 第三次点击：恢复默认排序
        setSortBy('name'); // 默认字段
        setSortAscending(true); // 默认升序 A-Z
      }
    } else {
      // 点击新字段 → 第一次点击：按该字段升序排序
      setSortBy(field);
      setSortAscending(true); // 默认从升序开始（A-Z）
    }
    setCurrentPage(1); // 排序变化时重置到第一页
  };

  useEffect(() => {
    // Ensure the component is mounted and ref is connected to DOM
    if (shopsOrderRef.current) {
      // 2. Use native DOM API Find all <th> elements
      const thElements = shopsOrderRef.current.querySelectorAll('thead th');

      // 3. Extract text content
      const headerTexts = Array.from(thElements)
        .map((th) => th?.textContent?.trim() || '')
        .filter((text) => text !== '');
      setHeaders(headerTexts);
    }
  }, [shops]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">
            {t('shop.list.title')}
          </h1>
          <Button onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            {t('shop.list.report')}
          </Button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Search + Filters */}
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute w-4 h-4 -translate-y-1/2 text-muted-foreground top-1/2 left-3" />
            <ClearableInput
              value={smartFilter}
              onChange={(e) => setSmartFilter(e.target.value)}
              placeholder={t('shop.list.searchPlaceholder')}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Select
              value={filterByShopStatus}
              onValueChange={(value) => setFilterByShopStatus(value)}
            >
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder={t('shop.list.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('shop.list.status.all')}</SelectItem>
                <SelectItem value="Certified">
                  {t('shop.list.status.certified')}
                </SelectItem>
                <SelectItem value="Closed">
                  {t('shop.list.status.closed')}
                </SelectItem>
                <SelectItem value="InProcess">
                  {t('shop.list.status.inProcess')}
                </SelectItem>
                <SelectItem value="Suspended">
                  {t('shop.list.status.suspended')}
                </SelectItem>
                <SelectItem value="Terminated">
                  {t('shop.list.status.terminated')}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterByRegionId}
              onValueChange={(value) => setFilterByRegionId(value)}
            >
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder={t('shop.list.regionPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('shop.list.region.all')}</SelectItem>
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
          <div className="overflow-hidden border rounded-lg shadow-sm bg-background">
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">{t('common.loading')}</div>
            </div>
          </div>
        ) : shops.length === 0 ? (
          <div className="overflow-hidden border rounded-lg shadow-sm bg-background">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TableIcon className="w-4 h-4" />
                </EmptyMedia>
                <EmptyTitle>{t('common.empty.title')}</EmptyTitle>
                <EmptyDescription>
                  {t('common.empty.description')}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <>
            <div className="overflow-hidden border rounded-lg shadow-sm bg-background">
              <Table ref={shopsOrderRef}>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <SortableTableHead
                      field="name"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      {t('shop.list.tableHeaders.name')}
                    </SortableTableHead>
                    <SortableTableHead
                      field="Number"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      {t('shop.list.tableHeaders.number')}
                    </SortableTableHead>
                    <SortableTableHead
                      field="CountPendingOrders"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      {t('shop.list.tableHeaders.pendingOrders')}
                    </SortableTableHead>
                  
                    <TableHead className="font-semibold text-foreground">
                      {t('shop.list.tableHeaders.activeUsers')}
                    </TableHead>

                    <TableHead className="font-semibold text-foreground">
                      {t('shop.list.tableHeaders.pendingUsers')}
                    </TableHead>
                    <SortableTableHead
                      field="status"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      {t('shop.list.tableHeaders.status')}
                    </SortableTableHead>
                    <TableHead className="font-semibold text-foreground">
                      {t('shop.list.tableHeaders.address')}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {t('shop.list.tableHeaders.city')}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {t('shop.list.tableHeaders.state')}
                    </TableHead>
                    <SortableTableHead
                      field="DealershipName"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      {t('shop.list.tableHeaders.dealer')}
                    </SortableTableHead>
                    <TableHead className="font-semibold text-foreground">
                      Dealer #
                    </TableHead>
                    <SortableTableHead
                      field="Region"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      Region
                    </SortableTableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shops.map((shop: any) => {
                    const dealer = shop.sponsorDealership;
                    const dealerName = dealer?.name || '--';
                    const dealerNumber = dealer?.dealershipNumber || '--';
                    const region = shop.region?.name || '--';
                    const statusValue = shop.status || '--';

                    return (
                      <TableRow key={shop.id} className="hover:bg-background">
                        <TableCell className="font-medium text-blue-600">
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => {
                              navigate({
                                to: '/repair_orders',
                                search: { id: shop.id },
                              });
                            }}
                          >
                            {shop.name || '--'}
                          </span>
                        </TableCell>
                        <TableCell>{shop.shopNumber || '--'}</TableCell>
                        <TableCell
                          className="font-medium text-center"
                          // onClick={() => {
                          //   navigate({
                          //     to: '/repair_orders',
                          //     search: { id: shop.id.toString() },
                          //   });
                          // }}
                        >
                          {shop.countPendingOrders ?? 0}
                        </TableCell>
                        <TableCell
                          className="text-center text-blue-600 underline hover:cursor-pointer"
                          onClick={() => {
                            getTeamMembers('Shop', shop.id, 'Active');
                          }}
                        >
                          {shop.countActiveUsers ?? 0}
                        </TableCell>
                        <TableCell
                          className="text-center text-blue-600 underline hover:cursor-pointer"
                          onClick={() => {
                            getTeamMembers('Shop', shop.id, 'Pending');
                          }}
                        >
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
                        <TableCell className="text-sm text-muted-foreground">
                          {shop.address || '--'}
                        </TableCell>
                        <TableCell>{shop.city || '--'}</TableCell>
                        <TableCell>{shop.state || '--'}</TableCell>
                        <TableCell>{dealerName}</TableCell>
                        <TableCell>{dealerNumber}</TableCell>
                        <TableCell>{region}</TableCell>
                      </TableRow>
                    );
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
      <ViewTeamDialog
        teamMembers={teamMembers}
        open={isShowAdminTeam}
        onOpenChange={setIsShowAdminTeam}
        onSuccess={handleTeamMembersSuccess}
        currentSortBy={teamSortBy}
        currentSortAscending={teamSortAscending}
        onSortChange={(newSortBy, newSortAscending) => {
          setTeamSortBy(newSortBy);
          setTeamSortAscending(newSortAscending);
          // 重新调用 API 获取排序后的数据
          if (currentTeamParams) {
            getTeamMembers(
              currentTeamParams.userType,
              currentTeamParams.organizationId,
              currentTeamParams.useActive,
              newSortBy,
              newSortAscending
            );
          }
        }}
      />
    </div>
  );
}
