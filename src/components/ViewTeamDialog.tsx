import PersonStatusEnum from '@/js/models/enum/PersonStatusEnum';
import PersonTypeEnum, { type PersonType } from '@/js/models/enum/PersonTypeEnum';
import { X, Store, Users, Pause, Play, Check, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from './ui/button';
import PersonEditStatusRequest from '@/js/models/PersonEditStatusRequest';
import PersonApi from '@/js/clients/base/PersonApi';
import { toast } from 'sonner';

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
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDeactivate = async (member: TeamMember) => {
    try {
      return await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: member.id,
          action: 'Deactivate',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            const userType = member.type === PersonTypeEnum.DEALERSHIP ? 'Dealership' : 'Shop';
            const organizationId = member.type === PersonTypeEnum.DEALERSHIP ? member.dealership?.id : member.shop?.id;
            toast.success('Member deactivated successfully');
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
      toast.error('Failed to deactivate member');
      console.error(error);
    }
  };

  const handleReactivate = async (member: TeamMember) => {
    try {
      return await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: member.id,
          action: 'Reactivate',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            const userType = member.type === PersonTypeEnum.DEALERSHIP ? 'Dealership' : 'Shop';
            const organizationId = member.type === PersonTypeEnum.DEALERSHIP ? member.dealership?.id : member.shop?.id;
            resolve(true);
            onSuccess?.(userType, organizationId);
            toast.success('Member reactivated successfully');
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
      toast.error('Failed to reactivate member');
      console.error(error);
    }
  };

  const handleApprove = async (member: TeamMember) => {
    try {
      return await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: member.id,
          action: 'ApproveRegistrationRequest',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            toast.success('Member approved successfully');
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
      toast.error('Failed to approve member');
      console.error(error);
      return false;
    }
  };

  const handleReject = async (member: TeamMember) => {
    try {
      return await new Promise((resolve, reject) => {
        const request = PersonEditStatusRequest.create({
          personId: member.id,
          action: 'DeclineRegistrationRequest',
        });
        const personApi = new PersonApi();
        personApi.editStatus(request, {
          status200: () => {
            toast.success('Member rejected successfully');
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
      toast.error('Failed to reject member');
      console.error(error);
      return false;
    }
  };
  const renderActionButtons = (member: TeamMember) => {
    switch (member.status) {
      case 'Active':
        return (
          <Button size="sm" variant="outline" onClick={() => handleDeactivate(member)}>
            <Pause className="mr-1 h-3.5 w-3.5" /> Deactivate
          </Button>
        );
      case 'Inactive':
        return (
          <Button size="sm" variant="outline" onClick={() => handleReactivate(member)}>
            <Play className="mr-1 h-3.5 w-3.5" /> Reactivate
          </Button>
        );
      case 'Pending':
        return <p className="text-red-400">Pending Completion</p>;
      case 'RegistrationRequested':
        return (
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(member)}>
              <Check className="mr-1 h-3.5 w-3.5" /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleReject(member)}>
              <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-6xl">
        <DialogHeader className="shrink-0">
          {teamMembers ? (
            teamMembers.length > 0 ? (
              <DialogTitle className="text-2xl font-semibold">
                {teamMembers?.[0].type === PersonTypeEnum.SHOP && 'View Shop Team'}
                {teamMembers?.[0].type === PersonTypeEnum.DEALERSHIP && 'View Dealer Team'}
                {teamMembers?.[0].type === PersonTypeEnum.CSR && 'View CSR Team'}
                {teamMembers?.[0].type === PersonTypeEnum.FIELD_STAFF && 'View Field Staff Team'}
              </DialogTitle>
            ) : (
              <DialogTitle className="text-2xl font-semibold">View Team</DialogTitle>
            )
          ) : null}
          <Separator />
          <button
            onClick={handleClose}
            className="absolute transition-opacity rounded-sm focus:ring-ring top-4 right-4 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogHeader>

        <div className="flex-1 py-6 space-y-8 overflow-y-auto scroll-smooth">
          {/* Shop Information */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 text-lg font-medium">
              <Store className="w-6 h-6 text-foreground" />
              <h3>Shop Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 p-5 rounded-lg bg-muted/50 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="mt-1 text-base font-semibold">
                  {teamMembers?.[0]?.firstName} {teamMembers?.[0]?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shop #</p>
                <p className="mt-1 text-base font-semibold">{teamMembers?.[0]?.shop?.shopNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="mt-1 text-base font-semibold">{teamMembers?.[0]?.shop?.address}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Team Members */}
          <section className="space-y-5">
            <div className="flex items-center gap-3 text-lg font-medium">
              <Users className="w-6 h-6 text-foreground" />
              <h3>Team Members</h3>
            </div>

            <div className="overflow-hidden border rounded-lg">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-left">First Name</th>
                    <th className="px-4 py-3 text-sm font-medium text-left">Last Name</th>
                    <th className="px-4 py-3 text-sm font-medium text-left">Email</th>
                    <th className="px-4 py-3 text-sm font-medium text-left">Date Added</th>
                    <th className="px-4 py-3 text-sm font-medium text-left">Date Last Accessed</th>
                    <th className="px-4 py-3 text-sm font-medium text-left">{/* Status */}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teamMembers &&
                    teamMembers?.length > 0 &&
                    teamMembers.map((member, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-4 text-sm">{member.firstName}</td>
                        <td className="px-4 py-4 text-sm">{member.lastName}</td>
                        <td className="px-4 py-4 font-mono text-sm text-muted-foreground">{member.email}</td>
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

        {/* Bottom close button（with EditProfileDialog Keep consistent） */}
        <div className="flex-1 px-6 py-4 -mx-6 overflow-y-auto scroll-smooth"></div>
        <DialogFooter className="flex-shrink-0 gap-3 pt-4 mt-4 border-t">
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
