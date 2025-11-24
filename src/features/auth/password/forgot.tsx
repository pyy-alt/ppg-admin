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

  // ===================当用户登录状态没有实效之后直接跳转首页==============

  const { isLoading: isCheckingAuth, LoadingComponent } =
    useRedirectIfAuthenticated()

  // 组件挂载时调用 logout() 清除会话
  // 根据路由规范：访问 /password/forgot 时需要调用 AuthenticationApi::sessionLogout()
  // 注意：authApi.logout() 就是 AuthenticationApi::sessionLogout() 的实现
  // 优化：只在用户已登录时才调用 logout，避免不必要的 API 调用
  useEffect(() => {
    // 如果用户已登录，调用 logout 清除会话
    // 如果用户未登录，直接清除前端状态即可
    if (auth.loginStatus === 'authenticated') {
      // 调用后端 API 清除会话（会清除 HttpOnly Cookie）
      authApi.logout({
        status200: () => {
          // API 调用成功，清除前端状态
          auth.reset()
        },
        error: () => {
          // 即使 API 调用失败，也清除前端状态（可能是网络问题，但前端状态应该清除）
          auth.reset()
        },
      })
    } else {
      // 用户未登录，直接清除前端状态
      auth.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在组件挂载时执行一次

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const request = ForgotPasswordRequest.create({ email })
      authApi.forgotPassword(request, {
        status200: () => {
          toast.success(`Password reset link has been sent to ${email}`)
          navigate({ to: '/login' })
        },
        error: () => {
          toast.error('Failed to send reset link. Please try again.')
        },
      })
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // 如果正在检查认证状态或已登录，显示加载状态
  // 这段代码必须放在后面 因为React Hook的规则要求Hook必须在组件的顶层调用
  if (isCheckingAuth && LoadingComponent) {
    return <LoadingComponent />
  }
  //============end------======================

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      {/* 复用 Header（隐藏用户下拉） */}
      <Header isShowUser={false} />

      {/* Main Content: 上下布局 */}
      <div className='flex flex-1 flex-col'>
        {/* 上部：品牌展示区 - 通栏显示 */}
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

        {/* 下部：忘记密码表单 */}
        <div className='flex flex-1 items-start justify-center bg-card px-1 py-2 lg:py-12'>
          <div className='w-full max-w-md p-8 lg:p-10'>
            <h2 className='mb-4 text-center text-3xl font-bold text-foreground lg:text-4xl'>
              Forgot Password
            </h2>
            <form onSubmit={handleSubmit} className='space-y-7'>
              {/* Email 输入框 */}
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

              {/* 提交按钮 */}
              <Button
                type='submit'
                variant='default'
                className='h-14 w-full rounded-full text-base font-semibold shadow-md transition-all'
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            {/* 返回登录 */}
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