import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useRouter } from '@tanstack/react-router';
import RequestApi from '@/js/clients/base/OrderApi';
import PartsOrder from '@/js/models/PartsOrder';
import type RepairOrder from '@/js/models/RepairOrder';
import RepairOrderSearchRequest from '@/js/models/RepairOrderSearchRequest';
import ResultParameter from '@/js/models/ResultParameter';
import { Search, AlertTriangle, TableIcon, Users, Warehouse, Tag, MapPin, Map, Plus } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import audiNav from '@/assets/img/repair/audi.png';
import vwNav from '@/assets/img/repair/vw.png';
import { useAuthStore } from '@/stores/auth-store';
import { calculateDateRange, formatDateOnly } from '@/lib/utils';
import { useBrand } from '@/context/brand-context';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker } from '@/components/DateRangePicker';
import { PartsOrderDialog } from '@/components/PartsOrderDialog';
import RepairOrderDialog, { type RepairOrderData } from '@/components/RepairOrderDialog';
import { DataTablePagination } from '@/components/data-table-pagination';
import { ClearableInput } from '@/components/clearable-input';
import { useTranslation } from 'react-i18next';

interface RepairOrderListProps {
  repairOrders: [];
  totalItems: number;
}

export function RepairOrderList() {
  const { t } = useTranslation();

  const { user } = useAuthStore((state) => state.auth);
  const [dateLastSubmittedFrom, setFromDate] = useState<Date | undefined>(undefined);
  const [repairOrders, setRepairOrders] = useState<RepairOrderListProps[]>([]);
  const [dateLastSubmittedTo, setToDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [isOpen, setOpen] = useState(false);
  const [showRepairCompleted, setShowRepairCompleted] = useState(false);
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [smartFilter, setSmartFilter] = useState('');
  const [dateRangePreset, setDateRangePreset] = useState('all');
  const [initialData] = useState<RepairOrder | undefined>(undefined);
  const [openPartsOrderDialog, setOpenPartsOrderDialog] = useState(false);
  const [selectedPartsOrderData, setSelectedPartsOrderData] = useState<PartsOrder>();
  const [initRepaitOrderData, setInitRepaitOrderData] = useState<RepairOrder>();
  const [displayOrders, setDisplayOrders] = useState<any[]>([]);
  const location: any = useLocation();
  const id = location.search.id ? Number(location.search.id) : undefined;
  const [range, setRange] = useState<DateRange>();
  const { brand } = useBrand();
  const navImg = brand === 'vw' ? vwNav : audiNav;

  const getRepairOrderDetail = async (id: string) => {
    try {
      return new Promise((resolve, reject) => {
        const api = new RequestApi();
        api.repairOrderGet(id, {
          status200: (response) => {
            setInitRepaitOrderData(response);
            resolve(response);
          },
          error: (error) => {
            console.error('Error:', error);
            reject(error);
          },
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getPartsOrderDetail = async (id: string, flag?: boolean) => {
    try {
      return new Promise((resolve, reject) => {
        const api = new RequestApi();
        api.partsOrderGetAllForRepairOrder(id, {
          status200: (response) => {
            setSelectedPartsOrderData(response);
            flag ? setOpenPartsOrderDialog(true) : '';
            resolve(response);
          },
          error: () => {
            reject();
          },
          else: (_statusCode) => {
            reject();
          },
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getRepairOrders = async (flag?: boolean | undefined, date?: DateRange | undefined) => {
    try {
      const api = new RequestApi();
      const shopId = user?.person?.shop?.id || id;
      if (shopId == null) {
        router.history.go(-1);
        return;
      }
      const statusFilter = filterByStatus === 'all' ? undefined : filterByStatus;
      const request = RepairOrderSearchRequest.create({
        shopId: Number(shopId),
        smartFilter: smartFilter || undefined,
        filterByStatus: statusFilter,
        showRepairCompleted: showRepairCompleted,
        dateLastSubmittedFrom,
        dateLastSubmittedTo,
      });
      if ((request as any).dateLastSubmittedFrom) {
        (request as any).dateLastSubmittedFrom = formatDateOnly(dateLastSubmittedFrom);
      }
      if ((request as any).dateLastSubmittedTo) {
        (request as any).dateLastSubmittedTo = formatDateOnly(dateLastSubmittedTo);
      }
      const resultParameter = ResultParameter.create({
        resultsLimitOffset: (currentPage - 1) * itemsPerPage,
        resultsLimitCount: itemsPerPage,
        resultsOrderBy: 'dateLastSubmitted',
        resultsOrderAscending: false,
      });
      (request as any).resultParameter = resultParameter;
      if (flag && !date) {
        (request as any).dateLastSubmittedFrom = undefined;
        (request as any).dateLastSubmittedTo = undefined;
      }
      api.repairOrderSearch(request, {
        status200: async (response) => {
          let orders = (response as any).repairOrders || [];
          const ordersWithParts = await Promise.all(
            orders.map(async (order: any) => {
              try {
                const partsResponse = await getPartsOrderDetail(order.id.toString());
                const partsOrders = Array.isArray(partsResponse) ? partsResponse : partsResponse ? [partsResponse] : [];
                const statusCounts = {
                  CsrReview: 0,
                  CsrRejected: 0,
                  DealershipProcessing: 0,
                  DealershipShipped: 0,
                  ShopReceived: 0,
                  RepairCompleted: 0,
                };
                partsOrders.forEach((part: any) => {
                  const status = part.status;
                  if (statusCounts.hasOwnProperty(status)) {
                    statusCounts[status as keyof typeof statusCounts]++;
                  }
                });
                return {
                  ...order,
                  partsOrders,
                  statusCounts,
                };
              } catch (err) {
                console.error(`Failed to load parts for RO ${order.id}:`, err);
                return {
                  ...order,
                  partsOrders: [],
                  statusCounts: {
                    CsrReview: 0,
                    CsrRejected: 0,
                    DealershipProcessing: 0,
                    DealershipShipped: 0,
                    ShopReceived: 0,
                    RepairCompleted: 0,
                  },
                };
              }
            })
          );
          setRepairOrders(orders);
          setDisplayOrders(ordersWithParts);
          setTotalItems((response as any).totalItemCount || 0);
        },
        error: (error) => {
          console.error('Error:', error);
          toast.error(t('repairOrder.list.fetchError'));
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    setCurrentPage(1);
  }, [smartFilter, filterByStatus, dateRangePreset]);
  useEffect(() => {
    if (!user) return;
    const userType = user?.person?.type;
    if (userType === 'Dealership' || userType === 'Csr' || userType === 'FieldStaff') {
      console.warn('Dealership user cannot access repair order list');
      navigate({ to: '/parts_orders', replace: true });
      return;
    }
    const timeoutId = setTimeout(
      () => {
        getRepairOrders();
      },
      smartFilter ? 500 : 0
    );
    return () => clearTimeout(timeoutId);
  }, [smartFilter, filterByStatus, showRepairCompleted, user, currentPage, dateRangePreset]);

  const showIcon = (orderAny: any) => {
    if (!orderAny.dateLastSubmitted) return null;
    const submittedDate = new Date(orderAny.dateLastSubmitted);
    const diffMs = Date.now() - submittedDate.getTime();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const isOver7Days = diffMs >= SEVEN_DAYS_MS;
    const hasAlertPartsStatus =
      orderAny?.partsOrders?.length > 0 &&
      orderAny.partsOrders.some(
        (val: any) =>
          val.status === 'ShopReceived' || val.status === 'CsrRejected' || val.status === 'DealershipShipped'
      );
    if ((hasAlertPartsStatus || isOver7Days) && user?.person?.type === 'Shop') {
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative w-full h-40">
        <img
          src={navImg}
          alt={brand === 'vw' ? t('brand.vw') : t('brand.audi')}
          className="object-cover w-full h-full mt-6"
        />
        <div className="absolute -translate-y-1/2 top-1/2 left-6">
          <p className="text-3xl font-bold text-white">{user?.person?.shop?.name ?? '--'}</p>
          <p className="flex items-center mt-4 space-x-4 text-sm text-gray-200">
            <Warehouse className="w-5 h-5 text-white" />
            <span>
              {t('repairOrder.list.assignedDealership')}: {user?.person?.shop?.sponsorDealership.name ?? '--'} (
              {user?.person?.shop?.sponsorDealership.dealershipNumber})
            </span>
            <Users className="w-5 h-5 ml-6 text-white" />
            <span>
              {t('repairOrder.list.fieldSupportTeam')}: {user?.person?.firstName} {user?.person?.lastName}
            </span>
          </p>
        </div>
        <div className="absolute top-1/2 right-6 max-w-[320px] -translate-y-1/2 text-sm text-gray-100">
          <div className="grid gap-1">
            <div className="grid grid-cols-[24px_1fr] items-center gap-2">
              <Tag className="w-5 h-5 text-white justify-self-end" aria-hidden="true" />
              <span className="truncate">{user?.person?.shop?.shopNumber ?? '--'}</span>
            </div>
            <div className="my-1 grid grid-cols-[24px_1fr] items-center gap-2">
              <MapPin className="w-5 h-5 text-white justify-self-end" aria-hidden="true" />
              <span className="truncate">
                {user?.person?.shop?.address ?? '--'}, {user?.person?.shop?.city ?? '--'},{' '}
                {user?.person?.shop?.state ?? '--'} {user?.person?.shop?.zip ?? '--'}
              </span>
            </div>
            <div className="grid grid-cols-[24px_1fr] items-center gap-2">
              <Map className="w-5 h-5 text-white justify-self-end" aria-hidden="true" />
              <span className="truncate">{user?.person?.shop?.region.name ?? '--'}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="border-b bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">{t('repairOrder.list.title')}</h1>
          {user?.person?.type === 'Shop' && (
            <Button variant="outline" onClick={() => setOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t('repairOrder.list.newRepairOrder')}
            </Button>
          )}
        </div>
      </div>
      {/* Dialogs */}
      <RepairOrderDialog
        open={isOpen}
        onOpenChange={setOpen}
        onSuccess={async (data: any) => {
          const snapshot = JSON.parse(JSON.stringify(data));
          const id = snapshot.id;
          if (id) {
            await getRepairOrderDetail(data.id);
            await getPartsOrderDetail(data.id, true);
          } else {
            toast.error(t('repairOrder.list.createFailed'));
          }
        }}
        initialData={initialData as RepairOrderData}
      />
      <PartsOrderDialog
        open={openPartsOrderDialog}
        onOpenChange={setOpenPartsOrderDialog}
        initialData={selectedPartsOrderData}
        initRepaitOrderData={initRepaitOrderData}
        onSuccess={getRepairOrders}
      />
      <div className="px-6 py-6">
        {/* Filters */}
        <div className="flex flex-col items-center justify-between gap-4 mb-6 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute w-4 h-4 -translate-y-1/2 text-muted-foreground top-1/2 left-3" />
              <ClearableInput
                value={smartFilter}
                onChange={(e) => setSmartFilter(e.target.value)}
                placeholder={t('repairOrder.list.searchPlaceholder')}
                className="pl-10 text-sm placeholder:text-xs"
              />
            </div>
            <Select defaultValue="all" onValueChange={(value) => setFilterByStatus(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('repairOrder.list.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('repairOrder.list.status.all')}</SelectItem>
                <SelectItem value="CsrReview">{t('repairOrder.status.CsrReview')}</SelectItem>
                <SelectItem value="CsrRejected">{t('repairOrder.status.CsrRejected')}</SelectItem>
                <SelectItem value="DealershipProcessing">{t('repairOrder.status.DealershipProcessing')}</SelectItem>
                <SelectItem value="DealershipShipped">{t('repairOrder.status.DealershipShipped')}</SelectItem>
                <SelectItem value="ShopReceived">{t('repairOrder.status.ShopReceived')}</SelectItem>
                <SelectItem value="RepairCompleted">{t('repairOrder.status.RepairCompleted')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              defaultValue={dateRangePreset}
              onValueChange={(value) => {
                setRange(undefined);
                setDateRangePreset(value);
                const { from, to } = calculateDateRange(value);
                setFromDate(from);
                setToDate(to);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('repairOrder.list.dateRangePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('repairOrder.list.dateRangeOptions.all')}</SelectItem>
                <SelectItem value="7">{t('repairOrder.list.dateRangeOptions.7')}</SelectItem>
                <SelectItem value="30">{t('repairOrder.list.dateRangeOptions.30')}</SelectItem>
                <SelectItem value="month-to-date">{t('repairOrder.list.dateRangeOptions.monthToDate')}</SelectItem>
                <SelectItem value="quarter-to-date">{t('repairOrder.list.dateRangeOptions.quarterToDate')}</SelectItem>
                <SelectItem value="year-to-date">{t('repairOrder.list.dateRangeOptions.yearToDate')}</SelectItem>
                <SelectItem value="last-month">{t('repairOrder.list.dateRangeOptions.lastMonth')}</SelectItem>
                <SelectItem value="last-quarter">{t('repairOrder.list.dateRangeOptions.lastQuarter')}</SelectItem>
                <SelectItem value="last-year">{t('repairOrder.list.dateRangeOptions.lastYear')}</SelectItem>
                <SelectItem value="custom">{t('repairOrder.list.dateRangeOptions.custom')}</SelectItem>
              </SelectContent>
            </Select>
            {/* Custom Date Range Picker */}
            {dateRangePreset === 'custom' && (
              <div className="ml-3">
                <DateRangePicker
                  value={range}
                  onChange={(newRange) => {
                    setRange(newRange);
                    setFromDate(newRange?.from ?? undefined);
                    setToDate(newRange?.to ?? undefined);
                  }}
                  onClose={() => getRepairOrders(true)}
                  placeholder={t('repairOrder.list.dateRangePickerPlaceholder')}
                  disabled={false}
                />
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Checkbox
              id="show-completed"
              checked={showRepairCompleted}
              onCheckedChange={(checked: boolean) => setShowRepairCompleted(checked)}
              className="rounded-full"
            />
            <Label htmlFor="show-completed" className="text-sm font-medium cursor-pointer">
              {t('repairOrder.list.showRepairCompleted')}
            </Label>
          </div>
        </div>
        {/* Empty State or Table */}
        {repairOrders.length === 0 ? (
          <div>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TableIcon className="w-4 h-4" />
                </EmptyMedia>
                <EmptyTitle>{t('repairOrder.list.empty.title')}</EmptyTitle>
                <EmptyDescription>
                  {id !== undefined
                    ? t('repairOrder.list.empty.noOrdersForShop')
                    : t('repairOrder.list.empty.noResults')}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div>
            <div className="overflow-hidden border rounded-lg shadow-sm bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="font-semibold text-foreground">
                      {t('repairOrder.list.tableHeaders.ro')}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {t('repairOrder.list.tableHeaders.order')}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {t('repairOrder.list.tableHeaders.vin')}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {t('repairOrder.list.tableHeaders.ymm')}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {t('repairOrder.list.tableHeaders.status')}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {t('repairOrder.list.tableHeaders.customer')}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {t('repairOrder.list.tableHeaders.dateSubmitted')}
                    </TableHead>
                    <TableHead className="font-semibold text-foreground">
                      {t('repairOrder.list.tableHeaders.dateCompleted')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayOrders.map((order) => {
                    const orderAny = order as any;
                    const vehicle =
                      orderAny.year && orderAny.make && orderAny.model
                        ? `${orderAny.year} ${orderAny.make} ${orderAny.model}`
                        : '--';
                    return (
                      <TableRow key={orderAny.id || orderAny.roNumber} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {showIcon(orderAny)}
                            <span
                              className="text-blue-600 cursor-pointer hover:underline"
                              onClick={() => {
                                navigate({
                                  to: '/repair_orders/$id',
                                  params: { id: orderAny.id.toString() },
                                });
                              }}
                            >
                              {orderAny.roNumber || '--'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {orderAny.salesOrderNumber ? <div>{orderAny.salesOrderNumber}</div> : <div>--</div>}
                          </div>
                        </TableCell>
                        <TableCell>{orderAny.vin || '--'}</TableCell>
                        <TableCell>{vehicle}</TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {orderAny.statusCounts.DealershipShipped > 1 && (
                              <div>
                                {t('repairOrder.status.DealershipShipped')} ({orderAny.statusCounts.DealershipShipped})
                              </div>
                            )}
                            {orderAny.statusCounts.DealershipShipped === 1 && (
                              <div>{t('repairOrder.status.DealershipShipped')}</div>
                            )}
                            {orderAny.statusCounts.ShopReceived > 1 && (
                              <div>
                                {t('repairOrder.status.ShopReceived')} ({orderAny.statusCounts.ShopReceived})
                              </div>
                            )}
                            {orderAny.statusCounts.ShopReceived === 1 && (
                              <div>{t('repairOrder.status.ShopReceived')}</div>
                            )}
                            {orderAny.statusCounts.CsrReview > 1 && (
                              <div>
                                {t('repairOrder.status.CsrReview')} ({orderAny.statusCounts.CsrReview})
                              </div>
                            )}
                            {orderAny.statusCounts.CsrReview === 1 && <div>{t('repairOrder.status.CsrReview')}</div>}
                            {orderAny.statusCounts.CsrRejected > 1 && (
                              <div>
                                {t('repairOrder.status.CsrRejected')} ({orderAny.statusCounts.CsrRejected})
                              </div>
                            )}
                            {orderAny.statusCounts.CsrRejected === 1 && (
                              <div>{t('repairOrder.status.CsrRejected')}</div>
                            )}
                            {orderAny.statusCounts.DealershipProcessing > 1 && (
                              <div>
                                {t('repairOrder.status.DealershipProcessing')} (
                                {orderAny.statusCounts.DealershipProcessing})
                              </div>
                            )}
                            {orderAny.statusCounts.DealershipProcessing === 1 && (
                              <div>{t('repairOrder.status.DealershipProcessing')}</div>
                            )}
                            {orderAny.statusCounts.RepairCompleted > 1 && (
                              <div>
                                {t('repairOrder.status.RepairCompleted')} ({orderAny.statusCounts.RepairCompleted})
                              </div>
                            )}
                            {orderAny.statusCounts.RepairCompleted === 1 && (
                              <div>{t('repairOrder.status.RepairCompleted')}</div>
                            )}
                            {Object.values(orderAny.statusCounts).every((count) => count === 0) && <div>--</div>}
                          </div>
                        </TableCell>
                        <TableCell>{orderAny.customer || '--'}</TableCell>
                        <TableCell>{formatDateOnly(orderAny.dateLastSubmitted)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDateOnly(orderAny.dateClosed)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
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
  );
}
