import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { User, Store, Lock, MapPin, EyeOff, Eye } from 'lucide-react'
import { toast } from 'sonner'
import bannerImg from '@/assets/img/registration/banner.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'

export function RegistrationComplete() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    email: 'jake.renshaw@sunsetauto.com',
    firstName: 'Jake',
    lastName: 'Renshaw',
    shopName: 'Sunset Auto Collision',
    shopNumber: '2458',
    shopAddress: '7820 Sunset Blvd Los Angeles, CA 90046',
    password: '',
    confirmPassword: '',
  })
  // 查询参数
  // const { id, hash, guid }:{ id:string,hash:string,guid:string } = useSearch({ from: '/registration/complete' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    setIsLoading(true)

    try {
      // 模拟最终注册提交
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success('Registration completed successfully!')
      navigate({ to: '/' })
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* 复用 Header（隐藏用户下拉） */}
      <Header isShowUser={false} />

      {/* Banner 顶部 */}
      <div className='bg-primary text-primary-foreground relative mt-12 h-32 lg:h-40'>
        <img
          src={bannerImg}
          alt='New Shop User Registration'
          className='absolute inset-0 h-full w-full object-cover opacity-70'
          loading='lazy'
        />
        {/* <div className='relative z-10 flex h-full items-center px-6 lg:px-12'>
          <h1 className='text-2xl font-bold lg:text-4xl'>
            New Shop User Registration
          </h1>
        </div> */}
      </div>

      {/* 表单主体 */}
      <div className='flex flex-1 items-start justify-center px-4 py-8 lg:py-12'>
        <form onSubmit={handleSubmit} className='w-full max-w-4xl space-y-10'>
          {/* Personal Information */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <User className='text-foreground h-6 w-6' />
              <h2 className='text-foreground text-xl font-semibold'>
                Personal Information
              </h2>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='email'
                  className='text-foreground text-sm font-medium'
                >
                  Email
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
                    First Name
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
                    Last Name
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

          {/* Shop Information */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <Store className='text-foreground h-6 w-6' />
              <h2 className='text-foreground text-xl font-semibold'>
                Shop Information
              </h2>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label
                  htmlFor='shopName'
                  className='text-foreground text-sm font-medium'
                >
                  Name
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
                  Number
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
                Address
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
          </section>

          {/* Password */}
          <section className='space-y-6'>
            <div className='flex items-center gap-3'>
              <Lock className='text-foreground h-6 w-6' />
              <h2 className='text-foreground text-xl font-semibold'>
                Password
              </h2>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label
                  htmlFor='password'
                  className='text-foreground text-sm font-medium'
                >
                  Password
                </Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
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
                      showPassword ? 'Hide password' : 'Show password'
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
                  Confirm Password
                </Label>
                <div className='relative'>
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder='Confirm your password'
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
                      showConfirmPassword ? 'Hide password' : 'Show password'
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

          {/* 提交按钮 */}
          <div className='flex justify-end pt-6'>
            <Button
              type='submit'
              variant='default'
              className='h-12 rounded-full px-8 font-medium shadow-md transition-all'
              disabled={isLoading}
            >
              {isLoading ? 'Completing...' : 'Complete Registration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
