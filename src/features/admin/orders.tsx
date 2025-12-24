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
  const getFlattenedCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = orders.slice(startIndex, endIndex);

    return pageData.map((order: any) => {
      const ro = order.repairOrder || {};
      const shop = ro.shop || {};
      const dealer = ro.dealership || {};

      return {
        'RO#': ro.roNumber || '--', // ← Must add quotes!
        'Sales#': order.salesOrderNumber || '--', // ← Must add quotes!
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
      const flattenedData = getFlattenedCurrentPageData();
      const result = await exportCurrentPageToCSV(flattenedData, headers);
      result ? toast.success('Exported successfully') : null;
    } catch (error) {
      toast.error('Export failed');
    }
  };

  useEffect(() => {
    // Ensure component is mounted and ref is connected to DOM
    if (partsOrderRef.current) {
      // 2. Use native DOM API to find all <th> elements
      const thElements = partsOrderRef.current.querySelectorAll('thead th');

      // 3. Extract text content
      const headerTexts = Array.from(thElements).map((th) => th.textContent.trim());
      setHeaders(headerTexts);
    }
  }, [orders]);
  const getStatusTxt = (status: string) => {
    switch (status) {
      case 'CsrReview':
        return 'CSR Review';
      case 'CsrRejected':
        return 'CSR Rejected';
      case 'DealershipProcessing':
        return 'Dealer Processing';
      case 'DealershipShipped':
        return 'Dealer Shipped';
      case 'ShopReceived':
        return 'Shop Received';
      case 'RepairCompleted':
        return 'Repair Completed';
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
          toast.error(`Error: ${error || 'Failed to fetch data'}`);
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
    if (partsOrderNumber === 0) return 'Parts Order';
    if (partsOrderNumber === 1) return 'Supplement 1';
    if (partsOrderNumber === 2) return 'Supplement 2';
    return `Supplement ${partsOrderNumber}`;
  };

  return (
    <div className="min-h-scree">
      {/* Header */}
      <div className="bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Parts Order List</h1>
          <Button onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Report
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
                placeholder="Filter by RO#, Sales Order #, VIN, Shop, Dealer"
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
                  Only View Parts Orders that are waiting On Me
                </Label>
              </div>
            )}
          </div>

          {/* Complete filter conditions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Select value={filterByPartsOrderNumber} onValueChange={(value) => setTypeOfOrder(value)}>
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder="Type of Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="0">Parts Order</SelectItem>
                <SelectItem value="1">Supplement #1</SelectItem>
                <SelectItem value="2">Supplement #2</SelectItem>
                <SelectItem value="3">Supplement #3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterByStatus} onValueChange={(value) => setFilterByStatus(value)}>
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="CsrReview">CSR Review</SelectItem>
                <SelectItem value="CsrRejected">CSR Rejected</SelectItem>
                <SelectItem value="DealershipProcessing">Dealer Processing</SelectItem>
                <SelectItem value="DealershipShipped">Dealer Shipped</SelectItem>
                <SelectItem value="ShopReceived">Shop Received</SelectItem>
                <SelectItem value="RepairCompleted">Repair Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterByRegionId} onValueChange={(value) => setCsrRegion(value)}>
              <SelectTrigger className="w-48 bg-muted">
                <SelectValue placeholder="CSR Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {user?.regions?.map((region) => (
                  <SelectItem key={region.id} value={region.id?.toString() || ''}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Date Submitted Range</span>
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
                  <SelectValue placeholder="ALL Dates" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="7">Past 7 days</SelectItem>
                  <SelectItem value="30">Past 30 Days</SelectItem>
                  <SelectItem value="month-to-date">Month-To-Date</SelectItem>
                  <SelectItem value="quarter-to-date">Quarter-To-Date</SelectItem>
                  <SelectItem value="year-to-date">Year-To-Date</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
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
                placeholder="Select date range"
                disabled={false}
              />
            )}
          </div>

          {/* Table */}
          <div className="overflow-hidden border rounded-lg shadow-sm bg-background">
            <Table ref={partsOrderRef}>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-semibold text-foreground">RO #</TableHead>
                  <TableHead className="font-semibold text-foreground">Sales #</TableHead>
                  <TableHead className="font-semibold text-foreground">Type</TableHead>
                  <TableHead className="font-semibold text-foreground">VIN</TableHead>
                  <TableHead className="font-semibold text-foreground">Year/Make/Model</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Shop</TableHead>
                  <TableHead className="font-semibold text-foreground">Dealer</TableHead>
                  <TableHead className="font-semibold text-foreground">CSR Region</TableHead>
                  <SortableTableHead
                    field="dateCreated"
                    currentSortBy={sortBy}
                    currentAscending={sortAscending}
                    onSort={handleSort}
                  >
                    Date Submitted
                  </SortableTableHead>
                  <SortableTableHead
                    field="dateClosed"
                    currentSortBy={sortBy}
                    currentAscending={sortAscending}
                    onSort={handleSort}
                  >
                    Date Closed
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="py-8 text-center">
                      loading...
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
                          <EmptyTitle>No data to display</EmptyTitle>
                          <EmptyDescription>No results could be found.</EmptyDescription>
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
                                    <p>Ordered from an alternate dealer</p>
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
