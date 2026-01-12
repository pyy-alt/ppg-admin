import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PersonApi from '@/js/clients/base/PersonApi';
import AuthenticationApi from '@/js/clients/base/AuthenticationApi';
import PersonBase from '@/js/models/base/PersonBase';
import UpdatePasswordRequest from '@/js/models/UpdatePasswordRequest';
import { X, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, useFormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { refreshUserData } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// 翻译错误消息的组件
function TranslatedFormMessage() {
  const { error } = useFormField();
  const { t } = useTranslation();
  
  if (!error?.message) return null;
  
  return (
    <p className="text-sm font-medium text-destructive">
      {t(error.message)}
    </p>
  );
}

const formSchema = z
  .object({
    firstName: z.string().min(1, 'profile.form.firstName.required'),
    lastName: z.string().min(1, 'profile.form.lastName.required'),
    email: z.string().email('profile.form.email.invalid'),
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      // 如果任何密码字段被填写，则所有密码字段都必需
      const hasAnyPassword = data.currentPassword || data.newPassword || data.confirmPassword;
      if (!hasAnyPassword) return true; // 不修改密码时跳过验证
      return !!data.currentPassword;
    },
    {
      message: 'profile.form.currentPassword.required',
      path: ['currentPassword']
    }
  )
  .refine(
    (data) => {
      const hasAnyPassword = data.currentPassword || data.newPassword || data.confirmPassword;
      if (!hasAnyPassword) return true;
      return !!data.newPassword;
    },
    {
      message: 'profile.form.newPassword.required',
      path: ['newPassword']
    }
  )
  .refine(
    (data) => {
      const hasAnyPassword = data.currentPassword || data.newPassword || data.confirmPassword;
      if (!hasAnyPassword) return true;
      return !!data.confirmPassword;
    },
    {
      message: 'profile.form.confirmPassword.required',
      path: ['confirmPassword']
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword.length >= 8;
      }
      return true;
    },
    {
      message: 'profile.form.password.minLength',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    { message: 'profile.form.password.mismatch', path: ['confirmPassword'] }
  );

type FormValues = z.infer<typeof formSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id: number | undefined;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function EditProfileDialog({ open, onOpenChange, initialData }: EditProfileDialogProps) {
  const { t } = useTranslation(); // 新增：获取 t 函数

  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData?.firstName,
      lastName: initialData?.lastName,
      email: initialData?.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  /**
   * 更新個人資料
   */
  const updateProfile = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const personApi = new PersonApi();
      const request = new PersonBase();
      request.id = initialData?.id;
      request.firstName = form.getValues('firstName');
      request.lastName = form.getValues('lastName');
      request.email = form.getValues('email');

      personApi.edit(request, {
        status200: () => {
          refreshUserData();
          resolve();
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          reject(error);
        },
        else: (_statusCode, message) => {
          console.error('Unexpected response while updating profile');
          reject(new Error(message));
        },
      });
    });
  };

  /**
   * 更新密碼
   */
  const updatePassword = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const authApi = new AuthenticationApi();
      const request = UpdatePasswordRequest.create({
        currentPassword: form.getValues('currentPassword'),
        newPassword: form.getValues('newPassword'),
      });

      authApi.updatePassword(request, {
        status200: () => {
          resolve();
        },
        status409: (message) => {
          console.error('Password update conflict:', message);
          reject(new Error(message));
        },
        error: (error) => {
          console.error('Error updating password:', error);
          reject(error);
        },
        else: (_statusCode, message) => {
          console.error('Unexpected response while updating password');
          reject(new Error(message));
        },
      });
    });
  };

  /**
   * 表單送出處理
   */
  const onSubmit = async () => {
    try {
      const hasPasswordFields =
        form.getValues('currentPassword') || form.getValues('newPassword') || form.getValues('confirmPassword');

      // 更新個人資料
      await updateProfile();

      // 如果有填寫密碼欄位，則更新密碼
      if (hasPasswordFields) {
        await updatePassword();
        toast.success(t('profile.toast.updateSuccess'));
      } else {
        toast.success(t('profile.toast.profileUpdateSuccess'));
      }

      // 成功後關閉對話框並重置表單
      onOpenChange(false);
      form.reset();
      setShowPasswordSection(false);
    } catch (error) {
      // 顯示錯誤訊息
      if (error instanceof Error) {
        toast.error(error.message || t('profile.toast.updateFailed'));
      } else {
        toast.error(t('profile.toast.updateFailed'));
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setShowPasswordSection(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('profile.dialog.title')}</DialogTitle>
          <button
            onClick={handleClose}
            className="absolute transition-opacity rounded-sm ring-offset-background focus:ring-ring top-4 right-4 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">{t('common.close')}</span>
          </button>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-lg font-medium">
                <User className="w-5 h-5 text-foreground" />
                <h3>{t('profile.section.personalInfo')}</h3>
              </div>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('profile.form.firstName.label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('profile.form.firstName.placeholder')} {...field} />
                      </FormControl>
                      <TranslatedFormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>{t('profile.form.lastName.label')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('profile.form.lastName.placeholder')} {...field} />
                      </FormControl>
                      <TranslatedFormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>{t('profile.form.email.label')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className="bg-muted" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Separator />
            {/* Password Section - Click to Expand */}
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="flex items-center justify-between w-full px-4 py-3 text-left transition-colors rounded-lg bg-muted hover:bg-muted/80"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-foreground" />
                  <span className="font-medium">{t('profile.section.updatePassword')}</span>
                </div>
                <svg
                  className={`text-muted-foreground h-5 w-5 transition-transform ${showPasswordSection ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showPasswordSection && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('profile.form.currentPassword.label')}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t('profile.form.currentPassword.placeholder')}
                            {...field}
                          />
                        </FormControl>
                        <TranslatedFormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('profile.form.newPassword.label')}</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder={t('profile.form.newPassword.placeholder')} {...field} />
                        </FormControl>
                        <TranslatedFormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('profile.form.confirmPassword.label')}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t('profile.form.confirmPassword.placeholder')}
                            {...field}
                          />
                        </FormControl>
                        <TranslatedFormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
            <DialogFooter className="gap-3 sm:gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="default" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
