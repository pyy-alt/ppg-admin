import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import CompleteRegistrationRequest from '@/js/models/CompleteRegistrationRequest'
import type Session from '@/js/models/Session'
import { User, Store, Lock, MapPin, EyeOff, Eye, IdCard, Warehouse } from 'lucide-react'
import { toast } from 'sonner'
import bannerImg from '@/assets/img/registration/banner2.png'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loading } from '@/components/Loading'
import { Header } from '@/components/layout/header'
import { useTranslation } from 'react-i18next';

export function RegistrationComplete() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    shopName: '',
    shopNumber: '',
    shopAddress: '',
    password: '',
    confirmPassword: '',
  })
  // Query parameters
  const { id, hash, guid } = useParams({
    from: '/registration/complete/$id/$guid/$hash',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidating, setIsValidating] = useState(true) // Verifying the link.

  const authApi = new AuthenticationApi()
  const { auth } = useAuthStore()
  
  // 获取用户类型
  const userType = auth.user?.person?.type

  // 根据用户类型获取标题
  const getBannerTitle = () => {
    switch (userType) {
      case 'Shop':
        return t('registration.complete.titles.shop')
      case 'Dealership':
        return t('registration.complete.titles.dealership')
      case 'ProgramAdministrator':
        return t('registration.complete.titles.admin')
      case 'Csr':
        return t('registration.complete.titles.csr')
      case 'FieldStaff':
        return t('registration.complete.titles.fieldStaff')
      default:
        return t('registration.complete.titles.default')
    }
  }

  // 根据用户类型获取组织信息标题
  const getOrganizationSectionTitle = () => {
    switch (userType) {
      case 'Shop':
        return t('registration.complete.sections.shopInfo')
      case 'Dealership':
        return t('registration.complete.sections.dealershipInfo')
      case 'Csr':
      case 'ProgramAdministrator':
      case 'FieldStaff':
        return t('registration.complete.sections.roleInfo')
      default:
        return t('registration.complete.sections.organizationInfo')
    }
  }

  // 根据用户类型获取图标
  const getOrganizationIcon = () => {
    switch (userType) {
      case 'Shop':
        return <Store className='text-foreground h-6 w-6' />
      case 'Dealership':
        return <Warehouse className='text-foreground h-6 w-6' />
      case 'Csr':
      case 'ProgramAdministrator':
      case 'FieldStaff':
        return <IdCard className='text-foreground h-6 w-6' />
      default:
        return <Store className='text-foreground h-6 w-6' />
    }
  }

  // ✅ Add ref Prevent duplicate calls
  const hasValidatedRef = useRef(false)
  useEffect(() => {
    // ✅ If it has already been verified.，No longer repeatedly called.
    if (hasValidatedRef.current) {
      return
    }
    // ✅ Add parameter validation.
    if (!id || !guid || !hash) {
      toast.error(t('registration.complete.errors.invalidParams'))
      setIsValidating(false)
      return
    }

    // ✅ Marked as verification started.
    hasValidatedRef.current = true
    // Invoke sessionCreate API Verify the email link and create a temporary session.
    // If the user is already logged in，This call will create a new temporary session and overwrite the previous session.
    authApi.sessionCreate(
      id,
      guid,
      hash,
      {
        status200: (session: Session) => {
          if (session) {
            auth.setUser(session) // setUser Will be set automatically. loginStatus For 'authenticated'

            // ✅ Build a complete address.（Include city, state, zip）
            const organization =
              session.person?.shop || session.person?.dealership
            const addressParts = [
              organization?.address,
              organization?.city,
              organization?.state,
              organization?.zip,
            ].filter(Boolean) // Filter out empty values.
            const fullAddress = addressParts.join(', ')

            // ✅ Update form data，Use from API Acquired real data
            setForm({
              email: session.person?.email || '',
              firstName: session.person?.firstName || '',
              lastName: session.person?.lastName || '',
              shopName: organization?.name || '',
              shopNumber:
                session.person?.shop?.shopNumber ||
                session.person?.dealership?.dealershipNumber ||
                '',
              shopAddress: fullAddress || '',
              password: '',
              confirmPassword: '',
            })
          }
          setIsValidating(false)
        },
        status404: () => {
          // The link is invalid or has expired.
          toast.error(t('registration.complete.errors.invalidLink'))
          setIsValidating(false)
          // Do not redirect immediately.，Show the user an error message.
          // Users can choose to manually return or reapply for the reset link.
        },
        error: () => {
          // Network errors, etc.
          toast.error(t('registration.complete.errors.validateFailed'))
          setIsValidating(false)
          // ✅ Reset on error ref，Allow retry
          hasValidatedRef.current = false
        },
      },
      null
    )
  }, [id, guid, hash]) // Execute only once when the component is mounted.

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error(t('registration.complete.errors.passwordMismatch'))
      return
    }

    if (form.password.length < 8) {
      toast.error(t('registration.complete.errors.passwordTooShort'))
      return
    }

    setIsLoading(true)

    try {
      // Invoke updatePassword API Update password
      // Notice：Since the conversation was created through an email link.，No need to provide. currentPassword
      const request = CompleteRegistrationRequest.create({
        firstName: form.firstName,
        lastName: form.lastName,
        newPassword: form.password,
      })
      authApi.registrationComplete(request, {
        status200: () => {
          // ✅ Registration completed.，Clear user status（Because you need to jump to the login page.）
          auth.reset()

          toast.success(t('registration.complete.success'))

          // ✅ Jump to the login page.，Use replace: true Avoid returning.
          navigate({
            to: '/login',
            replace: true,
          })

          setIsLoading(false)
        },
        // ✅ 409 Error：The entire view has been displayed. toast.warning，Just reset here. loading
        status409: () => {
          setIsLoading(false)
        },
        // ✅ Other errors：The entire view is now displayed. toast.error，Just reset here. loading
        error: (error: Error) => {
            // ✅ Check if it is JSON Parsing error（API Return to plain text. "successful operation"）
            const errorMessage = error?.message || String(error)
            if (
              errorMessage.includes('JSON.parse') ||
              errorMessage.includes('unexpected character') ||
              errorMessage.includes('successful operation')
            ) {
              // ✅ If it is JSON Parsing error，Explanation API Returned a plain text success message.，Treat as a successful handling.
              console.log('[registrationComplete] API returned plain text, treating as success')
              auth.reset()
              toast.success(t('registration.complete.success'))
              navigate({
                to: '/login',
                replace: true,
              })
              setIsLoading(false)
              return
            }
  
            // ✅ Other errors are handled normally.
            console.error('Registration complete error:', error)
          setIsLoading(false)
        },
      })
    } catch (error) {
      toast.error(t('registration.complete.errors.completeFailed'))
      setIsLoading(false)
    }
  }
  // If verifying the link，Show loading status
  if (isValidating) {
    return <Loading />
  }

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* Reuse Header（Hide user dropdown） */}
      <Header isShowUser={false} />

      {/* Banner Top */}
      <div className='bg-primary text-primary-foreground relative mt-12 h-32 lg:h-40'>
        <img
          src={bannerImg}
          alt={getBannerTitle()}
          className='absolute inset-0 h-full w-full object-cover opacity-70'
          loading='lazy'
        />
        <div className='relative z-10 flex h-full items-center px-6 lg:px-12'>
          <h1 className='text-2xl font-bold lg:text-4xl'>
            {getBannerTitle()}
          </h1>
        </div>
      </div>

      {/* Form body */}
      <div className='flex flex-1 items-start justify-center px-4 py-8 lg:py-12'>
        <form onSubmit={handleSubmit} className='w-full max-w-4xl space-y-10'>
          {/* Personal Information */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <User className='text-foreground h-6 w-6' />
              <h2 className='text-foreground text-xl font-semibold'>
                {t('registration.complete.sections.personalInfo')}
              </h2>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='email'
                  className='text-foreground text-sm font-medium'
                >
                  {t('registration.complete.fields.email')}
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={form.email}
                  className='bg-muted h-12 rounded-lg'
                  disabled
                />
              </div>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='firstName'
                    className='text-foreground text-sm font-medium'
                  >
                    {t('registration.complete.fields.firstName')}
                  </Label>
                  <Input
                    id='firstName'
                    value={form.firstName}
                    className='bg-muted h-12 rounded-lg'
                    disabled
                  />
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='lastName'
                    className='text-foreground text-sm font-medium'
                  >
                    {t('registration.complete.fields.lastName')}
                  </Label>
                  <Input
                    id='lastName'
                    value={form.lastName}
                    className='bg-muted h-12 rounded-lg'
                    disabled
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Shop/Organization/Role Information */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              {getOrganizationIcon()}
              <h2 className='text-foreground text-xl font-semibold'>
                {getOrganizationSectionTitle()}
              </h2>
            </div>

            {/* Shop and Dealership: Show Name, Number, Address */}
            {(userType === 'Shop' || userType === 'Dealership') && (
              <>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='shopName'
                      className='text-foreground text-sm font-medium'
                    >
                      {t('registration.complete.fields.shopName')}
                    </Label>
                    <Input
                      id='shopName'
                      value={form.shopName}
                      className='bg-muted h-12 rounded-lg'
                      disabled
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor='shopNumber'
                      className='text-foreground text-sm font-medium'
                    >
                      {t('registration.complete.fields.shopNumber')}
                    </Label>
                    <Input
                      id='shopNumber'
                      value={form.shopNumber}
                      className='bg-muted h-12 rounded-lg'
                      disabled
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='shopAddress'
                    className='text-foreground text-sm font-medium'
                  >
                    {t('registration.complete.fields.address')}
                  </Label>
                  <div className='relative'>
                    <MapPin className='text-muted-foreground absolute top-3.5 left-3 h-5 w-5' />
                    <Input
                      id='shopAddress'
                      value={form.shopAddress}
                      className='bg-muted h-12 rounded-lg pl-11'
                      disabled
                    />
                  </div>
                </div>
              </>
            )}

            {/* CSR: Show Role and Region */}
            {userType === 'Csr' && (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label className='text-foreground text-sm font-medium'>
                    {t('registration.complete.fields.role')}
                  </Label>
                  <Input
                    value='CSR'
                    className='bg-muted h-12 rounded-lg'
                    disabled
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-foreground text-sm font-medium'>
                    {t('registration.complete.fields.region')}
                  </Label>
                  <Input
                    value={auth.user?.person?.csrRegion?.name || '--'}
                    className='bg-muted h-12 rounded-lg'
                    disabled
                  />
                </div>
              </div>
            )}

            {/* Field Staff: Show Role and Regions */}
            {userType === 'FieldStaff' && (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label className='text-foreground text-sm font-medium'>
                    {t('registration.complete.fields.role')}
                  </Label>
                  <Input
                    value={t('header.fieldStaff')}
                    className='bg-muted h-12 rounded-lg'
                    disabled
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-foreground text-sm font-medium'>
                    {t('registration.complete.fields.regions')}
                  </Label>
                  <Input
                    value={auth.user?.person?.fieldStaffRegions?.map((r: any) => r.name).join(', ') || '--'}
                    className='bg-muted h-12 rounded-lg'
                    disabled
                  />
                </div>
              </div>
            )}

            {/* Program Administrator: Show Role only */}
            {userType === 'ProgramAdministrator' && (
              <div className='space-y-2'>
                <Label className='text-foreground text-sm font-medium'>
                  {t('registration.complete.fields.role')}
                </Label>
                <Input
                  value={t('header.programAdministrator')}
                  className='bg-muted h-12 rounded-lg'
                  disabled
                />
              </div>
            )}
          </section>

          {/* Password */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <Lock className='text-foreground h-6 w-6' />
              <h2 className='text-foreground text-xl font-semibold'>
                {t('registration.complete.sections.password')}
              </h2>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='password'
                  className='text-foreground text-sm font-medium'
                >
                  {t('registration.complete.fields.password')}
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('registration.complete.placeholders.password')}
                    className='h-12 rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors'
                    disabled={isLoading}
                    aria-label={
                      showPassword ? t('registration.complete.hidePassword') : t('registration.complete.showPassword')
                    }
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='confirmPassword'
                  className='text-foreground text-sm font-medium'
                >
                  {t('registration.complete.fields.confirmPassword')}
                </Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('registration.complete.placeholders.confirmPassword')}
                    className='h-12 rounded-lg pr-12 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                    value={form.confirmPassword}
                    onChange={(e) =>
                      handleChange('confirmPassword', e.target.value)
                    }
                    required
                    disabled={isLoading}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors'
                    disabled={isLoading}
                    aria-label={
                      showConfirmPassword ? t('registration.complete.hidePassword') : t('registration.complete.showPassword')
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Submit button */}
          <div className='flex justify-end pt-6'>
            <Button
              type='submit'
              variant='default'
              className='h-12 rounded-full px-8 font-medium shadow-md transition-all'
              disabled={isLoading}
            >
              {isLoading ? t('registration.complete.completing') : t('registration.complete.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
