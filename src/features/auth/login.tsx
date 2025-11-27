import { useState  } from 'react'
import { useNavigate, useSearch, Link } from '@tanstack/react-router'
import AuthenticationApi from '@/js/clients/base/AuthenticationApi'
import LoginRequest from '@/js/models/LoginRequest'
import type Session from '@/js/models/Session'
import { Mail, Lock, EyeOff, Eye } from 'lucide-react'
import { toast } from 'sonner'
import bg from '@/assets/img/login/bg.png'
import { useAuthStore } from '@/stores/auth-store'
import useBrandLogo from '@/hooks/use-bran-logo'
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'

export function Login() {
  const { redirect, region } = useSearch({ from: '/(auth)/login' })
  // 根据 region 选择正确的后缀：america -> '_a.png', canada -> '_c.png'
  const suffix = region === 'canada' ? '_c.png' : '_a.png'
  const logoSrc = useBrandLogo('login', suffix as string)
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // 使用 hook 处理已登录用户重定向
  const { isLoading: isCheckingAuth, LoadingComponent } =
    useRedirectIfAuthenticated()

  const [isSubmitting, setIsSubmitting] = useState(false) // 添加提交状态标记

   // 如果正在检查认证状态，显示加载状态
   if (isCheckingAuth && LoadingComponent) {
    return <LoadingComponent />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // 添加：阻止事件冒泡

    // 添加：防止重复提交
    if (isLoading || isSubmitting) {
      return
    }

    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setIsSubmitting(true)
    setIsLoading(true)

    try {
      const request = new LoginRequest()
      request.email = email.trim()
      request.password = password

      const authApi = new AuthenticationApi()
      authApi.login(
        request,
        {
          // 200 成功
          status200: (session: Session) => {
            // 后端已经通过 Set-Cookie 自动设置了 JWT，前端不需要处理 Cookie

            // 从 session.person 构建用户信息（完全依赖后端返回的数据）
            const person = session.person
            if (!person) {
              toast.error('Invalid session data')
              setIsLoading(false)
              setIsSubmitting(false)
              return
            }

            // 构建用户信息（根据后端实际返回的数据结构）
            const userInfo = {
              id: person.id || 0,
              email: person.email || email,
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
              // 可选字段（根据后端返回的数据）
              shopName: person.shop?.name,
              shopNumber: person.shop?.shopNumber,
              dealershipName: person.dealership?.name,
              dealershipNumber: person.dealership?.dealershipNumber,
            }

            // 更新用户信息和认证状态
            auth.setUser(userInfo) // setUser 会自动设置 loginStatus 为 'authenticated'

            toast.success(`Welcome back, ${person.firstName || email}!`)

            setIsLoading(false)
            setIsSubmitting(false)

            // 支持登录后 redirect（和原来完全一致）
            let targetPath = '/'
            if (redirect) {
              try {
                const url = new URL(redirect)
                targetPath = url.pathname + url.search
              } catch {
                targetPath = redirect.startsWith('/')
                  ? redirect
                  : `/${redirect}`
              }
            }

            navigate({ to: targetPath as any, replace: true })
          },

          error: (err: Error) => {
            // console.error('Login error:', err)
            toast.error(`Network error, please try again ${err.message}`)
            setIsLoading(false)
            setIsSubmitting(false)
          },
          else: (statusCode: number, message: string) => {
            // eslint-disable-next-line no-console
            console.error('Login error:', statusCode, message)
            toast.error('Network error, please try again')
            setIsLoading(false)
            setIsSubmitting(false)
          },
        },
        null
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Login error:', error)
      toast.error('An unexpected error occurred')
      setIsLoading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* 直接复用 Header 组件（包含用户下拉 + 地球语言） */}
      <Header isShowUser={false} />

      {/* Main Content: 上下布局 */}
      <div className='flex flex-1 flex-col'>
        {/* 上部：品牌展示区 */}
        <div
          className='flex flex-col items-center justify-center px-6 py-12 lg:py-16'
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
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

        {/* 下部：登录表单 */}
        <div className='flex flex-1 items-start justify-center px-1 py-2 lg:py-12'>
          <div className='w-full max-w-md p-8 lg:p-10'>
            <h2 className='text-primary mb-10 text-center text-3xl font-bold lg:text-4xl'>
              Login
            </h2>
            <form className='space-y-7' onSubmit={handleSubmit}>
              {/* Email */}
              <div className='space-y-3'>
                <Label
                  htmlFor='email'
                  className='text-muted-foreground text-base font-medium'
                >
                  Email Address
                </Label>
                <div className='relative'>
                  <Mail className='text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2' />
                  <Input
                    id='email'
                    type='email'
                    placeholder='Enter your email'
                    className='text-muted-foreground h-14 rounded-full border-gray-300 pl-12 text-base focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className='space-y-3'>
                <Label
                  htmlFor='password'
                  className='text-muted-foreground text-base font-medium'
                >
                  Password
                </Label>
                <div className='relative'>
                  <Lock className='absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400' />
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter your password'
                    className='text-muted-foreground h-14 rounded-full border-gray-300 pr-12 pl-12 text-base focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {/* 小眼睛按钮 */}
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute top-1/2 right-4 -translate-y-1/2 hover:text-gray-700'
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className='flex items-center justify-between text-sm'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='remember'
                    disabled={isLoading}
                    className='bg-muted cursor-pointer'
                  />
                  <Label
                    htmlFor='remember'
                    className='cursor-pointer font-normal text-gray-600'
                  >
                    Remember Me
                  </Label>
                </div>
                <Link
                  to='/password/forgot'
                  className='font-medium text-red-600 transition-colors hover:text-red-700'
                >
                  Forgot password
                </Link>
              </div>

              {/* Submit */}
              <Button
                type='submit'
                className='text-muted h-14 w-full rounded-full text-base font-semibold shadow-md transition-all hover:bg-gray-900'
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>
            </form>

            {/* Register Links */}
            <div className='mt-10 text-center text-sm text-gray-600'>
              <p className='mb-3'>Don't have an account?</p>
              <div className='flex justify-center gap-8'>
                <a
                  href='/registration/shop'
                  className='font-medium text-cyan-600 transition-colors hover:text-cyan-700'
                >
                  Register as Shop
                </a>
                <a
                  href='/registration/dealership'
                  className='font-medium text-cyan-600 transition-colors hover:text-cyan-700'
                >
                  Register as Dealer
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
