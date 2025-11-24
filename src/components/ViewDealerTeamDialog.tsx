import { X, Store, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface TeamMember {
  firstName: string
  lastName: string
  email: string
  dateAdded: string
  dateLastAccessed: string | null
  status?: 'pending' // 可选：待审批状态
}

interface ViewDealerTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shopName?: string
  shopNumber?: string
  location?: string
  teamMembers?: TeamMember[]
}

const defaultData = {
  shopName: 'Sunset Auto Collision',
  shopNumber: '2458',
  location: 'Los Angeles, CA',
  teamMembers: [
    {
      firstName: 'Daniel',
      lastName: 'Mercer',
      email: 'daniel.mercer@sunsetauto.com',
      dateAdded: '6/10/2024',
      dateLastAccessed: '9/18/2025',
    },
    {
      firstName: 'Jake',
      lastName: 'Renshaw',
      email: 'jake.renshaw@sunsetauto.com',
      dateAdded: '6/12/2024',
      dateLastAccessed: '9/20/2025',
    },
    {
      firstName: 'Olivia',
      lastName: 'Stanton',
      email: 'olivia.stanton@sunsetauto.com',
      dateAdded: '9/24/2025',
      dateLastAccessed: null,
      status: 'pending' as const,
    },
  ],
}

export default function ViewDealerTeamDialog({
  open,
  onOpenChange,
  shopName = defaultData.shopName,
  shopNumber = defaultData.shopNumber,
  location = defaultData.location,
  teamMembers = defaultData.teamMembers,
}: ViewDealerTeamDialogProps) {
  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-h-screen overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>
            View Dealer Team
          </DialogTitle>
          <button
            onClick={handleClose}
            className='focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </button>
        </DialogHeader>

        <div className='mt-6 space-y-8'>
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
                <p className='mt-1 text-base font-semibold'>{shopName}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Shop #
                </p>
                <p className='mt-1 text-base font-semibold'>{shopNumber}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm font-medium'>
                  Location
                </p>
                <p className='mt-1 text-base font-semibold'>{location}</p>
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
                  {teamMembers.map((member, idx) => (
                    <tr
                      key={idx}
                      className='hover:bg-muted/30 transition-colors'
                    >
                      <td className='px-4 py-4 text-sm'>{member.firstName}</td>
                      <td className='px-4 py-4 text-sm'>{member.lastName}</td>
                      <td className='text-muted-foreground px-4 py-4 font-mono text-sm'>
                        {member.email}
                      </td>
                      <td className='px-4 py-4 text-sm'>{member.dateAdded}</td>
                      <td className='px-4 py-4 text-sm'>
                        {member.dateLastAccessed ?? '—'}
                      </td>
                      <td className='px-4 py-4 text-sm'>
                        {member.status === 'pending' && (
                          <Badge variant='destructive' className='text-xs'>
                            Pending Approval
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
        <div className='mt-8 flex justify-end'>
          <button
            onClick={handleClose}
            className='rounded(md ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
