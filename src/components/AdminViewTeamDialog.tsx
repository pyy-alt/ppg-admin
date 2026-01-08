import { useEffect, useState } from 'react';
import PersonApi from '@/js/clients/base/PersonApi';
import PersonEditStatusRequest from '@/js/models/PersonEditStatusRequest';
import type { PersonStatus } from '@/js/models/enum/PersonStatusEnum';
import { X, Users, Check, XCircle, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '@/components/ConfirmDialog';

interface TeamMember {
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
  };
  dealership?: {
    dealershipNumber: string;
    address: string;
  };
}

interface AdminViewTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers?: TeamMember[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function AdminViewTeamDialog({ open, onOpenChange, teamMembers, onSuccess }: AdminViewTeamDialogProps) {
  const { t } = useTranslation(); // 新增：获取 t 函数

  const [members, setMembers] = useState<TeamMember[]>(teamMembers ?? []);
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  useEffect(() => {
    if (teamMembers) setMembers(teamMembers);
  }, [teamMembers]);

  const handleClose = () => onOpenChange(false);

  const handleDeactivate = async (id: number) => {
    try {
      return await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: id,
          action: 'Deactivate',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            toast.success(t('team.dialog.deactivateSuccess'));
            onSuccess?.();
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
      toast.error(t('team.dialog.deactivateFailed'));
      console.error(error);
    }
  };

  const handleReactivate = async (id: number) => {
    try {
      return await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: id,
          action: 'Reactivate',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            toast.success(t('team.dialog.reactivateSuccess'));
            onSuccess?.();
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
      toast.error(t('team.dialog.reactivateFailed'));
      console.error(error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      return await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: id,
          action: 'ApproveRegistrationRequest',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            toast.success(t('team.dialog.approveSuccess'));
            onSuccess?.();
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
      return false;
    }
  };

  const handleReject = async (id: number) => {
    try {
      return await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: id,
          action: 'DeclineRegistrationRequest',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            toast.success(t('team.dialog.rejectSuccess'));
            onSuccess?.();
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
      return false;
    }
  };

  const handleRejectClick = (id: number) => {
    setSelectedMemberId(id);
    setIsConfirmRejectOpen(true);
  };

  const handleConfirmReject = async () => {
    if (selectedMemberId !== null) {
      await handleReject(selectedMemberId);
      setSelectedMemberId(null);
    }
  };

  const renderActionButtons = (member: TeamMember) => {
    switch (member.status) {
      case 'Active':
        return (
          <Button size="sm" variant="outline" onClick={() => handleDeactivate(member.id)}>
            <Pause className="mr-1 h-3.5 w-3.5" /> {t('team.button.deactivate')}
          </Button>
        );
      case 'Inactive':
        return (
          <Button size="sm" variant="outline" onClick={() => handleReactivate(member.id)}>
            <Play className="mr-1 h-3.5 w-3.5" /> {t('team.button.reactivate')}
          </Button>
        );
      case 'Pending':
        return <p className="text-red-400">{t('team.status.pending')}</p>;
      case 'RegistrationRequested':
        return (
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(member.id)}>
              <Check className="mr-1 h-3.5 w-3.5" /> {t('team.button.approve')}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleRejectClick(member.id)}>
              <XCircle className="mr-1 h-3.5 w-3.5" /> {t('team.button.reject')}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-7xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl font-semibold">
            <Users className="h-7 w-7" />
            {t('team.dialog.title')}
          </DialogTitle>
          <button
            onClick={handleClose}
            className="absolute transition-opacity rounded-sm focus:ring-ring top-4 right-4 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">{t('common.close')}</span>
          </button>
        </DialogHeader>
        <div className="flex-1 py-6 space-y-8 overflow-y-auto scroll-smooth">
          <p className="mb-6 text-sm text-muted-foreground">{t('team.dialog.description')}</p>
          <div className="overflow-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-sm font-medium text-left">{t('team.table.firstName')}</th>
                  <th className="px-6 py-4 text-sm font-medium text-left">{t('team.table.lastName')}</th>
                  <th className="px-6 py-4 text-sm font-medium text-left">{t('team.table.email')}</th>
                  <th className="px-6 py-4 text-sm font-medium text-left">{t('team.table.dateAdded')}</th>
                  <th className="px-6 py-4 text-sm font-medium text-left">{t('team.table.dateLastAccessed')}</th>
                  <th className="px-6 py-4 text-sm font-medium text-left">{/* Status / Actions */}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => (
                  <tr key={member.id} className="transition-colors hover:bg-muted/30">
                    <td className={member.status === 'Inactive' ? 'text-gray-400' : 'px-6 py-4 font-medium'}>
                      {member.firstName}
                    </td>
                    <td className="px-6 py-4">{member.lastName}</td>
                    <td className="px-6 py-4 text-sm">{member.email}</td>
                    <td className="px-6 py-4 text-sm">{member.dateAdded}</td>
                    <td className="px-6 py-4 text-sm">{member.dateLastAccessed || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">{renderActionButtons(member)}</div>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-sm text-center text-muted-foreground">
                      {t('team.table.noMembers')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
