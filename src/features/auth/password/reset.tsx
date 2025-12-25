import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useParams } from '@tanstack/react-router'
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import type Session from '@/js/models/Session'
import UpdatePasswordRequest from '@/js/models/UpdatePasswordRequest'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'
import bg from '@/assets/img/login/bg.png'
import { useAuthStore } from '@/stores/auth-store'
import useBrandLogo from '@/hooks/use-bran-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loading } from '@/components/Loading'
import { Header } from '@/components/layout/header'

const authApi = new AuthenticationApi()

export function ResetPassword() {
  const logoSrc = useBrandLogo('login', '_a.png')
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const { id, guid, hash } = useParams({
    from: '/password/reset/$id/$guid/$hash',
  })

  // console.log(id, guid, hash)

  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true) // Verifying link
  const [isLinkValid, setIsLinkValid] = useState(false) // Whether the link is valid
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // ✅ Add ref Prevent duplicate calls
  const hasValidatedRef = useRef(false)
  useEffect(() => {
    // ✅ If already verified，Do not call again
    if (hasValidatedRef.current) {
      return
    }

    // ✅ Mark as verification started
    hasValidatedRef.current = true
    // Call sessionCreate API Verify email link and create temporary session
    // If the user is already logged in，This call will create a new temporary session and overwrite the previous session
    authApi.sessionCreate(
      id,
      guid,
      hash,
      {
        status200: (session: Session) => {
          auth.setUser(session) // setUser Will automatically set loginStatus to 'authenticated'
          setIsLinkValid(true)
          setIsValidating(false)
        },
        status404: () => {
          // Link is invalid or expired
          toast.error(t('auth.resetPassword.errors.invalidLink'))
          setIsLinkValid(false)
          setIsValidating(false)
          // Do not redirect immediately，Let the user see the error message
          // The user can choose to return manually or reapply for the reset link
        },
        error: () => {
          // Network errors, etc.
          toast.error(t('auth.resetPassword.errors.validateFailed'))
          setIsValidating(false)
          // ✅ Reset on error ref，Allow retry
          hasValidatedRef.current = false
        },
      },
      null
    )
  }, [id, guid, hash]) // Execute only once when the component is mounted

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error(t('auth.resetPassword.errors.passwordMismatch'))
      return
    }

    if (password.length < 8) {
      toast.error(t('auth.resetPassword.errors.passwordTooShort'))
      return
    }

    setIsLoading(true)
    try {
      // Call updatePassword API Update password
      // Note：Since the session is created via email link，No need to provide currentPassword
      const request = UpdatePasswordRequest.create({ newPassword: password })
      authApi.updatePassword(request, {
        status200: () => {
          toast.success(t('auth.resetPassword.success'))
          // After password update is successful，Clear session and redirect to login page
          auth.reset()
          navigate({ to: '/login' })
          setIsLoading(false)
        }
        
      })
    } catch (error) {
      toast.error(t('auth.resetPassword.errors.resetFailed'))
      setIsLoading(false)
    }
  }

  // If verifying link，Show loading state
  if (isValidating) {
    return <Loading />
  }

  // If the link is invalid，Show error message
  if (!isLinkValid) {
    return (
      <div className='bg-background flex min-h-screen flex-col'>
        <Header isShowUser={false} />
        <div className='flex flex-1 flex-col items-center justify-center px-4 py-8'>
          <div className='w-full max-w-md space-y-6 text-center'>
            <h1 className='text-foreground text-2xl font-bold'>
              {t('auth.resetPassword.invalidLink.title')}
            </h1>
            <p className='text-muted-foreground'>
              {t('auth.resetPassword.invalidLink.description')}
            </p>
            <div className='flex justify-center gap-4'>
              <Link
                to='/password/forgot'
                className='rounded-full px-4 py-2 transition-colors'
              >
                {t('auth.resetPassword.invalidLink.requestNew')}
              </Link>
              <Link
                to='/login'
                className='text-foreground hover:bg-muted/50 rounded-full border px-4 py-2 transition-colors'
              >
                {t('auth.resetPassword.invalidLink.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* Reuse Header（Hide user dropdown） */}
      <Header isShowUser={false} />

      <div
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        className='flex flex-col items-center justify-center px-6 py-12 lg:py-16'
      >
        {logoSrc ? (
          <img
            loading='lazy'
            src={logoSrc}
            alt='logo'
            className='mx-auto h-36 w-auto max-w-lg space-y-8 text-center drop-shadow-xl lg:h-56'
          />
        ) : null}
      </div>

      {/* Main body：Vertical layout，Single screen display */}
      <div className='flex flex-1 flex-col items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md space-y-10'>
          {/* Lower part：Reset password form */}
          <div className='space-y-8'>
            <h1 className='text-foreground text-center text-3xl font-bold'>
              {t('auth.resetPassword.title')}
            </h1>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* New Password */}
              <div className='space-y-2'>
                <Label
                  htmlFor='password'
                  className='text-foreground text-sm font-medium'
                >
                  {t('auth.resetPassword.newPassword')}
                </Label>
                <div className='relative'>
                  <Lock className='text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2' />
                  <Input
                    id='password'
                    type='password'
                    placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                    className='h-12 rounded-full pl-11 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className='space-y-2'>
                <Label
                  htmlFor='confirm'
                  className='text-foreground text-sm font-medium'
                >
                  {t('auth.resetPassword.confirmPassword')}
                </Label>
                <div className='relative'>
                  <Lock className='text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2' />
                  <Input
                    id='confirm'
                    type='password'
                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                    className='h-12 rounded-full pl-11 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              {/* Return to login */}
              <div className='text-right'>
                <Link
                  to='/login'
                  className='text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-700'
                >
                  {t('auth.resetPassword.backToLogin')}
                </Link>
              </div>

              {/* Submit button */}
              <Button
                type='submit'
                variant='default'
                className='h-12 w-full rounded-full font-medium shadow-md transition-all'
                disabled={isLoading}
              >
                {isLoading ? t('auth.resetPassword.updating') : t('auth.resetPassword.update')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
