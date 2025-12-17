import { useNavigate, useRouter, useLocation } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Landing } from '@/features/auth/landing'
import { useAuthStore } from '@/stores/auth-store'

export function NotFoundError() {
  const navigate = useNavigate()
  const { history } = useRouter()
  const location = useLocation()
  const { auth } = useAuthStore()
  
  // If the access is to the root path / Not logged in yet.，Display Landing Page
  if (location.pathname === '/' && auth.loginStatus === 'unauthenticated') {
    return <Landing />
  }
  
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>404</h1>
        <span className='font-medium'>Oops! Page Not Found!</span>
        <p className='text-muted-foreground text-center'>
          It seems like the page you're looking for <br />
          does not exist or might have been removed.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
        </div>
      </div>
    </div>
  )
}
