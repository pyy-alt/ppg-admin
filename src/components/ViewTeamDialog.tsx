import { useState } from 'react';
import PersonStatusEnum from '@/js/models/enum/PersonStatusEnum';
import PersonTypeEnum, { type PersonType } from '@/js/models/enum/PersonTypeEnum';
import { X, Store, Users, Pause, Play, ChevronUp, ChevronDown, Check, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from './ui/button';
import PersonEditStatusRequest from '@/js/models/PersonEditStatusRequest';
import PersonApi from '@/js/clients/base/PersonApi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth-store';
import ConfirmDialog from '@/components/ConfirmDialog';

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
    name?: string;
    shopNumber: string;
    address: string;
    id: number;
  };
  dealership?: {
    name?: string;
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
  onSortChange?: (sortBy: string, sortAscending: boolean) => void;
  currentSortBy?: string;
  currentSortAscending?: boolean;
}

export default function ViewTeamDialog({ 
  open, 
  onOpenChange, 
  teamMembers, 
  onSuccess,
  onSortChange,
  currentSortBy = 'firstName',
  currentSortAscending = true
}: ViewDealerTeamDialogProps) {
  const { t } = useTranslation();
  const { auth } = useAuthStore();
  const userType = auth.user?.person?.type as PersonType | undefined;
  const isAdmin = userType === 'ProgramAdministrator';

  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  
  // 使用父组件传递的排序状态，如果没有则使用本地状态
  const sortBy = currentSortBy;
  const sortAscending = currentSortAscending;

  const handleSort = (field: keyof TeamMember) => {
    let newSortBy = field as string;
    let newSortAscending = true;
    
    
    if (sortBy === field) {
      if (sortAscending) {
        // 当前是升序 → 第二次点击：切换为降序
        newSortAscending = false;
      } else {
        // 当前是降序 → 第三次点击：恢复默认排序
        newSortBy = 'firstName';
        newSortAscending = true;
      }
    } else {
      // 点击新字段 → 第一次点击：按该字段升序排序
      newSortBy = field as string;
      newSortAscending = true;
    }
    
    
    // 如果有排序回调，调用它（触发父组件重新获取数据）
    if (onSortChange) {
      console.log('Calling onSortChange');
      onSortChange(newSortBy, newSortAscending);
    } else {
      console.warn('onSortChange callback not provided!');
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
            const userType = member.type === PersonTypeEnum.DEALERSHIP ? 'Dealership' : 'Shop';
            const organizationId = member.type === PersonTypeEnum.DEALERSHIP ? member.dealership?.id : member.shop?.id;
            toast.success(t('team.dialog.approveSuccess'));
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
      toast.error(t('team.dialog.approveFailed'));
      console.error(error);
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
            const userType = member.type === PersonTypeEnum.DEALERSHIP ? 'Dealership' : 'Shop';
            const organizationId = member.type === PersonTypeEnum.DEALERSHIP ? member.dealership?.id : member.shop?.id;
            toast.success(t('team.dialog.rejectSuccess'));
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
      toast.error(t('team.dialog.rejectFailed'));
      console.error(error);
    }
  };

  const handleRejectClick = (member: TeamMember) => {
    setSelectedMemberId(member.id);
    setIsConfirmRejectOpen(true);
  };

  const handleConfirmReject = async () => {
    if (selectedMemberId !== null) {
      const member = teamMembers?.find(m => m.id === selectedMemberId);
      if (member) {
        await handleReject(member);
        setSelectedMemberId(null);
      }
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

  // 直接显示传入的数据，不再前端排序
  const sortedMembers = teamMembers || [];

  const renderSortIcon = (field: keyof TeamMember) => {
    const isActive = sortBy === field;
    
    if (isActive) {
      return sortAscending ? <ChevronUp className="inline w-4 h-4 ml-1" /> : <ChevronDown className="inline w-4 h-4 ml-1" />;
    }
    
    // 未激活状态显示上下排列的双向箭头（使用灰色）
    return (
      <svg width="10" height="16" viewBox="0 0 10 16" className="inline ml-1 opacity-50">
        <path d="M5 3 L8 6 L2 6 Z" fill="currentColor" />
        <path d="M5 13 L8 10 L2 10 Z" fill="currentColor" />
      </svg>
    );
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
                  {teamMembers?.[0]?.shop?.name || teamMembers?.[0]?.dealership?.name || '--'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('team.view.shopNumber')}</p>
                <p className="mt-1 text-base font-semibold">
                  {teamMembers?.[0]?.shop?.shopNumber || teamMembers?.[0]?.dealership?.dealershipNumber || '--'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('team.view.location')}</p>
                <p className="mt-1 text-base font-semibold">
                  {teamMembers?.[0]?.shop?.address || teamMembers?.[0]?.dealership?.address || '--'}
                </p>
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
                    <th className="px-4 py-3 text-sm font-medium text-left">
                      {/* Actions 列，不显示标题 */}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedMembers &&
                    sortedMembers.length > 0 &&
                    sortedMembers.map((member, idx) => (
                      <tr 
                        key={idx} 
                        className={`transition-colors hover:bg-muted/30 ${member.status === 'Inactive' ? 'text-gray-400' : ''}`}
                      >
                        <td className="px-4 py-4 text-sm">{member.firstName}</td>
                        <td className="px-4 py-4 text-sm">{member.lastName}</td>
                        <td className="px-4 py-4 text-sm">{member.email}</td>
                        <td className="px-4 py-4 text-sm">
                          {(member.dateCreated && new Date(member.dateCreated).toLocaleDateString()) || '--'}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {member.status === 'Pending' ? (
                            <span className="text-muted-foreground">{t('team.view.status.pendingCompletion')}</span>
                          ) : member.status === 'RegistrationRequested' && isAdmin ? (
                            // 只有需要审核时，Approve/Reject 按钮显示在 Date Last Accessed 列
                            <div className="flex flex-row gap-2 ">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(member)}>
                                <Check className="mr-1 h-3.5 w-3.5" /> {t('team.button.approve')}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectClick(member)}>
                                <XCircle className="mr-1 h-3.5 w-3.5" /> {t('team.button.reject')}
                              </Button>
                            </div>
                          ) : member.status === 'RegistrationRequested' ? (
                            <span className="text-muted-foreground">{t('team.view.status.pendingApproval')}</span>
                          ) : member.status === 'Active' || member.status === 'Inactive' ? (
                            // Active 或 Inactive 状态时，显示 Date Last Accessed 日期
                            (member.dateLastAccess && new Date(member.dateLastAccess).toLocaleDateString()) || '--'
                          ) : (
                            (member.dateLastAccess && new Date(member.dateLastAccess).toLocaleDateString()) || '--'
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {/* Actions 列：只有 Active 或 Inactive 状态时显示按钮 */}
                          {member.status === 'Active' ? (
                            <Button size="sm" variant="outline" onClick={() => handleDeactivate(member)}>
                              <Pause className="mr-1 h-3.5 w-3.5" /> {t('team.view.deactivate')}
                            </Button>
                          ) : member.status === 'Inactive' ? (
                            <Button size="sm" variant="outline" onClick={() => handleReactivate(member)}>
                              <Play className="mr-1 h-3.5 w-3.5" /> {t('team.view.reactivate')}
                            </Button>
                          ) : null}
                        </td>
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

