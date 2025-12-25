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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/data-table-pagination';
import ViewTeamDialog, { TeamMember } from '@/components/ViewTeamDialog';
import { ClearableInput } from '@/components/clearable-input';
import { SortableTableHead } from '@/components/SortableTableHead';
import { useTranslation } from 'react-i18next';

export function Shops() {
  const { t } = useTranslation();
  const { user } = useAuthStore((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [smartFilter, setSmartFilter] = useState('');
  const [filterByShopStatus, setFilterByShopStatus] = useState<string>('Certified');
  const [filterByShopCertification, setFilterByShopCertification] = useState<string>('all');
  const [filterByRegionId, setFilterByRegionId] = useState<string>('all');
  const [shops, setShops] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [headers, setHeaders] = useState<string[]>([]);
  const shopsOrderRef = useRef<HTMLTableElement>(null);

  const [isShowAdminTeam, setIsShowAdminTeam] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const [sortBy, setSortBy] = useState('');

  const [sortAscending, setSortAscending] = useState(false); // false 为降序（最新在前）

  const getTeamMembers = async (
    userType: 'Shop' | 'Dealership',
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

      // Handle certification filtering
      if (filterByShopCertification !== 'all') {
        requestParams.filterByShopCertification = filterByShopCertification;
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
  }, [smartFilter, filterByShopStatus, filterByShopCertification, filterByRegionId, user, sortBy, sortAscending]);

  // ✅ Individually call when page number changes（Do not reset page number）
  useEffect(() => {
    if (!user || currentPage === 1) return;
    fetchShops();
  }, [currentPage, user]);

  const getFlattenedCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = shops.slice(startIndex, endIndex);

    return pageData.map((order: any) => {
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
      const flattenedData = getFlattenedCurrentPageData();
      const result = await exportCurrentPageToCSV(flattenedData, headers, 'Manage_Shops');
      result ? toast.success(t('common.messages.exportSuccess')) : null;
    } catch (error) {
      toast.error(t('common.messages.exportFailed'));
    }
  };
  const handleSort = (field: string) => {
    if (sortBy === field) {
      if (sortAscending) {
        // 当前是升序 → 第三次点击：恢复默认排序
        setSortBy(''); // 默认字段
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
          <h1 className="text-2xl font-bold text-foreground">{t('shop.list.title')}</h1>
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
            <Select value={filterByShopStatus} onValueChange={(value) => setFilterByShopStatus(value)}>
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder={t('shop.list.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('shop.list.status.all')}</SelectItem>
                <SelectItem value="Certified">{t('shop.list.status.certified')}</SelectItem>
                <SelectItem value="Closed">{t('shop.list.status.closed')}</SelectItem>
                <SelectItem value="InProcess">{t('shop.list.status.inProcess')}</SelectItem>
                <SelectItem value="Suspended">{t('shop.list.status.suspended')}</SelectItem>
                <SelectItem value="Terminated">{t('shop.list.status.terminated')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterByShopCertification} onValueChange={(value) => setFilterByShopCertification(value)}>
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder={t('shop.list.certificationPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('shop.list.certification.all')}</SelectItem>
                <SelectItem value="AudiHybrid">{t('shop.list.certification.audiHybrid')}</SelectItem>
                <SelectItem value="AudiUltra">{t('shop.list.certification.audiUltra')}</SelectItem>
                <SelectItem value="VW">{t('shop.list.certification.vw')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterByRegionId} onValueChange={(value) => setFilterByRegionId(value)}>
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder={t('shop.list.regionPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('shop.list.region.all')}</SelectItem>
                {user?.regions?.map((region) => (
                  <SelectItem key={region.id} value={region.id?.toString() || ''}>
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
                <EmptyDescription>{t('common.empty.description')}</EmptyDescription>
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
                      Name
                    </SortableTableHead>
                    <SortableTableHead
                      field="shopNumber"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      Number
                    </SortableTableHead>
                    <SortableTableHead
                      field="countPendingOrders"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      # of Pending Orders
                    </SortableTableHead>
                    <SortableTableHead
                      field="countActiveUsers"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      # of Active Users
                    </SortableTableHead>
                    <SortableTableHead
                      field="countPendingUsers"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      # of Pending Users
                    </SortableTableHead>
                    <SortableTableHead
                      field="status"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      Status
                    </SortableTableHead>
                    <TableHead className="font-semibold text-foreground">Certification</TableHead>
                    <TableHead className="font-semibold text-foreground">Address</TableHead>
                    <TableHead className="font-semibold text-foreground">City</TableHead>
                    <TableHead className="font-semibold text-foreground">State</TableHead>
                    <SortableTableHead
                      field="dealer"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      Dealer
                    </SortableTableHead>
                    <SortableTableHead
                      field="sponsorDealership.name"
                      currentSortBy={sortBy}
                      currentAscending={sortAscending}
                      onSort={handleSort}
                    >
                      Dealer #
                    </SortableTableHead>
                    <SortableTableHead
                      field="region.name"
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
                    const statusValue = shop.filterByShopStatus || '--';
                    const certificationValue = shop.filterByShopCertification || '--';

                    return (
                      <TableRow key={shop.id} className="hover:bg-background">
                        <TableCell className="font-medium text-blue-600">
                          <span
                            className="cursor-pointer hover:underline"
                            // onClick={() => {
                            //   navigate({
                            //     to: '/repair_orders',
                            //     search: { id: shop.id },
                            //   });
                            // }}
                          >
                            {shop.name || '--'}
                          </span>
                        </TableCell>
                        <TableCell>{shop.shopNumber || '--'}</TableCell>
                        <TableCell
                          className="font-medium text-center text-blue-600 underline"
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
                            variant={statusValue === 'certified' ? 'default' : 'secondary'}
                            className={
                              statusValue === 'certified' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''
                            }
                          >
                            {statusValue}
                          </Badge>
                        </TableCell>
                        <TableCell>{certificationValue}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{shop.address || '--'}</TableCell>
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
        onSuccess={getTeamMembers}
      />
    </div>
  );
}
