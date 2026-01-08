import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import OrderApi from '@/js/clients/base/OrderApi';
import PartsOrderSearchRequest from '@/js/models/PartsOrderSearchRequest';
import ResultParameter from '@/js/models/ResultParameter';
import { Search, Download, AlertCircle, TableIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { calculateDateRange, exportCurrentPageToCSV, formatDateOnly } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DateRangePicker } from '@/components/DateRangePicker';
import { DataTablePagination } from '@/components/data-table-pagination';
import { ClearableInput } from '@/components/clearable-input';
import { SortableTableHead } from '@/components/SortableTableHead';
import { Trans, useTranslation } from 'react-i18next';
export function PartOrders() {
  const { user } = useAuthStore((state) => state.auth);
  const [filterByWaitingOnMe, setOnlyMyOrders] = useState<boolean>(false);
  const [dateSubmittedFrom, setFromDate] = useState<Date | undefined>(undefined);
  const [dateSubmittedTo, setToDate] = useState<Date | undefined>(undefined);
  const [dateSubmittedRange, setDateSubmittedRange] = useState<string>('all');
  const [filterByPartsOrderNumber, setTypeOfOrder] = useState<string>('all');
  const [filterByStatus, setFilterByStatus] = useState<string>('all');
  const [filterByRegionId, setCsrRegion] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [smartFilter, setSmartFilter] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [sortBy, setSortBy] = useState('');
  const [sortAscending, setSortAscending] = useState(false); // false 为降序（最新在前）

  const navigate = useNavigate();

  const [range, setRange] = useState<DateRange>();

  const partsOrderRef = useRef<HTMLTableElement>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const { t } = useTranslation();

  // 获取所有数据用于导出（不分页）
  const fetchAllDataForExport = async (): Promise<any[]> => {
    if (!user) return [];

    try {
      const api = new OrderApi();

      const dateFrom = dateSubmittedFrom ? formatDateOnly(dateSubmittedFrom) : undefined;
      const dateTo = dateSubmittedTo ? formatDateOnly(dateSubmittedTo) : undefined;

      // 构建请求参数（与 fetchPartsOrders 相同，但不分页）
      const requestParams: any = {
        smartFilter,
        filterByWaitingOnMe,
        filterByDealershipId: user?.person?.type === 'Dealership' ? user?.person?.dealership.id : undefined,
      };

      if (filterByPartsOrderNumber !== 'all') {
        requestParams.filterByPartsOrderNumber = parseInt(filterByPartsOrderNumber);
      }

      if (filterByStatus !== 'all') {
        requestParams.filterByStatus = filterByStatus;
      }
      
      if (filterByRegionId !== 'all') {
        requestParams.filterByRegionId = parseInt(filterByRegionId);
      }

      // 不分页，获取所有数据
      const resultParameter = ResultParameter.create({
        resultsLimitOffset: 0,
        resultsLimitCount: 999999,
        resultsOrderBy: sortBy || 'dateCreated',
        resultsOrderAscending: sortAscending,
      });
      requestParams.resultParameter = resultParameter;

      const request = PartsOrderSearchRequest.create(requestParams);
      
      if (dateFrom) {
        (request as any).dateSubmittedFrom = dateFrom;
      }
      if (dateTo) {
        (request as any).dateSubmittedTo = dateTo;
      }

      return new Promise((resolve, reject) => {
        api.partsOrderSearch(request, {
          status200: (response: any) => {
            resolve(response.partOrders || []);
          },
          error: (error: any) => {
            reject(error);
          },
          else: () => {
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
  const getFlattenedAllData = (allOrders: any[]) => {
    return allOrders.map((order: any) => {
      const ro = order.repairOrder || {};
      const shop = ro.shop || {};
      const dealer = ro.dealership || {};

      return {
        'RO#': ro.roNumber || '--',
        'Sales#': order.salesOrderNumber || '--',
        Type: getOrderTypeText(order.partsOrderNumber || 0),
        VIN: ro.vin || '--',
        'Year/Make/Model': [ro.year, ro.make, ro.model].filter(Boolean).join(' ') || '--',
        Status: order.status || '--',
        Shop: shop.name ? `${shop.name} (${shop.id})` : '--',
        Dealer: dealer.name ? `${dealer.name} (${dealer.id})` : '--',
        'CSR Region': ro.region || '--',
        'Date Submitted': formatDate(order.dateSubmitted),
        'Date Closed': formatDate(ro.dateClosed) || '--',
      };
    });
  };

  const exportCSV = async () => {
    try {
      toast.loading(t('partsOrder.messages.exportLoading'));
      const allOrders = await fetchAllDataForExport();
      const flattenedData = getFlattenedAllData(allOrders);
      const result = await exportCurrentPageToCSV(flattenedData, headers);
      toast.dismiss();
      result ? toast.success(t('partsOrder.messages.exportSuccess')) : null;
    } catch (error) {
      toast.dismiss();
      toast.error(t('partsOrder.messages.exportFailed'));
    }
  };

  useEffect(() => {
    // Ensure component is mounted and ref is connected to DOM
    if (partsOrderRef.current) {
      // 2. Use native DOM API to find all <th> elements
      const thElements = partsOrderRef.current.querySelectorAll('thead th');

      // 3. Extract text content
      const headerTexts = Array.from(thElements)
        .map((th) => th?.textContent?.trim() || '')
        .filter((text) => text !== '');
      setHeaders(headerTexts);
    }
  }, [orders]);
  const getStatusTxt = (status: string) => {
    switch (status) {
      case 'CsrReview':
        return t('partsOrder.status.CsrReview');
      case 'CsrRejected':
        return t('partsOrder.status.CsrRejected');
      case 'DealershipProcessing':
        return t('partsOrder.status.DealershipProcessing');
      case 'DealershipShipped':
        return t('partsOrder.status.DealershipShipped');
      case 'ShopReceived':
        return t('partsOrder.status.ShopReceived');
      case 'RepairCompleted':
        return t('partsOrder.status.RepairCompleted');
      default:
        return status;
    }
  };

  // Get parts order data
  const fetchPartsOrders = async (flag?: boolean | undefined, date?: DateRange | undefined) => {
    if (!user) return;

    setLoading(true);
    try {
      const api = new OrderApi();

      const dateFrom = dateSubmittedFrom ? formatDateOnly(dateSubmittedFrom) : undefined;
      const dateTo = dateSubmittedTo ? formatDateOnly(dateSubmittedTo) : undefined;

      // Build request parameters
      const requestParams: any = {
        smartFilter,
        filterByWaitingOnMe,
        filterByDealershipId: user?.person?.type === 'Dealership' ? user?.person?.dealership.id : undefined,
      };
      // Handle order type filtering
      if (filterByPartsOrderNumber !== 'all') {
        requestParams.filterByPartsOrderNumber = parseInt(filterByPartsOrderNumber);
      }

      // Handle status filtering
      if (filterByStatus !== 'all') {
        requestParams.filterByStatus = filterByStatus;
      }
      if (filterByRegionId !== 'all') {
        requestParams.filterByRegionId = parseInt(filterByRegionId);
      }
      // // Add pagination parameters
      const resultParameter = ResultParameter.create({
        resultsLimitOffset: (currentPage - 1) * itemsPerPage,
        resultsLimitCount: itemsPerPage,
        resultsOrderBy: sortBy || 'dateCreated',
        resultsOrderAscending: sortAscending,
      });
      requestParams.resultParameter = resultParameter;

      const request = PartsOrderSearchRequest.create(requestParams);
      // Before serialization, manually format date fields as strings (override ModelBaseClass conversion)
      if (dateFrom) {
        (request as any).dateSubmittedFrom = dateFrom;
      }
      if (dateTo) {
        (request as any).dateSubmittedTo = dateTo;
      }

      if (flag && !date) {
        (request as any).dateSubmittedFrom = undefined;
        (request as any).dateSubmittedTo = undefined;
      }

      api.partsOrderSearch(request, {
        status200: (response: any) => {
          setOrders(response.partOrders || []);
          setTotalItems(response.totalItemCount || 0);
          setLoading(false);
        },
        error: (error: any) => {
          toast.error(
            t('partsOrder.messages.fetchError', { error: error || t('partsOrder.messages.fetchErrorDefault') })
          );
          setLoading(false);
        },
        else: () => {
          setLoading(false);
        },
      });
    } catch (error) {
      console.error('API call error:', error);
      setLoading(false);
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
    if (!user) return;

    // Call API (for text input, use debounce)
    const timeoutId = setTimeout(
      () => {
        fetchPartsOrders();
      },
      smartFilter ? 500 : 0
    );

    return () => clearTimeout(timeoutId);
  }, [
    smartFilter,
    filterByWaitingOnMe,
    filterByPartsOrderNumber,
    filterByStatus,
    filterByRegionId,
    dateSubmittedRange,
    currentPage,
    user,
    sortBy,
    sortAscending,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    smartFilter,
    filterByWaitingOnMe,
    filterByPartsOrderNumber,
    filterByStatus,
    filterByRegionId,
    dateSubmittedRange,
  ]);

  // Format date display
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '--';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  // Get order type display text
  const getOrderTypeText = (partsOrderNumber: number): string => {
    if (partsOrderNumber === 0) return t('partsOrder.types.0');
    if (partsOrderNumber === 1) return t('partsOrder.types.1');
    if (partsOrderNumber === 2) return t('partsOrder.types.2');
    if (partsOrderNumber === 3) return t('partsOrder.types.3');
    return `${t('partsOrder.supplement')} ${partsOrderNumber}`;
  };

  return (
    <div className="min-h-scree">
      {/* Header */}
      <div className="bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">{t('partsOrder.list.title')}</h1>
          <Button onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            {t('partsOrder.list.report')}
          </Button>
        </div>

        <div className="px-6 py-6">
          {/* Search + Checkbox */}
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute w-4 h-4 -translate-y-1/2 text-muted-foreground top-1/2 left-3" />
              <ClearableInput
                value={smartFilter}
                onChange={(e) => setSmartFilter(e.target.value)}
                placeholder={t('partsOrder.list.searchPlaceholder')}
                className="pl-10"
              />
            </div>
            {/* Only CSRs (Customer Service Representatives) and Dealers can see and use */}
            {(user?.person?.type === 'Csr' || user?.person?.type === 'Dealership') && (
              <div className="flex items-center gap-3">
                <Checkbox
                  id="my-orders"
                  checked={filterByWaitingOnMe}
                  onCheckedChange={(checked) => setOnlyMyOrders(checked as boolean)}
                  className="rounded-full bg-muted"
                />
                <Label htmlFor="my-orders" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Trans i18nKey="partsOrder.list.onlyWaitingOnMe" components={{ strong: <strong /> }} />
                </Label>
              </div>
            )}
          </div>

          {/* Complete filter conditions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Select value={filterByPartsOrderNumber} onValueChange={(value) => setTypeOfOrder(value)}>
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder={t('partsOrder.list.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('partsOrder.list.type.all')}</SelectItem>
                <SelectItem value="0">{t('partsOrder.types.0')}</SelectItem>
                <SelectItem value="1">{t('partsOrder.types.1')}</SelectItem>
                <SelectItem value="2">{t('partsOrder.types.2')}</SelectItem>
                <SelectItem value="3">{t('partsOrder.types.3')}</SelectItem>
                <SelectItem value="4">{t('partsOrder.types.4')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterByStatus} onValueChange={(value) => setFilterByStatus(value)}>
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder={t('partsOrder.list.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('partsOrder.list.status.all')}</SelectItem>
                <SelectItem value="CsrReview">{t('partsOrder.status.CsrReview')}</SelectItem>
                <SelectItem value="CsrRejected">{t('partsOrder.status.CsrRejected')}</SelectItem>
                <SelectItem value="DealershipProcessing">{t('partsOrder.status.DealershipProcessing')}</SelectItem>
                <SelectItem value="DealershipShipped">{t('partsOrder.status.DealershipShipped')}</SelectItem>
                <SelectItem value="ShopReceived">{t('partsOrder.status.ShopReceived')}</SelectItem>
                <SelectItem value="RepairCompleted">{t('partsOrder.status.RepairCompleted')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterByRegionId} onValueChange={(value) => setCsrRegion(value)}>
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder={t('partsOrder.list.regionPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('partsOrder.list.region.all')}</SelectItem>
                {user?.regions?.map((region) => (
                  <SelectItem key={region.id} value={region.id?.toString() || ''}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('partsOrder.list.dateRangeLabel')}</span>
              <Select
                value={dateSubmittedRange}
                onValueChange={(value) => {
                  setRange(undefined);
                  setDateSubmittedRange(value);
                  const { from, to } = calculateDateRange(value);
                  setFromDate(from);
                  setToDate(to);
                }}
              >
                <SelectTrigger className="w-48 bg-muted">
                  <SelectValue placeholder={t('partsOrder.list.dateRangePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('partsOrder.list.dateRangeOptions.all')}</SelectItem>
                  <SelectItem value="7">{t('partsOrder.list.dateRangeOptions.7')}</SelectItem>
                  <SelectItem value="30">{t('partsOrder.list.dateRangeOptions.30')}</SelectItem>
                  <SelectItem value="month-to-date">{t('partsOrder.list.dateRangeOptions.month-to-date')}</SelectItem>
                  <SelectItem value="quarter-to-date">
                    {t('partsOrder.list.dateRangeOptions.quarter-to-date')}
                  </SelectItem>
                  <SelectItem value="year-to-date">{t('partsOrder.list.dateRangeOptions.year-to-date')}</SelectItem>
                  <SelectItem value="last-month">{t('partsOrder.list.dateRangeOptions.last-month')}</SelectItem>
                  <SelectItem value="last-quarter">{t('partsOrder.list.dateRangeOptions.last-quarter')}</SelectItem>
                  <SelectItem value="last-year">{t('partsOrder.list.dateRangeOptions.last-year')}</SelectItem>
                  <SelectItem value="custom">{t('partsOrder.list.dateRangeOptions.custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date range picker */}
            {dateSubmittedRange === 'custom' && (
              <DateRangePicker
                value={range}
                onChange={(newRange) => {
                  setRange(newRange);
                  setFromDate(newRange?.from ?? undefined);
                  setToDate(newRange?.to ?? undefined);
                }}
                onClose={(date) => {
                  fetchPartsOrders(true, date);
                }}
                placeholder={t('partsOrder.list.dateRangePickerPlaceholder')}
                disabled={false}
              />
            )}
          </div>

          {/* Table */}
          <div className="overflow-hidden border rounded-lg shadow-sm bg-background">
            <Table ref={partsOrderRef}>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-semibold text-foreground">
                    {t('partsOrder.list.tableHeaders.ro')}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    {t('partsOrder.list.tableHeaders.sales')}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    {t('partsOrder.list.tableHeaders.type')}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    {t('partsOrder.list.tableHeaders.vin')}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    {t('partsOrder.list.tableHeaders.ymm')}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    {t('partsOrder.list.tableHeaders.status')}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    {t('partsOrder.list.tableHeaders.shop')}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    {t('partsOrder.list.tableHeaders.dealer')}
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">
                    {t('partsOrder.list.tableHeaders.csrRegion')}
                  </TableHead>
                  <SortableTableHead
                    field="dateCreated"
                    currentSortBy={sortBy}
                    currentAscending={sortAscending}
                    onSort={handleSort}
                  >
                    {t('partsOrder.list.tableHeaders.dateSubmitted')}
                  </SortableTableHead>
                  <SortableTableHead
                    field="dateClosed"
                    currentSortBy={sortBy}
                    currentAscending={sortAscending}
                    onSort={handleSort}
                  >
                    {t('partsOrder.list.tableHeaders.dateClosed')}
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-8 text-center">
                      {t('partsOrder.list.loading')}
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-8 text-center">
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <TableIcon className="w-4 h-4" />
                          </EmptyMedia>
                          <EmptyTitle>{t('partsOrder.list.empty.title')}</EmptyTitle>
                          <EmptyDescription>{t('partsOrder.list.empty.description')}</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order: any) => {
                    const repairOrder = order.repairOrder;
                    const roNumber = repairOrder?.roNumber || '';
                    const salesOrder = order.salesOrderNumber || '--';
                    const type = getOrderTypeText(order.partsOrderNumber || 0);
                    const vin = repairOrder?.vin || '--';
                    const yearMakeModel = repairOrder
                      ? `${repairOrder.year || ''} ${repairOrder.make || ''} ${repairOrder.model || ''}`.trim() || '--'
                      : '--';
                    const status = order.status || '--';
                    const shop = repairOrder?.shop
                      ? `${repairOrder.shop.name || ''} (${repairOrder.shop.id || ''})`
                      : '--';
                    const dealer = repairOrder?.dealership
                      ? `${repairOrder.dealership.name || ''} (${repairOrder.dealership.id || ''})`
                      : '--';
                    const region = repairOrder?.region || '--';
                    const dateCompleted = formatDate(order.dateSubmitted);
                    const dateClosed = formatDate(repairOrder?.dateClosed);
                    // Determine if there is a note (ordered from alternate dealer)
                    const hasNote = repairOrder?.dealership.id !== repairOrder?.shop.sponsorDealership.id;

                    return (
                      <TableRow key={order.id} className="hover:bg-muted/50">
                        <TableCell
                          className="text-blue-600 underline cursor-pointer"
                          onClick={() => {
                            navigate({
                              to: '/repair_orders/$id',
                              params: { id: order.repairOrder.id.toString() },
                            });
                          }}
                        >
                          {roNumber}
                        </TableCell>
                        <TableCell>{salesOrder}</TableCell>
                        <TableCell>{type}</TableCell>
                        <TableCell>{vin}</TableCell>
                        <TableCell>{yearMakeModel}</TableCell>
                        <TableCell>
                          {/* <Badge
                            variant={getStatusVariant(filterByStatus)}
                            className='whitespace-nowrap'
                          >
                            {status}
                          </Badge> */}
                          <Badge
                            // variant={getStatusVariant(filterByStatus)}
                            variant="secondary"
                            className="whitespace-nowrap"
                          >
                            {getStatusTxt(status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{shop}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {hasNote && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertCircle className="w-4 h-4 text-yellow-600 cursor-pointer" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('partsOrder.list.tooltip.orderedFromAlternateDealer')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <span className="text-sm">{dealer}</span>
                          </div>
                        </TableCell>
                        <TableCell>{region}</TableCell>
                        <TableCell>{dateCompleted}</TableCell>
                        <TableCell>{dateClosed || '--'}</TableCell>
                      </TableRow>
                    );
                  })
                )}
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
  );
}
