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
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ViewTeamDialog, { TeamMember } from '@/components/ViewTeamDialog';
import { DataTablePagination } from '@/components/data-table-pagination';
import { ClearableInput } from '@/components/clearable-input';
import { SortableTableHead } from '@/components/SortableTableHead';
import { useTranslation } from 'react-i18next';

export function Dealerships() {
  const { t } = useTranslation();
  const { user } = useAuthStore((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [smartFilter, setSmartFilter] = useState('');
  const [dealerships, setDealerships] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const dealershipsRef = useRef<HTMLTableElement>(null);
  const [headers, setHeaders] = useState<string[]>([]);

  const [isShowAdminTeam, setIsShowAdminTeam] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [sortBy, setSortBy] = useState<
    'name' | 'dealershipNumber' | 'countActiveUsers' | 'countPendingUsers' | 'countPendingOrders' | string
  >('dateLastSubmitted');
  const [sortAscending, setSortAscending] = useState(false); // false 为降序（最新在前）

  const getTeamMembers = async (
    userType: 'Shop' | 'Dealership' | 'Network',
    organizationId: number | undefined,
    useActive: string | undefined = undefined
  ) => {
    try {
      const personApi = new PersonApi();
      const request: any = PersonSearchRequest.create({
        type: userType,
        organizationId,
      });
      const resultParameter = ResultParameter.create({
        resultsOrderBy: 'firstName',
        resultsOrderAscending: false,
      });
      request.resultParameter = resultParameter;

      personApi.search(request, {
        status200: (data) => {
          if (useActive === 'Active') {
            const users = data.persons.filter((item: any) => item.status === 'Active');
            setTeamMembers(users);
          } else if (useActive === 'Pending') {
            const users = data.persons.filter((item: any) => item.status === 'Pending' || item.status ==='RegistrationRequested');
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

  // Get dealer data
  const fetchDealerships = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const api = new OrganizationApi();

      // Build request parameters
      const requestParams: any = {
        type: 'Dealership', // Must be set to 'Dealership' to search for dealers
        smartFilter: smartFilter || undefined,
      };

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
          setDealerships(response.organizations || []);
          setTotalItems(response.totalItemCount || 0);
          setLoading(false);
        },
        error: (error: any) => {
          console.error('Failed to retrieve the dealer list:', error);
          setLoading(false);
        },
        status403: (message: string) => {
          console.error('Insufficient permissions:', message);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('API Invocation error:', error);
      setLoading(false);
    }
  };
  const handleSort = (field: string) => {
    if (sortBy === field) {
      if (sortAscending) {
        // 当前是升序 → 第三次点击：恢复默认排序
        setSortBy('dateLastSubmitted'); // 默认字段
        setSortAscending(false); // 默认降序
      } else {
        // 当前是降序 → 第二次点击：切换为升序
        setSortAscending(true);
      }
    } else {
      // 点击新字段 → 第一次点击：按该字段降序排序
      setSortBy(field);
      setSortAscending(false); // 默认从降序开始（最新在前）
    }
    setCurrentPage(1); // 排序变化时重置到第一页
  };

  // When filter conditions change，Reset page number and call API
  useEffect(() => {
    if (!user) return;

    const timeoutId = setTimeout(
      () => {
        fetchDealerships();
      },
      smartFilter ? 500 : 0
    );

    return () => clearTimeout(timeoutId);
  }, [smartFilter, currentPage, user, sortBy, sortAscending]);

  useEffect(() => {
    setCurrentPage(1);
  }, [smartFilter]);

  // 获取所有数据用于导出（不分页）
  const fetchAllDataForExport = async (): Promise<any[]> => {
    if (!user) return [];

    try {
      const api = new OrganizationApi();

      // 构建请求参数（与 fetchDealerships 相同，但不分页）
      const requestParams: any = {
        type: 'Dealership',
        smartFilter: smartFilter || undefined,
      };

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
  const getFlattenedAllData = (allDealerships: any[]) => {
    return allDealerships.map((order: any) => {
      return {
        Name: order.name,
        Number: order.dealershipNumber,
        '# of Pending Orders': order.countPendingUsers || 0,
        City: order.city || '--',
        State: order.state || '--',
        '# of Active Users': order.countActiveUsers || 0,
        '# of Pending Users': order.countPendingUsers || 0,
      };
    });
  };

  const exportCSV = async () => {
    try {
      toast.loading(t('common.messages.exportLoading'));
      const allDealerships = await fetchAllDataForExport();
      const flattenedData = getFlattenedAllData(allDealerships);
      const result = await exportCurrentPageToCSV(flattenedData, headers, 'Manage_Dealers');
      toast.dismiss();
      result ? toast.success(t('common.messages.exportSuccess')) : null;
    } catch (error) {
      toast.dismiss();
      toast.error(t('common.messages.exportFailed'));
    }
  };

  useEffect(() => {
    // Ensure the component is mounted and ref is connected to DOM
    if (dealershipsRef.current) {
      // 2. Use native DOM API Find all <th> elements
      const thElements = dealershipsRef.current.querySelectorAll('thead th');

      // 3. Extract text content
      const headerTexts = Array.from(thElements)
        .map((th) => th?.textContent?.trim() || '')
        .filter((text) => text !== '');
      setHeaders(headerTexts);
    }
  }, [dealerships]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">{t('dealership.list.title')}</h1>
          <Button onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            {t('dealership.list.report')}
          </Button>
        </div>

        <div className="px-6 py-6">
          {/* Search */}
          <div className="max-w-md mb-6">
            <div className="relative">
              <Search className="absolute w-4 h-4 -translate-y-1/2 text-muted-foreground top-1/2 left-3" />
              <ClearableInput
                value={smartFilter}
                onChange={(e) => setSmartFilter(e.target.value)}
                placeholder={t('dealership.list.searchPlaceholder')}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="overflow-hidden rounded-lg shadow-sm bg-background">
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">{t('common.loading')}</div>
              </div>
            </div>
          ) : dealerships.length === 0 ? (
            <div className="overflow-hidden rounded-lg shadow-sm bg-background">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <TableIcon className="w-4 h-4" />
                  </EmptyMedia>
                  <EmptyTitle>{t('common.empty.title')}</EmptyTitle>
                  <EmptyDescription>{t('common.empty.description')}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg shadow-sm bg-background">
                <Table ref={dealershipsRef}>
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <SortableTableHead
                        field="name"
                        currentSortBy={sortBy}
                        currentAscending={sortAscending}
                        onSort={handleSort}
                      >
                        {t('dealership.list.tableHeaders.name')}
                      </SortableTableHead>
                      <SortableTableHead
                        field="dealershipNumber"
                        currentSortBy={sortBy}
                        currentAscending={sortAscending}
                        onSort={handleSort}
                      >
                        {t('dealership.list.tableHeaders.number')}
                      </SortableTableHead>
                      <SortableTableHead
                        field="countPendingOrders"
                        currentSortBy={sortBy}
                        currentAscending={sortAscending}
                        onSort={handleSort}
                      >
                        {t('dealership.list.tableHeaders.pendingOrders')}
                      </SortableTableHead>
                      <TableHead>{t('dealership.list.tableHeaders.city')}</TableHead>
                      <TableHead>{t('dealership.list.tableHeaders.state')}</TableHead>
                      <SortableTableHead
                        field="countActiveUsers"
                        currentSortBy={sortBy}
                        currentAscending={sortAscending}
                        onSort={handleSort}
                      >
                        {t('dealership.list.tableHeaders.activeUsers')}
                      </SortableTableHead>
                      <SortableTableHead
                        field="countPendingUsers"
                        currentSortBy={sortBy}
                        currentAscending={sortAscending}
                        onSort={handleSort}
                      >
                        {t('dealership.list.tableHeaders.pendingUsers')}
                      </SortableTableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealerships.map((dealer: any) => (
                      <TableRow key={dealer.id} className="hover:bg-background">
                        <TableCell
                          className="font-medium text-blue-600 cursor-pointer hover:cursor-pointer hover:underline"
                          // onClick={() => {
                          // 	navigate({
                          // 		to: '/parts_orders',
                          // 	})
                          // }}
                        >
                          {dealer.name || '--'}
                        </TableCell>
                        <TableCell>{dealer.dealershipNumber || '--'}</TableCell>
                        <TableCell
                          className="font-medium text-center text-blue-600 underline hover:cursor-pointer"
                          // onClick={() => {
                          // 	navigate({
                          // 		to: '/repair_orders',
                          // 		search: { id: dealer.id.toString() },
                          // 	})
                          // }}
                        >
                          {dealer.countPendingOrders ?? 0}
                        </TableCell>
                        <TableCell>{dealer.city || '--'}</TableCell>
                        <TableCell>{dealer.state || '--'}</TableCell>
                        <TableCell
                          className="text-center text-blue-600 underline hover:cursor-pointer"
                          onClick={() => {
                            getTeamMembers('Dealership', dealer.id, 'Active');
                          }}
                        >
                          {dealer.countActiveUsers ?? 0}
                        </TableCell>
                        <TableCell
                          className="text-center text-blue-600 underline hover:cursor-pointer"
                          onClick={() => {
                            getTeamMembers('Dealership', dealer.id, 'Pending');
                          }}
                        >
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
      <ViewTeamDialog
        teamMembers={teamMembers}
        open={isShowAdminTeam}
        onOpenChange={setIsShowAdminTeam}
        onSuccess={getTeamMembers}
      />
    </div>
  );
}
