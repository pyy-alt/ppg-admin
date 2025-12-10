// src/components/layout/Header.tsx
import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import PersonApi from '@/js/clients/base/PersonApi'
import PersonSearchRequest from '@/js/models/PersonSearchRequest'
import { LogOut, Users, UserPen } from 'lucide-react'
import logoImg from '@/assets/img/logo.svg'
import { useAuthStore } from '@/stores/auth-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import EditProfileDialog from '@/components/EditProfileDialog'
import ViewAdminTeamDialog from '../AdminViewTeamDialog'
import { LanguageDropdown } from '../LanguageDropdown'
import ViewTeamDialog, { type TeamMember } from '../ViewTeamDialog'
import PersonTypeEnum from '@/js/models/enum/PersonTypeEnum'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  isShowUser?: boolean
}

export function Header({
  className,
  fixed,
  isShowUser = true,
  ...props
}: HeaderProps) {
  const router = useRouter()
  const { auth } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [isShowTeam, setIsShowTeam] = useState(false)
  const [isShowAdminTeam, setIsShowAdminTeam] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const getTeamMembers = async () => {
    const isAdmin = auth.user?.person?.type === PersonTypeEnum.PROGRAM_ADMINISTRATOR
   
    try {
      const personApi = new PersonApi()
      const request = PersonSearchRequest.create({
        // 如果user.person.type是ProgramAdministrator，则type为Network，否则为Shop或Dealership
        type: isAdmin ? 'Network' : auth.user?.person?.type as 'Shop' | 'Dealership' | 'Network',
        organizationId:
          auth.user?.person?.type === 'Shop'
            ? auth.user?.person?.shop?.id
            : auth.user?.person?.type === 'Dealership'
              ? auth.user?.person?.dealership?.id
              : undefined,
      })

      personApi.search(request, {
        status200: (data) => {
          if (isAdmin) {
            setIsShowAdminTeam(true)
          } else {
            setIsShowTeam(true)
          }
          setTeamMembers(data.persons)
        },
        error: (error) => {
          console.error('Person search error:', error)
        },
        else: (statusCode, message) => {
          console.error('Unhandled search response:', statusCode, message)
        },
      })
    } catch (error) {
      console.error(error)
    }
  }
  const handleSelect = (item: 'team' | 'profile' | 'logout') => {
    switch (item) {
      case 'team':
        // setIsShowTeam(true)
        // 管理员
        getTeamMembers()
        break
      case 'profile':
        setOpen(true)
        break
      case 'logout':
        handleLogout()
        break
      default:
        break
    }
  }
  // logout
  const handleLogout = () => {
    const authApi = new AuthenticationApi()
    authApi.logout({
      status200: () => {
        auth.reset()
        router.navigate({ to: '/login' })
      },
    })
  }
  return (
    <>
      <header
        className={`bg-header fixed top-0 right-0 left-0 z-50 flex h-16 w-full items-center justify-between px-6 text-white ${className || ''} `}
        {...props}
      >
        {/* Left: Logo + Title */}
        <div className='flex items-center gap-4'>
          <img
            src={logoImg}
            alt='Audi'
            className='hover: h-20 w-20 cursor-pointer object-contain'
            onClick={() => router.navigate({ to: '/' })}
          />
          <div>
            <span className='mr-2 text-sm font-medium text-red-500'>Audi</span>
            <span className='text-sm font-medium text-white'>
              Restricted Parts Tracker.
            </span>
          </div>
        </div>

        {/* Right: Globe + User Dropdown */}
        <div className='flex items-center gap-4'>
          {/* User Dropdown */}
          {isShowUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='flex items-center justify-center gap-3 rounded-full pr-2 transition-colors hover:bg-white/10'>
                  <div className='text-left text-white'>
                    <p className='text-sm leading-none font-medium'>
                      {auth.user
                        ? `${auth.user.person?.firstName} ${auth.user.person?.lastName}`.trim() ||
                          auth.user.person?.email
                        : 'User'}
                    </p>
                    <p className='text-xs text-gray-400'>
                      {auth.user
                        ? auth.user.person?.shop?.name &&
                          auth.user.person?.shop?.shopNumber
                          ? `${auth.user.person?.shop?.name}(${auth.user.person?.shop?.shopNumber}) | ${auth.user.person?.type}`
                          : auth.user.person?.dealership?.name &&
                              auth.user.person?.dealership?.dealershipNumber
                            ? `${auth.user.person?.dealership?.name}(${auth.user.person?.dealership?.dealershipNumber}) | ${auth.user.person?.type}`
                            : auth.user.person?.type
                        : 'Not logged in'}
                    </p>
                  </div>
                  <svg
                    className='h-4 w-4 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>
              </DropdownMenuTrigger>

              {/* 菜单右对齐 */}
              <DropdownMenuContent align='end' className='mt-2 w-56'>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium'>
                      {auth.user
                        ? `${auth.user.person?.firstName} ${auth.user.person?.lastName}`.trim() ||
                          auth.user.person?.email
                        : 'User'}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {auth.user
                        ? auth.user.person?.shop?.name &&
                          auth.user.person?.shop?.shopNumber
                          ? `${auth.user.person?.shop?.name}(${auth.user.person?.shop?.shopNumber}) | ${auth.user.person?.type}`
                          : auth.user.person?.dealership?.name &&
                              auth.user.person?.dealership?.dealershipNumber
                            ? `${auth.user.person?.dealership?.name}(${auth.user.person?.dealership?.dealershipNumber}) | ${auth.user.person?.type}`
                            : auth.user.person?.type
                        : 'Not logged in'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='cursor-pointer'
                  onSelect={() => handleSelect('team')}
                >
                  <Users className='mr-2 h-4 w-4' />
                  <span>View Team</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='cursor-pointer'
                  onSelect={() => handleSelect('profile')}
                >
                  <UserPen className='mr-2 h-4 w-4' />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='cursor-pointer text-red-600 focus:text-red-600'
                  onSelect={() => handleSelect('logout')}
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Language Globe */}
          <div className='rounded-full p-2 text-white transition-colors hover:bg-white/10'>
            <LanguageDropdown />
          </div>
        </div>
      </header>
      <EditProfileDialog open={open} onOpenChange={setOpen} />
      <ViewTeamDialog
        teamMembers={teamMembers}
        open={isShowTeam}
        onOpenChange={setIsShowTeam}
      />
      <ViewAdminTeamDialog
        teamMembers={teamMembers}
        open={isShowAdminTeam}
        onOpenChange={setIsShowAdminTeam}
        onSuccess={getTeamMembers}
        onError={(error) => {
          console.error('Failed to get team members:', error)
        }}
      />
    </>
  )
}
