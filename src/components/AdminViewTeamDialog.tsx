import { useState } from 'react'
import { X, Users, Check, XCircle, Pause, Play } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type MemberStatus =
  | 'active'
  | 'inactive'
  | 'pending_approval'
  | 'pending_completion'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  dateAdded: string
  dateLastAccessed: string | null
  status: MemberStatus
}

const initialMembers: TeamMember[] = [
  {
    id: '1',
    firstName: 'Daniel',
    lastName: 'Mercer',
    email: 'daniel.mercer@sunsetauto.com',
    dateAdded: '6/10/2024',
    dateLastAccessed: '9/18/2025',
    status: 'active',
  },
  {
    id: '2',
    firstName: 'Jake',
    lastName: 'Renshaw',
    email: 'jake.renshaw@sunsetauto.com',
    dateAdded: '6/12/2024',
    dateLastAccessed: '9/20/2025',
    status: 'inactive',
  },
  {
    id: '3',
    firstName: 'Olivia',
    lastName: 'Stanton',
    email: 'olivia.stanton@sunsetauto.com',
    dateAdded: '9/24/2025',
    dateLastAccessed: '9/24/2025',
    status: 'pending_approval',
  },
]

export default function AdminViewTeamDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleClose = () => onOpenChange(false)

  const handleDeactivate = async (id: string) => {
    setLoadingId(id)
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 800))
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'inactive' } : m))
    )
    setLoadingId(null)
    toast.success('Member deactivated')
  }

  const handleReactivate = async (id: string) => {
    setLoadingId(id)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'active' } : m))
    )
    setLoadingId(null)
    toast.success('Member reactivated')
  }

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: 'pending_completion' } : m
      )
    )
    setLoadingId(null)
    toast.success('Member approved')
  }

  const handleReject = async (id: string) => {
    setLoadingId(id)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setMembers((prev) => prev.filter((m) => m.id !== id))
    setLoadingId(null)
    toast.error('Member rejected')
  }

  const getStatusDisplay = (status: MemberStatus) => {
    switch (status) {
      case 'pending_completion':
        return (
          <span className='text-destructive font-medium'>
            Pending Completion
          </span>
        )
      default:
        return null
    }
  }

  const renderActionButtons = (member: TeamMember) => {
    if (loadingId === member.id) {
      return (
        <Button size='sm' disabled>
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
        </Button>
      )
    }

    switch (member.status) {
      case 'active':
        return (
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleDeactivate(member.id)}
          >
            <Pause className='mr-1 h-3.5 w-3.5' /> Deactivate
          </Button>
        )
      case 'inactive':
        return (
          <Button
            size='sm'
            variant='outline'
            onClick={() => handleReactivate(member.id)}
          >
            <Play className='mr-1 h-3.5 w-3.5' /> Reactivate
          </Button>
        )
      case 'pending_approval':
        return (
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='default'
              className='bg-green-600 hover:bg-green-700'
              onClick={() => handleApprove(member.id)}
            >
              <Check className='mr-1 h-3.5 w-3.5' /> Approve
            </Button>
            <Button
              size='sm'
              variant='destructive'
              onClick={() => handleReject(member.id)}
            >
              <XCircle className='mr-1 h-3.5 w-3.5' /> Reject
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-h-screen overflow-y-auto sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3 text-2xl font-semibold'>
            <Users className='h-7 w-7' />
            Program Admin View of Team Members
          </DialogTitle>
          <button
            onClick={handleClose}
            className='focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </button>
        </DialogHeader>

        <div className='mt-6'>
          <p className='text-muted-foreground mb-6 text-sm'>
            When Admin view Shop/Dealer Team Members, the Approve and Reject
            button appear if a member needs to be approved/rejected.
          </p>

          <div className='overflow-hidden rounded-lg border'>
            <table className='w-full'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='px-6 py-4 text-left text-sm font-medium'>
                    First Name
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-medium'>
                    Last Name
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-medium'>
                    Email
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-medium'>
                    Date Added
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-medium'>
                    Date Last Accessed
                  </th>
                  <th className='px-6 py-4 text-left text-sm font-medium'>
                    Status / Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-border divide-y'>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className='hover:bg-muted/30 transition-colors'
                  >
                    <td className='px-6 py-4 font-medium'>
                      {member.firstName}
                    </td>
                    <td className='px-6 py-4'>{member.lastName}</td>
                    <td className='text-muted-foreground px-6 py-4 font-mono text-sm'>
                      {member.email}
                    </td>
                    <td className='px-6 py-4 text-sm'>{member.dateAdded}</td>
                    <td className='px-6 py-4 text-sm'>
                      {member.dateLastAccessed || '—'}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        {getStatusDisplay(member.status)}
                        {renderActionButtons(member)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-8 flex justify-end'>
            <Button variant='outline' onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
