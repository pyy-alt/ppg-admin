// src/components/Header.tsx
import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import AuthenticationApi from '@/js/clients/base/AuthenticationApi';
import PersonApi from '@/js/clients/base/PersonApi';
import PersonSearchRequest from '@/js/models/PersonSearchRequest';
import PersonTypeEnum from '@/js/models/enum/PersonTypeEnum';
import { LogOut, Users, UserPen } from 'lucide-react';
import audiLogo from '@/assets/img/audi.svg';
import vwLogo from '@/assets/img/vw.png';
import { useAuthStore } from '@/stores/auth-store';
import { useBrand } from '@/context/brand-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EditProfileDialog from '@/components/EditProfileDialog';
import ViewAdminTeamDialog from '../AdminViewTeamDialog';
import { LanguageDropdown } from '../LanguageDropdown';
import ViewTeamDialog, { type TeamMember } from '../ViewTeamDialog';
import ResultParameter from '@/js/models/ResultParameter';
import { useTranslation } from 'react-i18next'; // 新增导入

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
  isShowUser?: boolean;
};

export function Header({ className, fixed, isShowUser = true, ...props }: HeaderProps) {
  const { t } = useTranslation(); // 新增：获取 t 函数

  const router = useRouter();
  const { auth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [isShowTeam, setIsShowTeam] = useState(false);
  const [isShowAdminTeam, setIsShowAdminTeam] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const { brand } = useBrand();

  const logo = brand === 'vw' ? vwLogo : audiLogo;

  const getTeamMembers = async () => {
    const isAdmin = auth.user?.person?.type === PersonTypeEnum.PROGRAM_ADMINISTRATOR;
    try {
      const personApi = new PersonApi();
      const request: any = PersonSearchRequest.create({
        // If user.person.type is ProgramAdministrator，then type is Network，otherwise is Shop or Dealership
        type: isAdmin ? 'Network' : (auth.user?.person?.type as 'Shop' | 'Dealership' | 'Network'),
        organizationId:
          auth.user?.person?.type === 'Shop'
            ? auth.user?.person?.shop?.id
            : auth.user?.person?.type === 'Dealership'
              ? auth.user?.person?.dealership?.id
              : undefined,
      });
      const resultParameter = ResultParameter.create({
        resultsOrderBy: 'firstName',
        resultsOrderAscending: false,
      });
      request.resultParameter = resultParameter;
      personApi.search(request, {
        status200: (data) => {
          if (isAdmin) {
            setIsShowAdminTeam(true);
          } else {
            setIsShowTeam(true);
          }
          setTeamMembers(data.persons);
        },
        error: (error) => {
          console.error('Person search error:', error);
        },
        else: (statusCode, message) => {
          console.error('Unhandled search response:', statusCode, message);
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = (item: 'team' | 'profile' | 'logout') => {
    switch (item) {
      case 'team':
        getTeamMembers();
        break;
      case 'profile':
        setOpen(true);
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  // logout
  const handleLogout = () => {
    const authApi = new AuthenticationApi();
    authApi.logout({
      status200: () => {
        auth.reset();
        router.navigate({ to: '/login' });
      },
    });
  };

  return (
    <>
      <header
        className={`bg-header fixed top-0 right-0 left-0 z-50 flex h-20 w-full items-center justify-between px-6 text-white ${className || ''} `}
        {...props}
      >
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt={brand === 'vw' ? t('header.vw') : t('header.audi')}
            className={
              logo === vwLogo ? 'h-10 w-10 cursor-pointer object-contain' : 'h-20 w-20 cursor-pointer object-contain'
            }
            onClick={() => router.navigate({ to: '/' })}
          />
          <div>
            {logo === vwLogo ? (
              <span className="font-medium text-lg text-blue-500">{t('header.vw')} </span>
            ) : (
              <span className="font-medium text-lg text-red-500">{t('header.audi')}</span>
            )}
            <span className="text-base font-medium text-white">{t('common.restrictedPartsTracker')}</span>
          </div>
        </div>
        {/* Right: Globe + User Dropdown */}
        <div className="flex items-center gap-4">
          {/* User Dropdown */}
          {isShowUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center gap-3 pr-2 focus:outline-none focus-visible:outline-none active:outline-none">
                    <div className="text-left text-white">
                    {/* User Name - Larger font */}
                    <p className="mb-2 text-base font-semibold leading-none">
                      {auth.user
                        ? `${auth.user.person?.firstName} ${auth.user.person?.lastName}`.trim() ||
                          auth.user.person?.email
                        : t('header.user')}
                    </p>
                    {/* Shop/Dealership Name */}
                    <p className="text-xs text-gray-400 mb-1">
                      {auth.user
                        ? auth.user.person?.shop?.name && auth.user.person?.shop?.shopNumber
                          ? `${auth.user.person?.shop?.name} (${auth.user.person?.shop?.shopNumber})`
                          : auth.user.person?.dealership?.name && auth.user.person?.dealership?.dealershipNumber
                            ? `${auth.user.person?.dealership?.name} (${auth.user.person?.dealership?.dealershipNumber})`
                            : auth.user.person?.csrRegion
                              ? auth.user.person?.csrRegion?.name
                              : ''
                        : t('header.notLoggedIn')}
                    </p>
                    {/* Role - On its own line */}
                    <p className="text-xs text-gray-400">
                      {auth.user
                        ? auth.user.person?.type === 'Shop'
                          ? t('header.shopStaff')
                          : auth.user.person?.type === 'Dealership'
                            ? t('header.dealershipStaff')
                            : auth.user.person?.type === 'Csr'
                              ? 'CSR'
                              : auth.user.person?.type === 'ProgramAdministrator'
                                ? t('header.programAdministrator')
                                : auth.user.person?.type === 'FieldStaff'
                                  ? t('header.fieldStaff')
                                  : auth.user.person?.type
                        : ''}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </DropdownMenuTrigger>
              {/* Menu right aligned */}
              <DropdownMenuContent align="end" className="w-56 mt-2">
                {auth?.user?.person?.type !== PersonTypeEnum.CSR && auth?.user?.person?.type !== PersonTypeEnum.FIELD_STAFF && (
                  <DropdownMenuItem className="cursor-pointer" onSelect={() => handleSelect('team')}>
                    <Users className="w-4 h-4 mr-2" />
                    <span>{t('header.viewTeam')}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer" onSelect={() => handleSelect('profile')}>
                  <UserPen className="w-4 h-4 mr-2" />
                  <span>{t('header.editProfile')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer focus:text-red-600"
                  onSelect={() => handleSelect('logout')}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>{t('header.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* Language Globe */}
          <div className="p-2 text-white transition-colors rounded-full hover:bg-white/10">
            <LanguageDropdown />
          </div>
        </div>
      </header>
      <EditProfileDialog
        open={open}
        onOpenChange={setOpen}
        initialData={{
          id: auth.user?.person?.id,
          firstName: auth.user?.person?.firstName || '',
          lastName: auth.user?.person?.lastName || '',
          email: auth.user?.person?.email || '',
        }}
      />
      <ViewTeamDialog
        teamMembers={teamMembers}
        open={isShowTeam}
        onOpenChange={setIsShowTeam}
        onSuccess={getTeamMembers}
      />
      <ViewAdminTeamDialog
        teamMembers={teamMembers}
        open={isShowAdminTeam}
        onOpenChange={setIsShowAdminTeam}
        onSuccess={getTeamMembers}
        onError={(error) => {
          console.error('Failed to get team members:', error);
        }}
      />
    </>
  );
}
