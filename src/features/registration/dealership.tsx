import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { User, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import bannerImg from '@/assets/img/registration/dealership.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import RegistrationRequestBase from '@/js/models/base/RegistrationRequestBase'
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'

export function RegistrationDealership() {
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

      let request = new RegistrationRequestBase()
      request.type = 'Dealership'
      request.firstName = form.firstName
      request.lastName = form.lastName
      request.email = form.email
      request.dealershipName = form.dealershipName
      request.dealershipNumber = form.dealershipNumber
      const authenticationApi = new AuthenticationApi()
      authenticationApi.registrationRequestDealership(request, {
        status200: () => {
          toast.success('Registration successful! Please check your email.')
          navigate({ to: '/registrationResult', search: { status: 'success' } })
        },
        status409: (message: string) => {
          toast.error(message)
        },
      })
    } catch (error) {
      toast.error('Registration failed. Please try again.')
    }

    // try {
    //   // 模拟注册 API 调用
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
    <div className='flex min-h-screen flex-col bg-background'>
      {/* 复用 Header（隐藏用户下拉） */}
      <Header isShowUser={false} />

      {/* Banner 顶部 */}
      <div className='relative mt-16 h-32 bg-primary text-primary-foreground lg:h-40'>
        <img
          src={bannerImg}
          alt='New Shop User Registration'
          className='absolute inset-0 h-full w-full object-fill opacity-70'
          loading='lazy'
        />
      </div>

      {/* 表单主体 */}
      <div className='flex flex-1 items-start justify-center px-4 py-8 lg:py-12'>
        <form onSubmit={handleSubmit} className='w-full max-w-4xl space-y-10'>
          {/* Personal Information */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <User className='h-6 w-6 text-foreground' />
              <h2 className='text-xl font-semibold text-foreground'>
                Personal Information
              </h2>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label
                  htmlFor='firstName'
                  className='text-sm font-medium text-foreground'
                >
                  First Name
                </Label>
                <Input
                  id='firstName'
                  placeholder='Enter first name'
                  className='h-12 rounded-lg rounded-lg'
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='lastName'
                  className='text-sm font-medium text-foreground'
                >
                  Last Name
                </Label>
                <Input
                  id='lastName'
                  placeholder='Enter last name'
                  className='h-12 rounded-lg rounded-lg'
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
                className='text-sm font-medium text-foreground'
              >
                Email
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='Enter email address'
                className='h-12 rounded-lg rounded-lg'
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
              <Building2 className='h-6 w-6 text-foreground' />
              <h2 className='text-xl font-semibold text-foreground'>
                Dealership Information
              </h2>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label
                  htmlFor='dealershipName'
                  className='text-sm font-medium text-foreground'
                >
                  Dealership Name
                </Label>
                <Input
                  id='dealershipName'
                  placeholder='Enter dealership name'
                  className='h-12 rounded-lg rounded-lg'
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
                  className='text-sm font-medium text-foreground'
                >
                  Dealership #
                </Label>
                <Input
                  id='dealershipNumber'
                  placeholder='Enter dealership number'
                  className='h-12 rounded-lg rounded-lg'
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

          {/* 提交按钮 */}
          <div className='flex justify-end pt-6'>
            <Button
              type='submit'
              variant='default'
              className='h-12 rounded-full px-8 font-medium shadow-md transition-all'
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
