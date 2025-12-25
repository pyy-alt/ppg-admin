import { useState } from 'react';
import { useNavigate, useSearch, Link } from '@tanstack/react-router';
import AuthenticationApi from '@/js/clients/base/AuthenticationApi';
import LoginRequest from '@/js/models/LoginRequest';
import type Session from '@/js/models/Session';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { toast } from 'sonner';
import bg from '@/assets/img/login/bg.png';
import { useAuthStore } from '@/stores/auth-store';
import { useBrand } from '@/context/brand-context';
import useBrandLogo from '@/hooks/use-bran-logo';
import { useRedirectIfAuthenticated } from '@/hooks/use-redirect-if-authenticated';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/header';
import { refreshUserData } from '@/lib/auth';
import { useTranslation } from 'react-i18next';

export function Login() {
  const { t } = useTranslation();
  const { redirect } = useSearch({ from: '/(auth)/login' });
  const { region } = useBrand();
  const suffix = region === 'canada' ? '_c.png' : '_a.png';
  const logoSrc = useBrandLogo('login', suffix);
  const navigate = useNavigate();
  const { auth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Use hook Handle redirection for logged-in users
  const { isLoading: isCheckingAuth, LoadingComponent } = useRedirectIfAuthenticated();

  const [isSubmitting, setIsSubmitting] = useState(false); // Add submission status marker

  // If checking authentication status，Show loading status
  if (isCheckingAuth && LoadingComponent) {
    return <LoadingComponent />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Add：Prevent event bubbling

    // Add：Prevent duplicate submission
    if (isLoading || isSubmitting) {
      return;
    }

    if (!email || !password) {
      toast.error(t('auth.login.errors.emailPasswordRequired'));
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      const request = new LoginRequest();
      request.email = email.trim();
      request.password = password;

      const authApi = new AuthenticationApi();
      authApi.login(
        request,
        {
          // 200 Success
          status200: (session: Session) => {
            // Backend has passed Set-Cookie Automatically set JWT，No need for frontend processing Cookie

            // From session.person Build user information（Completely rely on data returned by the backend）
            if (!session) {
              toast.error(t('auth.login.errors.invalidSession'));
              setIsLoading(false);
              setIsSubmitting(false);
              return;
            }
            auth.setUser(session); // setUser Will be automatically set loginStatus For 'authenticated'
            toast.success(t('auth.login.success.welcome', { name: session.person?.firstName || email }));

            setIsLoading(false);
            setIsSubmitting(false);
            refreshUserData();

            // Support after login redirect（Exactly the same as before）
            let targetPath = '/';
            if (redirect) {
              try {
                const url = new URL(redirect);
                targetPath = url.pathname + url.search;
              } catch {
                targetPath = redirect.startsWith('/') ? redirect : `/${redirect}`;
              }
            }

            navigate({ to: targetPath as any, replace: true });
          },

          error: (err: Error) => {
            // console.error('Login error:', err)
            toast.error(t('auth.login.errors.networkError', { error: err.message }));
            setIsLoading(false);
            setIsSubmitting(false);
          },
          else: (statusCode: number, message: string) => {
            // eslint-disable-next-line no-console
            console.error('Login error:', statusCode, message);
            toast.error(t('auth.login.errors.networkErrorDefault'));
            setIsLoading(false);
            setIsSubmitting(false);
          },
        },
        null
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Login error:', error);
      toast.error(t('auth.login.errors.unexpectedError'));
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Directly reuse Header Component（Include user dropdown + Earth languages） */}
      <Header isShowUser={false} />

      {/* Main Content: Vertical layout */}
      <div className="flex flex-1 flex-col">
        {/* Upper part：Brand display area */}
        <div
          className="flex flex-col items-center justify-center px-6 py-12 lg:py-16"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {logoSrc ? (
            <img
              loading="lazy"
              src={logoSrc}
              alt="logo"
              className="mx-auto h-36 w-auto max-w-lg space-y-8 text-center drop-shadow-xl lg:h-56"
            />
          ) : null}
        </div>

        {/* Lower part：Login form */}
        <div className="flex flex-1 items-start justify-center px-1 py-2 lg:py-12">
          <div className="w-full max-w-md p-8 lg:p-10">
            <h2 className="text-primary mb-10 text-center text-3xl font-bold lg:text-4xl">{t('auth.login.title')}</h2>
            <form className="space-y-7" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-muted-foreground text-base font-medium">
                  {/* Email Address */}
                </Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.login.emailPlaceholder')}
                    className="text-muted-foreground h-12 rounded-full border-gray-300 pl-12 text-base focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-muted-foreground text-base font-medium">
                  {/* Password */}
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    className="text-muted-foreground h-12 rounded-full border-gray-300 pr-12 pl-12 text-base focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {/* Small eye button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" disabled={isLoading} className="bg-muted cursor-pointer" />
                  <Label htmlFor="remember" className="cursor-pointer font-normal text-gray-600">
                    {t('auth.login.rememberMe')}
                  </Label>
                </div>
                <Link
                  to="/password/forgot"
                  className="font-medium text-red-600 underline transition-colors hover:text-red-700"
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="text-muted h-14 w-full rounded-full text-base font-semibold shadow-md transition-all hover:bg-gray-900"
                disabled={isLoading}
              >
                {isLoading ? t('auth.login.loggingIn') : t('auth.login.submit')}
              </Button>
            </form>

            {/* Register Links */}
            <div className="mt-10 text-center text-sm text-gray-600">
              <p className="mb-3">{t('auth.login.noAccount')}</p>
              <div className="flex justify-center gap-8">
                <a
                  href="/registration/shop"
                  className="font-medium text-cyan-600 underline transition-colors hover:text-cyan-700"
                >
                  {t('auth.login.registerAsShop')}
                </a>
                <a
                  href="/registration/dealership"
                  className="font-medium text-cyan-600 underline transition-colors hover:text-cyan-700"
                >
                  {t('auth.login.registerAsDealer')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
