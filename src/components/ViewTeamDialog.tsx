import PersonStatusEnum from '@/js/models/enum/PersonStatusEnum';
import PersonTypeEnum, { type PersonType } from '@/js/models/enum/PersonTypeEnum';
import { X, Store, Users, Pause, Play, Check, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from './ui/button';
import PersonEditStatusRequest from '@/js/models/PersonEditStatusRequest';
import PersonApi from '@/js/clients/base/PersonApi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useState, useMemo } from 'react';

type PersonStatus = (typeof PersonStatusEnum)[keyof typeof PersonStatusEnum];

export interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateAdded: string;
  dateLastAccessed: string | null;
  dateCreated: string;
  dateLastAccess: string | null;
  status?: PersonStatus;
  shop?: {
    shopNumber: string;
    address: string;
    id: number;
  };
  dealership?: {
    dealershipNumber: string;
    address: string;
    id: number;
  };
  type?: PersonType;
}

interface ViewDealerTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopName?: string;
  shopNumber?: string;
  location?: string;
  teamMembers?: TeamMember[];
  onSuccess?: (userType: 'Shop' | 'Dealership', organizationId: number | undefined) => void;
}

export default function ViewTeamDialog({ open, onOpenChange, teamMembers, onSuccess }: ViewDealerTeamDialogProps) {
  const { t } = useTranslation();

  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [sortBy, setSortBy] = useState<keyof TeamMember>('firstName');
  const [sortAscending, setSortAscending] = useState(true);

  // 排序逻辑
  const sortedMembers = useMemo(() => {
    if (!teamMembers || !sortBy) return teamMembers || [];

    return [...teamMembers].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // 处理 null 或 undefined 值
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // 字符串比较
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortAscending ? comparison : -comparison;
      }

      // 数字比较
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortAscending ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [teamMembers, sortBy, sortAscending]);

  const handleSort = (field: keyof TeamMember) => {
    if (sortBy === field) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(field);
      setSortAscending(true);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDeactivate = async (member: TeamMember) => {
    try {
      await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: member.id,
          action: 'Deactivate',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            const userType = member.type === PersonTypeEnum.DEALERSHIP ? 'Dealership' : 'Shop';
            const organizationId = member.type === PersonTypeEnum.DEALERSHIP ? member.dealership?.id : member.shop?.id;
            toast.success(t('team.view.deactivateSuccess'));
            onSuccess?.(userType, organizationId);
            resolve(true);
          },
          error: (error) => {
            reject(error);
          },
          else: (_statusCode, message) => {
            reject(new Error(message));
          },
        });
      });
    } catch (error) {
      toast.error(t('team.view.deactivateFailed'));
      console.error(error);
    }
  };

  const handleReactivate = async (member: TeamMember) => {
    try {
      await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: member.id,
          action: 'Reactivate',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            const userType = member.type === PersonTypeEnum.DEALERSHIP ? 'Dealership' : 'Shop';
            const organizationId = member.type === PersonTypeEnum.DEALERSHIP ? member.dealership?.id : member.shop?.id;
            toast.success(t('team.view.reactivateSuccess'));
            onSuccess?.(userType, organizationId);
            resolve(true);
          },
          error: (error) => {
            reject(error);
          },
          else: (_statusCode, message) => {
            reject(new Error(message));
          },
        });
      });
    } catch (error) {
      toast.error(t('team.view.reactivateFailed'));
      console.error(error);
    }
  };

  const handleApprove = async (member: TeamMember) => {
    try {
      await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: member.id,
          action: 'ApproveRegistrationRequest',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            toast.success(t('team.view.approveSuccess'));
            const userType = member.type === PersonTypeEnum.DEALERSHIP ? 'Dealership' : 'Shop';
            const organizationId = member.type === PersonTypeEnum.DEALERSHIP ? member.dealership?.id : member.shop?.id;
            onSuccess?.(userType, organizationId);
            resolve(true);
          },
          error: (error) => {
            reject(error);
          },
          else: (_statusCode, message) => {
            reject(new Error(message));
          },
        });
      });
    } catch (error) {
      toast.error(t('team.view.approveFailed'));
      console.error(error);
      return false;
    }
  };

  const handleReject = async (member: TeamMember) => {
    try {
      await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: member.id,
          action: 'DeclineRegistrationRequest',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            toast.success(t('team.view.rejectSuccess'));
            const userType = member.type === PersonTypeEnum.DEALERSHIP ? 'Dealership' : 'Shop';
            const organizationId = member.type === PersonTypeEnum.DEALERSHIP ? member.dealership?.id : member.shop?.id;
            onSuccess?.(userType, organizationId);
            resolve(true);
          },
          error: (error) => {
            reject(error);
          },
          else: (_statusCode, message) => {
            reject(new Error(message));
          },
        });
      });
    } catch (error) {
      toast.error(t('team.view.rejectFailed'));
      console.error(error);
      return false;
    }
  };

  const handleRejectClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsConfirmRejectOpen(true);
  };

  const handleConfirmReject = async () => {
    if (selectedMember) {
      await handleReject(selectedMember);
      setSelectedMember(null);
    }
  };

  const renderActionButtons = (member: TeamMember) => {
    switch (member.status) {
      case 'Active':
        return (
          <Button size="sm" variant="outline" onClick={() => handleDeactivate(member)}>
            <Pause className="mr-1 h-3.5 w-3.5" /> {t('team.view.deactivate')}
          </Button>
        );
      case 'Inactive':
        return (
          <Button size="sm" variant="outline" onClick={() => handleReactivate(member)}>
            <Play className="mr-1 h-3.5 w-3.5" /> {t('team.view.reactivate')}
          </Button>
        );
      case 'Pending':
        return <p className="text-red-400">{t('team.view.status.pending')}</p>;
      case 'RegistrationRequested':
        return (
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(member)}>
              <Check className="mr-1 h-3.5 w-3.5" /> {t('team.view.approve')}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleRejectClick(member)}>
              <XCircle className="mr-1 h-3.5 w-3.5" /> {t('team.view.reject')}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const getTeamTitle = () => {
    if (!teamMembers || teamMembers.length === 0) return t('team.view.title.default');
    const type = teamMembers[0].type;
    if (type === PersonTypeEnum.SHOP) return t('team.view.title.shop');
    if (type === PersonTypeEnum.DEALERSHIP) return t('team.view.title.dealer');
    if (type === PersonTypeEnum.CSR) return t('team.view.title.csr');
    if (type === PersonTypeEnum.FIELD_STAFF) return t('team.view.title.fieldStaff');
    return t('team.view.title.default');
  };

  const renderSortIcon = (field: keyof TeamMember) => {
    if (sortBy !== field) return null;
    return sortAscending ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-6xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl font-semibold">{getTeamTitle()}</DialogTitle>
          <Separator />
          <button
            onClick={handleClose}
            className="absolute transition-opacity rounded-sm focus:ring-ring top-4 right-4 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">{t('common.close')}</span>
          </button>
        </DialogHeader>
        <div className="flex-1 py-6 space-y-8 overflow-y-auto scroll-smooth">
          {/* Shop Information */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 text-lg font-medium">
              <Store className="w-6 h-6 text-foreground" />
              <h3>{t('team.view.shopInfo')}</h3>
            </div>
            <div className="grid grid-cols-1 gap-6 p-5 rounded-lg bg-muted/50 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('team.view.name')}</p>
                <p className="mt-1 text-base font-semibold">
                  {teamMembers?.[0]?.firstName} {teamMembers?.[0]?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('team.view.shopNumber')}</p>
                <p className="mt-1 text-base font-semibold">{teamMembers?.[0]?.shop?.shopNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('team.view.location')}</p>
                <p className="mt-1 text-base font-semibold">{teamMembers?.[0]?.shop?.address}</p>
              </div>
            </div>
          </section>
          <Separator />
          {/* Team Members */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 text-lg font-medium">
              <Users className="w-6 h-6 text-foreground" />
              <h3>{t('team.view.teamMembers')}</h3>
            </div>
            <div className="overflow-hidden border rounded-lg">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th 
                      className="px-4 py-3 text-sm font-medium text-left cursor-pointer select-none hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('firstName')}
                    >
                      {t('team.view.table.firstName')}
                      {renderSortIcon('firstName')}
                    </th>
                    <th 
                      className="px-4 py-3 text-sm font-medium text-left cursor-pointer select-none hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('lastName')}
                    >
                      {t('team.view.table.lastName')}
                      {renderSortIcon('lastName')}
                    </th>
                    <th 
                      className="px-4 py-3 text-sm font-medium text-left cursor-pointer select-none hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      {t('team.view.table.email')}
                      {renderSortIcon('email')}
                    </th>
                    <th 
                      className="px-4 py-3 text-sm font-medium text-left cursor-pointer select-none hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('dateCreated')}
                    >
                      {t('team.view.table.dateAdded')}
                      {renderSortIcon('dateCreated')}
                    </th>
                    <th 
                      className="px-4 py-3 text-sm font-medium text-left cursor-pointer select-none hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('dateLastAccess')}
                    >
                      {t('team.view.table.dateLastAccessed')}
                      {renderSortIcon('dateLastAccess')}
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-left">{/* Actions */}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedMembers &&
                    sortedMembers.length > 0 &&
                    sortedMembers.map((member, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-4 text-sm">{member.firstName}</td>
                        <td className="px-4 py-4 text-sm">{member.lastName}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{member.email}</td>
                        <td className="px-4 py-4 text-sm">
                          {(member.dateCreated && new Date(member.dateCreated).toLocaleDateString()) || '--'}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {(member.dateLastAccess && new Date(member.dateLastAccess).toLocaleDateString()) || '--'}
                        </td>
                        <td className="px-4 py-4 text-sm">{renderActionButtons(member)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <DialogFooter className="flex-shrink-0 gap-3 pt-4 mt-4 border-t">
          <Button onClick={handleClose}>{t('common.close')}</Button>
        </DialogFooter>
      </DialogContent>

      {/* Confirm Reject Dialog */}
      <ConfirmDialog
        open={isConfirmRejectOpen}
        onOpenChange={setIsConfirmRejectOpen}
        onConfirm={handleConfirmReject}
        title={t('common.confirmAction')}
        description={t('common.confirmDescription')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </Dialog>
  );
}
