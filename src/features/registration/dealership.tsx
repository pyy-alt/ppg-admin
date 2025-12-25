import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import RegistrationRequestBase from '@/js/models/base/RegistrationRequestBase'
import { User, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import bannerImg from '@/assets/img/registration/dealership.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { useTranslation } from 'react-i18next';

export function RegistrationDealership() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dealershipName: '',
    dealershipNumber: '',
  })

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const request = new RegistrationRequestBase()
      request.type = 'Dealership'
      request.firstName = form.firstName
      request.lastName = form.lastName
      request.email = form.email
      request.dealershipName = form.dealershipName
      request.dealershipNumber = form.dealershipNumber
      const authenticationApi = new AuthenticationApi()
      authenticationApi.registrationRequestDealership(request, {
        status200: () => {
          toast.success(t('registration.dealership.success'))
          navigate({ to: '/registrationResult', search: { status: 'success' } })
        },
        status409: (message: string) => {
          toast.error(message)
        },
      })
    } catch (error) {
      toast.error(t('registration.dealership.errors.registrationFailedDefault'))
    }

    // try {
    //   // Simulate registration API Call
    //   await new Promise((resolve) => setTimeout(resolve, 1500))
    //   toast.success('Registration successful! Please check your email.')
    //   navigate({ to: '/login' })
    // } catch {
    //   toast.error('Registration failed. Please try again.')
    // } finally {
    //   setIsLoading(false)
    // }
  }

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* Reuse Header（Hide user dropdown） */}
      <Header isShowUser={false} />

      {/* Banner Top */}
      <div className='bg-primary text-primary-foreground relative mt-16 h-32 lg:h-40'>
        <img
          src={bannerImg}
          alt={t('registration.dealership.bannerAlt')}
          className='absolute inset-0 h-full w-full object-fill opacity-70'
          loading='lazy'
        />
      </div>

      {/* Form body */}
      <div className='flex flex-1 items-start justify-center px-4 py-8 lg:py-12'>
        <form onSubmit={handleSubmit} className='w-full max-w-4xl space-y-10'>
          {/* Personal Information */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <User className='text-foreground h-6 w-6' />
              <h2 className='text-foreground text-xl font-semibold'>
                {t('registration.dealership.sections.personalInfo')}
              </h2>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label
                  htmlFor='firstName'
                  className='text-foreground text-sm font-medium'
                >
                  {t('registration.dealership.fields.firstName')}
                </Label>
                <Input
                  id='firstName'
                  placeholder={t('registration.dealership.placeholders.firstName')}
                  className='h-12 rounded-lg'
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='lastName'
                  className='text-foreground text-sm font-medium'
                >
                  {t('registration.dealership.fields.lastName')}
                </Label>
                <Input
                  id='lastName'
                  placeholder={t('registration.dealership.placeholders.lastName')}
                  className='h-12 rounded-lg'
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-foreground text-sm font-medium'
              >
                {t('registration.dealership.fields.email')}
              </Label>
              <Input
                id='email'
                type='email'
                placeholder={t('registration.dealership.placeholders.email')}
                className='h-12 rounded-lg'
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </section>

          {/* Dealership Information */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <Building2 className='text-foreground h-6 w-6' />
              <h2 className='text-foreground text-xl font-semibold'>
                {t('registration.dealership.sections.dealershipInfo')}
              </h2>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label
                  htmlFor='dealershipName'
                  className='text-foreground text-sm font-medium'
                >
                  {t('registration.dealership.fields.dealershipName')}
                </Label>
                <Input
                  id='dealershipName'
                  placeholder={t('registration.dealership.placeholders.dealershipName')}
                  className='h-12 rounded-lg'
                  value={form.dealershipName}
                  onChange={(e) =>
                    handleChange('dealershipName', e.target.value)
                  }
                  required
                  disabled={isLoading}
                />
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='dealershipNumber'
                  className='text-foreground text-sm font-medium'
                >
                  {t('registration.dealership.fields.dealershipNumber')}
                </Label>
                <Input
                  id='dealershipNumber'
                  placeholder={t('registration.dealership.placeholders.dealershipNumber')}
                  className='h-12 rounded-lg'
                  value={form.dealershipNumber}
                  onChange={(e) =>
                    handleChange('dealershipNumber', e.target.value)
                  }
                  required
                  disabled={isLoading}
                />
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
              {isLoading ? t('registration.dealership.registering') : t('registration.dealership.register')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
