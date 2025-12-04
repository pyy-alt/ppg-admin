import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import CompleteRegistrationRequest from '@/js/models/CompleteRegistrationRequest'
import Session from '@/js/models/Session'
import { User, Store, Lock, MapPin, EyeOff, Eye } from 'lucide-react'
import { toast } from 'sonner'
import bannerImg from '@/assets/img/registration/banner.png'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loading } from '@/components/Loading'
import { Header } from '@/components/layout/header'

export function RegistrationComplete() {
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
  // 查询参数
  const { id, hash, guid } = useParams({
    from: '/registration/complete/$id/$guid/$hash',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidating, setIsValidating] = useState(true) // 正在验证链接

  const authApi = new AuthenticationApi()
  const { auth } = useAuthStore()

  // ✅ 添加 ref 防止重复调用
  const hasValidatedRef = useRef(false)
  useEffect(() => {
    // ✅ 如果已经验证过，不再重复调用
    if (hasValidatedRef.current) {
      return
    }
    // ✅ 添加参数验证
    if (!id || !guid || !hash) {
      toast.error('Invalid registration link parameters.')
      setIsValidating(false)
      return
    }

    // ✅ 标记为已开始验证
    hasValidatedRef.current = true
    // 调用 sessionCreate API 验证邮件链接并创建临时会话
    // 如果用户已经登录，这个调用会创建新的临时会话并覆盖之前的会话
    authApi.sessionCreate(
      id,
      guid,
      hash,
      {
        status200: (session: Session) => {
          if (session) {
            auth.setUser(session) // setUser 会自动设置 loginStatus 为 'authenticated'

            // ✅ 构建完整地址（包含 city, state, zip）
            const organization =
              session.person?.shop || session.person?.dealership
            const addressParts = [
              organization?.address,
              organization?.city,
              organization?.state,
              organization?.zip,
            ].filter(Boolean) // 过滤掉空值
            const fullAddress = addressParts.join(', ')

            // ✅ 更新表单数据，使用从 API 获取的真实数据
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
          // 链接无效或已过期
          toast.error('Registration link is invalid or has expired.')
          setIsValidating(false)
          // 不立即重定向，让用户看到错误提示
          // 用户可以选择手动返回或重新申请重置链接
        },
        error: () => {
          // 网络错误等
          toast.error('Failed to validate reset link. Please try again.')
          setIsValidating(false)
          // ✅ 错误时重置 ref，允许重试
          hasValidatedRef.current = false
        },
      },
      null
    )
  }, [id, guid, hash]) // 只在组件挂载时执行一次

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
      // 调用 updatePassword API 更新密码
      // 注意：由于会话是通过邮件链接创建的，不需要提供 currentPassword
      const request = CompleteRegistrationRequest.create({
        firstName: form.firstName,
        lastName: form.lastName,
        newPassword: form.password,
      })
      authApi.registrationComplete(request, {
        status200: () => {
          // ✅ 注册完成后，清除用户状态（因为要跳转到登录页）
          auth.reset()

          toast.success('Registration completed successfully!')

          // ✅ 跳转到登录页，使用 replace: true 避免返回
          navigate({
            to: '/login',
            replace: true,
          })

          setIsLoading(false)
        },
        // ✅ 409 错误：全局已显示 toast.warning，这里只需重置 loading
        status409: () => {
          setIsLoading(false)
        },
        // ✅ 其他错误：全局已显示 toast.error，这里只需重置 loading
        error: (error: Error) => {
            // ✅ 检查是否是 JSON 解析错误（API 返回纯文本 "successful operation"）
            const errorMessage = error?.message || String(error)
            if (
              errorMessage.includes('JSON.parse') ||
              errorMessage.includes('unexpected character') ||
              errorMessage.includes('successful operation')
            ) {
              // ✅ 如果是 JSON 解析错误，说明 API 返回了纯文本成功消息，当作成功处理
              console.log('[registrationComplete] API returned plain text, treating as success')
              auth.reset()
              toast.success('Registration completed successfully!')
              navigate({
                to: '/login',
                replace: true,
              })
              setIsLoading(false)
              return
            }
  
            // ✅ 其他错误正常处理
            console.error('Registration complete error:', error)
          setIsLoading(false)
        },
      })
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
      setIsLoading(false)
    }
  }
  // 如果正在验证链接，显示加载状态
  if (isValidating) {
    return <Loading />
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
