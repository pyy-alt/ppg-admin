// src/pages/RegistrationResult.tsx
'use client'

import { useSearch, Link } from '@tanstack/react-router'
import { CheckCircle2, XCircle, User } from 'lucide-react'
import { Header } from '@/components/layout/header'


type ResultType = 'success' | 'duplicate' | 'error'

export function RegistrationResult() {
  // const navigate = useNavigate()
  const { status } = useSearch({ from: '/registrationResult' }) as {
    status: ResultType
  }

  // 自动跳转到登录页（可选）
  // useEffect(() => {
  //   if (status === 'success') {
  //     const timer = setTimeout(() => {
  //       navigate({ to: '/login' });
  //     }, 8000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [status, navigate]);

  const resultConfig = {
    success: {
      icon: <CheckCircle2 className='mx-auto mb-6 h-16 w-16 text-green-600' />,
      title: 'Your registration is complete.',
      message: (
        <>
          <p className='mb-2 text-gray-600'>
            Your registration is complete.
          </p>
          <p className='mb-6 text-gray-600'>
            You will receive an email once your account is approved.
          </p>
          <p className='text-gray-600'>
            If you have any questions, please contact{' '}
            <a
              href='mailto:support@restrictedpartstracker.com'
              className='font-medium text-cyan-600 underline hover:text-cyan-700'
            >
              support@restrictedpartstracker.com
            </a>
            .
          </p>
        </>
      ),
    },
    duplicate: {
      icon: <User className='mx-auto mb-6 h-16 w-16 text-blue-600' />,
      title: 'You already have an account.',
      message: (
        <>
          <p className='mb-4 text-gray-600'>
            You already have an account in our system.{' '}
            <Link
              to='/login'
              className='font-medium text-cyan-600 underline hover:text-cyan-700'
            >
              Log in here
            </Link>{' '}
            or{' '}
            <Link
              to='/password/reset/$id/$guid/$hash'
              params={{ id: '1', guid: '2', hash: '3' }}
              className='font-medium text-cyan-600 underline hover:text-cyan-700'
            >
              reset your password
            </Link>{' '}
            if you've forgotten it.
          </p>
          <p className='text-gray-600'>
            If you have any questions, please contact{' '}
            <a
              href='mailto:support@restrictedpartstracker.com'
              className='font-medium text-cyan-600 underline hover:text-cyan-700'
            >
              support@restrictedpartstracker.com
            </a>
            .
          </p>
        </>
      ),
    },
    error: {
      icon: <XCircle className='mx-auto mb-6 h-16 w-16 text-red-600' />,
      title: "We couldn't complete your registration.",
      message: (
        <>
          <p className='mb-6 text-gray-600'>
            Your registration could not be processed. Please contact{' '}
            <a
              href='mailto:support@restrictedpartstracker.com'
              className='font-medium text-cyan-600 underline hover:text-cyan-700'
            >
              support@restrictedpartstracker.com
            </a>{' '}
            for further assistance.
          </p>
        </>
      ),
    },
  }

  const config = resultConfig[status] || resultConfig.error

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* 复用 Header（隐藏用户下拉） */}
      <Header isShowUser={false} />

      {/* 结果主体 - 居中布局 */}
      <div className='flex flex-1 items-center justify-center px-4 py-12'>
        <div className='w-full max-w-2xl space-y-8 text-center'>
          {/* 图标 */}
          {config.icon}

          {/* 标题 */}
          <h1 className='text-3xl font-bold text-gray-900 lg:text-4xl'>
            {config.title}
          </h1>

          {/* 描述文字 */}
          <div className='mx-auto max-w-xl text-center text-base lg:text-lg'>
            {config.message}
          </div>

          {/* 成功时显示登录按钮 */}
          {status === 'success' && (
            <div className='pt-6'>
              {/* <Button
                onClick={() => navigate({ to: '/login' })}
                variant="default"
                className="h-12 px-8 rounded-full font-medium shadow-md transition-all inline-flex items-center gap-2"
              >
                <LogIn className="h-5 w-5" />
                Go to Login
              </Button> */}
            </div>
          )}

          {/* 重复/错误时显示返回注册按钮 */}
          {/* {(status === 'duplicate' || status === 'error') && (
            <div className="pt-6">
              <Button
                onClick={() => navigate({ to: '/registration/shop' })}
                variant="outline"
                className="h-12 px-8 rounded-full font-medium border-gray-300"
              >
                Back to Registration
              </Button>
            </div>
          )} */}
        </div>
      </div>
    </div>
  )
}
