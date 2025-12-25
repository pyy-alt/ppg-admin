// src/features/auth/landing.tsx
import { Link } from '@tanstack/react-router'
import bg from '@/assets/img/login/landing_bg.png'
import useBrandLogo from '@/hooks/use-bran-logo'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function Landing() {
  const { t } = useTranslation()
  const logoSrc = useBrandLogo('login', '_a.png')
  
  return (
    <div className='min-h-screen bg-background'>
      {/* Header Section with Background */}
      <div className='relative max-h-[280px] overflow-hidden'>
        <img
          src={bg}
          alt={t('auth.landing.backgroundAlt')}
          className='h-full w-full object-cover'
        />
        <h1 className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-3xl font-bold text-primary-foreground lg:text-4xl'>
          {t('auth.landing.title')}
        </h1>
      </div>

      {/* Main Content */}
      <div className='flex min-h-[calc(100vh-280px)] flex-col items-center justify-center px-6 py-12'>
        {/* Branding Section */}
        <div className='mb-8'>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={t('auth.landing.logoAlt')}
              className='h-32 w-auto lg:h-40'
            />
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className='w-full max-w-sm space-y-4'>
          <Button
            asChild
            variant='default'
            className='h-14 w-full rounded-full text-base font-semibold shadow-md'
          >
            <Link to='/login'>{t('auth.landing.login')}</Link>
          </Button>

          <Button
            asChild
            variant='outline'
            className='h-14 w-full rounded-full border-2 text-base font-semibold'
          >
            { }
            <Link to='/registration/shop' search={{ type: 'shop' } as any}>
              {t('auth.landing.registerAsShop')}
            </Link>
          </Button>

          <Button
            asChild
            variant='outline'
            className='h-14 w-full rounded-full border-2 text-base font-semibold'
          >
            <Link
              to='/registration/dealership'
              search={{ type: 'dealership' } as any}
            >
              {t('auth.landing.registerAsDealer')}
            </Link>
          </Button>
        </div>

        {/* Footer Language Options */}
        <div className='mt-12 flex items-center gap-2 text-sm text-muted-foreground'>
          <span aria-hidden='true'>🌐</span>
          <span className='font-medium text-foreground'>{t('auth.landing.language.english')}</span>
          <span className='text-muted-foreground' aria-hidden='true'>
            |
          </span>
          <span className='text-muted-foreground'>{t('auth.landing.language.french')}</span>
        </div>
      </div>
    </div>
  )
}
