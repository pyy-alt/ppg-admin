import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import type Session from '@/js/models/Session'
import UpdatePasswordRequest from '@/js/models/UpdatePasswordRequest'
import { Route } from '@/routes/password/reset/$id/$guid/$hash'
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

interface ResetPasswordProps {
  id: string
  guid: string
  hash: string
}

export function ResetPassword() {
  const logoSrc = useBrandLogo('login', '_a.png')
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const { id, guid, hash }: ResetPasswordProps = Route.useParams()

  console.log(id, guid, hash)

  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true) // 正在验证链接
  const [isLinkValid, setIsLinkValid] = useState(false) // 链接是否有效
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 组件挂载时调用 sessionCreate() 验证链接并创建临时会话
  // 根据路由规范：通过邮件链接跳转时，调用 AuthenticationApi::sessionCreate(id, guid, hash) 创建会话
  //
  // 注意：即使用户已经登录，也可以访问此页面
  // - sessionCreate() 会创建一个新的临时会话，覆盖之前的正常会话
  // - 这是安全的，因为邮件链接包含 id, guid, hash 验证
  // - 用户可能想重置密码，即使已经登录
  useEffect(() => {
    // 调用 sessionCreate API 验证邮件链接并创建临时会话
    // 如果用户已经登录，这个调用会创建新的临时会话并覆盖之前的会话
    authApi.sessionCreate(
      id,
      guid,
      hash,
      {
        status200: (session: Session) => {
          // 链接有效，临时会话已创建，用户已自动登录
          // 后端已通过 Set-Cookie 设置了 HttpOnly Cookie
          // 更新前端状态
          const person = session.person
          if (person) {
            const userInfo = {
              id: person.id || 0,
              email: person.email || '',
              firstName: person.firstName || '',
              lastName: person.lastName || '',
              type: (person.type || 'Shop') as
                | 'Shop'
                | 'Dealership'
                | 'Csr'
                | 'FieldStaff'
                | 'ProgramAdministrator',
              status: (person.status || 'Active') as
                | 'Active'
                | 'Inactive'
                | 'RegistrationRequested'
                | 'Pending',
              shopName: person.shop?.name,
              shopNumber: person.shop?.shopNumber,
              dealershipName: person.dealership?.name,
              dealershipNumber: person.dealership?.dealershipNumber,
            }
            auth.setUser(userInfo) // setUser 会自动设置 loginStatus 为 'authenticated'
          }
          setIsLinkValid(true)
          setIsValidating(false)
        },
        status404: () => {
          // 链接无效或已过期
          toast.error('Reset link is invalid or has expired.')
          setIsLinkValid(false)
          setIsValidating(false)
          // 不立即重定向，让用户看到错误提示
          // 用户可以选择手动返回或重新申请重置链接
        },
        error: () => {
          // 网络错误等
          toast.error('Failed to validate reset link. Please try again.')
          setIsValidating(false)
        },
      },
      null
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在组件挂载时执行一次

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    setIsLoading(true)
    try {
      // 调用 updatePassword API 更新密码
      // 注意：由于会话是通过邮件链接创建的，不需要提供 currentPassword
      const request = UpdatePasswordRequest.create({ newPassword: password })
      authApi.updatePassword(request, {
        status200: () => {
          toast.success('Your password has been successfully updated.')
          // 密码更新成功后，清除会话并跳转到登录页
          auth.reset()
          navigate({ to: '/login' })
        },
        status409: () => {
          toast.error('Password update failed. Please try again.')
        },
        error: () => {
          toast.error('Failed to reset password. Please try again.')
        },
      })
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // 如果正在验证链接，显示加载状态
  if (isValidating) {
    return <Loading />
  }

  // 如果链接无效，显示错误信息
  if (!isLinkValid) {
    return (
      <div className='flex min-h-screen flex-col bg-background'>
        <Header isShowUser={false} />
        <div className='flex flex-1 flex-col items-center justify-center px-4 py-8'>
          <div className='w-full max-w-md space-y-6 text-center'>
            <h1 className='text-2xl font-bold text-foreground'>
              Invalid Reset Link
            </h1>
            <p className='text-muted-foreground'>
              The password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <div className='flex justify-center gap-4'>
              <Link
                to='/password/forgot'
                variant='default'
                className='rounded-full px-4 py-2 transition-colors'
              >
                Request New Link
              </Link>
              <Link
                to='/login'
                className='rounded-full border  px-4 py-2 text-foreground transition-colors hover:bg-muted/50'
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      {/* 复用 Header（隐藏用户下拉） */}
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

      {/* 主体：上下布局，单屏展示 */}
      <div className='flex flex-1 flex-col items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md space-y-10'>
          {/* 下部：重置密码表单 */}
          <div className='space-y-8'>
            <h1 className='text-center text-3xl font-bold text-foreground'>
              Change Password
            </h1>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* New Password */}
              <div className='space-y-2'>
                <Label
                  htmlFor='password'
                  className='text-sm font-medium text-foreground'
                >
                  New Password
                </Label>
                <div className='relative'>
                  <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    id='password'
                    type='password'
                    placeholder='Enter new password'
                    className='h-12 rounded-full  pl-11 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
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
                  className='text-sm font-medium text-foreground'
                >
                  Confirm Password
                </Label>
                <div className='relative'>
                  <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    id='confirm'
                    type='password'
                    placeholder='Confirm new password'
                    className='h-12 rounded-full  pl-11 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              {/* 返回登录 */}
              <div className='text-right'>
                <Link
                  to='/login'
                  className='text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-700'
                >
                  Back to Login
                </Link>
              </div>

              {/* 提交按钮 */}
              <Button
                type='submit'
                variant='default'
                className='h-12 w-full rounded-full font-medium shadow-md transition-all'
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
