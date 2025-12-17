import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import ForgotPasswordRequest from '@/js/models/ForgotPasswordRequest'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import bg from '@/assets/img/login/bg.png'
import { useAuthStore } from '@/stores/auth-store'
import useBrandLogo from '@/hooks/use-bran-logo'
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'

const authApi = new AuthenticationApi()
export function ForgotPassword() {
  const logoSrc = useBrandLogo('login', '_a.png')
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  // ===================Redirect to the homepage when the user's login status is no longer valid==============

  const { isLoading: isCheckingAuth, LoadingComponent } =
    useRedirectIfAuthenticated()

  // Called when the component is mounted logout() Clear session
  // According to routing specifications：Access /password/forgot needs to be called AuthenticationApi::sessionLogout()
  // Note：authApi.logout() is AuthenticationApi::sessionLogout() implementation
  // Optimize：Call only when the user is logged in logout，Avoid unnecessary API calls
  useEffect(() => {
    // If the user is logged in，Call logout Clear session
    // If the user is not logged in，Directly clear the frontend state
    if (auth.loginStatus === 'authenticated') {
      // Call backend API Clear session（will clear HttpOnly Cookie）
      authApi.logout({
        status200: () => {
          // API Call successful，Clear frontend state
          auth.reset()
        },
        error: () => {
          // Even if API Call failed，still clear frontend state（Could be a network issue，But the frontend state should be cleared）
          auth.reset()
        },
      })
    } else {
      // User not logged in，Directly clear frontend state
      auth.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Execute only once when the component is mounted

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const request = new  ForgotPasswordRequest()
      request.email = email
      authApi.forgotPassword(request, {
        status200: () => {
          toast.success(`Password reset link has been sent to ${email}`)
          navigate({ to: '/login' })
          setIsLoading(false)
        },
        error: () => {
          toast.error('Failed to send reset link. Please try again.')
          setIsLoading(false)
        },
      })
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.')
      setIsLoading(false)
    }
  }

  // If checking authentication status or already logged in，Show loading state
  // This code must be placed later BecauseReact Hookthe rules requireHookmust be called at the top level of the component
  if (isCheckingAuth && LoadingComponent) {
    return <LoadingComponent />
  }
  //============end------======================

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      {/* Reuse Header（Hide user dropdown） */}
      <Header isShowUser={false} />

      {/* Main Content: Vertical layout */}
      <div className='flex flex-1 flex-col'>
        {/* Upper part：Brand display area - Full-width display */}
        <div
          className='flex flex-col items-center justify-center px-6 py-12 lg:py-16'
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className='max-w-lg space-y-8 text-center'>
            {logoSrc ? (
              <img
                loading='lazy'
                src={logoSrc}
                alt='Audi Authorized Collision Repair'
                className='mx-auto h-36 w-auto drop-shadow-xl lg:h-56'
              />
            ) : null}
          </div>
        </div>

        {/* Lower part：Forgot password form */}
        <div className='flex flex-1 items-start justify-center bg-card px-1 py-2 lg:py-12'>
          <div className='w-full max-w-md p-8 lg:p-10'>
            <h2 className='mb-4 text-center text-3xl font-bold text-foreground lg:text-4xl'>
              Forgot Password
            </h2>
            <form onSubmit={handleSubmit} className='space-y-7'>
              {/* Email Input box */}
              <div className='space-y-3'>
                {/* <Label
                  htmlFor='email'
                  className='text-base font-medium text-foreground'
                >
                  Email Address
                </Label> */}
                <div className='relative my-10'>
                  <Mail className='absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='Enter your email'
                    className='h-14 rounded-full border-gray-300 pl-12 text-base focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit button */}
              <Button
                type='submit'
                variant='default'
                className='h-14 w-full rounded-full text-base font-semibold shadow-md transition-all'
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            {/* Return to login */}
            {/* <div className='mt-8 text-center text-sm text-gray-600'>
              <Link
                to='/login'
                className='font-medium text-cyan-600 transition-colors hover:text-cyan-700'
              >
                ← Back to Login
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}