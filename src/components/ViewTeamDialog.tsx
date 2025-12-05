import PersonStatusEnum from '@/js/models/enum/PersonStatusEnum'
import PersonTypeEnum, { PersonType } from '@/js/models/enum/PersonTypeEnum'
import { X, Store, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from './ui/button'

type PersonStatus = (typeof PersonStatusEnum)[keyof typeof PersonStatusEnum]

export interface TeamMember {
  firstName: string
  lastName: string
  email: string
  dateAdded: string
  dateLastAccessed: string | null
  dateCreated: string
  dateLastAccess: string | null
  status?: PersonStatus
  shop?: {
    shopNumber: string
    address: string
  }
  dealership?: {
    dealershipNumber: string
    address: string
  }
  type?: PersonType
}

interface ViewDealerTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopName?: string
  shopNumber?: string
  location?: string
  teamMembers?: TeamMember[]
}
export default function ViewTeamDialog({
  open,
  onOpenChange,
  teamMembers,
}: ViewDealerTeamDialogProps) {
  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[90vh] flex-col sm:max-w-4xl'>
        <DialogHeader className='shrink-0'>
          {teamMembers ? (
            teamMembers.length > 0 ? (
              <DialogTitle className='text-2xl font-semibold'>
                {teamMembers?.[0].type === PersonTypeEnum.SHOP &&
                  'View Shop Team'}
                {teamMembers?.[0].type === PersonTypeEnum.DEALERSHIP &&
                  'View Dealer Team'}
                {teamMembers?.[0].type === PersonTypeEnum.CSR &&
                  'View CSR Team'}
                {teamMembers?.[0].type === PersonTypeEnum.FIELD_STAFF &&
                  'View Field Staff Team'}
              </DialogTitle>
            ) : (
              <DialogTitle className='text-2xl font-semibold'>
                View Team
              </DialogTitle>
            )
          ) : null}
          <Separator />
          <button
            onClick={handleClose}
            className='focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </button>
        </DialogHeader>

        <div className='flex-1 space-y-8 overflow-y-auto scroll-smooth py-6'>
          {/* Shop Information */}
          <section className='space-y-5'>
            <div className='flex items-center gap-3 text-lg font-medium'>
              <Store className='text-foreground h-6 w-6' />
              <h3>Shop Information</h3>
            </div>

            <div className='bg-muted/50 grid grid-cols-1 gap-6 rounded-lg p-5 md:grid-cols-3'>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Name
                </p>
                <p className='mt-1 text-base font-semibold'>
                  {teamMembers?.[0]?.firstName} {teamMembers?.[0]?.lastName}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Shop #
                </p>
                <p className='mt-1 text-base font-semibold'>
                  {teamMembers?.[0]?.shop?.shopNumber}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Location
                </p>
                <p className='mt-1 text-base font-semibold'>
                  {teamMembers?.[0]?.shop?.address}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Team Members */}
          <section className='space-y-5'>
            <div className='flex items-center gap-3 text-lg font-medium'>
              <Users className='text-foreground h-6 w-6' />
              <h3>Team Members</h3>
            </div>

            <div className='overflow-hidden rounded-lg border'>
              <table className='w-full'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      First Name
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Last Name
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Email
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Date Added
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Date Last Accessed
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-border divide-y'>
                  {teamMembers &&
                    teamMembers?.length > 0 &&
                    teamMembers.map((member, idx) => (
                      <tr
                        key={idx}
                        className='hover:bg-muted/30 transition-colors'
                      >
                        <td className='px-4 py-4 text-sm'>
                          {member.firstName}
                        </td>
                        <td className='px-4 py-4 text-sm'>{member.lastName}</td>
                        <td className='text-muted-foreground px-4 py-4 font-mono text-sm'>
                          {member.email}
                        </td>
                        <td className='px-4 py-4 text-sm'>
                          {(member.dateCreated &&
                            new Date(
                              member.dateCreated
                            ).toLocaleDateString()) ||
                            '--'}
                        </td>
                        <td className='px-4 py-4 text-sm'>
                          {(member.dateLastAccess &&
                            new Date(
                              member.dateLastAccess
                            ).toLocaleDateString()) ||
                            '--'}
                        </td>
                        <td className='px-4 py-4 text-sm'>
                          {member.status === PersonStatusEnum.PENDING && (
                            <Badge variant='destructive' className='text-xs'>
                              Pending Approval
                            </Badge>
                          )}

                          {member.status ===
                            PersonStatusEnum.REGISTRATION_REQUESTED && (
                            <Badge variant='destructive' className='text-xs'>
                              Registration Requested
                            </Badge>
                          )}

                          {member.status === PersonStatusEnum.ACTIVE && (
                            <Badge variant='outline' className='text-xs'>
                              Active
                            </Badge>
                          )}

                          {member.status === PersonStatusEnum.INACTIVE && (
                            <Badge variant='secondary' className='text-xs'>
                              Inactive
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 底部关闭按钮（与 EditProfileDialog 保持一致） */}
        <div className='-mx-6 flex-1 overflow-y-auto scroll-smooth px-6 py-4'></div>
        <DialogFooter className='mt-4 flex-shrink-0 gap-3 border-t pt-4'>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
