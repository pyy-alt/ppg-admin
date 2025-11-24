// src/components/EditProfileDialog.tsx
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import PersonApi from '@/js/clients/base/PersonApi'
import PersonBase from '@/js/models/base/PersonBase'
import { X, User, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

// src/components/EditProfileDialog.tsx

// src/components/EditProfileDialog.tsx

// src/components/EditProfileDialog.tsx

// src/components/EditProfileDialog.tsx

// src/components/EditProfileDialog.tsx

// src/components/EditProfileDialog.tsx

const formSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // 只有当用户填写了密码相关字段时才校验
      if (data.currentPassword || data.newPassword || data.confirmPassword) {
        return data.currentPassword && data.newPassword && data.confirmPassword
      }
      return true
    },
    { message: 'All password fields are required', path: ['currentPassword'] }
  )
  .refine(
    (data) => {
      if (data.newPassword) {
        return data.newPassword.length >= 8
      }
      return true
    },
    {
      message: 'New password must be at least 8 characters',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword
      }
      return true
    },
    { message: 'Passwords do not match', path: ['confirmPassword'] }
  )

type FormValues = z.infer<typeof formSchema>

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function EditProfileDialog({
  open,
  onOpenChange,
  initialData = {
    firstName: 'Jake',
    lastName: 'Renshaw',
    email: 'jake.renshaw@sunsetauto.com',
  },
}: EditProfileDialogProps) {
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: FormValues) => {
    console.log('Profile updated:', data)

    const personApi = new PersonApi()
    const request = new PersonBase()
    request.firstName = initialData.firstName
    request.lastName = initialData.lastName
    request.email = initialData.email
    // 接口暂时不支持修改密码
    // request.currentPassword = form.getValues('currentPassword')
    // request.newPassword = form.getValues('newPassword')
    personApi.edit(request, {
      status200: (person: PersonBase) => {
        console.log('Profile updated:', person)
        onOpenChange(false)
        form.reset()
      },
      error: (error) => {
        console.error('Error updating profile:', error)
      },
      else: () => {
        console.error('Unexpected response while updating profile')
      },
    })
    onOpenChange(false)
    form.reset()
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
    setShowPasswordSection(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Edit profile
          </DialogTitle>
          <button
            onClick={handleClose}
            className='ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Personal Information */}
            <div className='space-y-5'>
              <div className='flex items-center gap-2 text-lg font-medium'>
                <User className='text-foreground h-5 w-5' />
                <h3>Personal Information</h3>
              </div>

              <div className='grid gap-4'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem className='mt-4'>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='mt-4'>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled className='bg-muted' />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Password Section - Click to Expand */}
            <div className='space-y-5'>
              <button
                type='button'
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className='bg-muted hover:bg-muted/80 flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors'
              >
                <div className='flex items-center gap-2'>
                  <Lock className='text-foreground h-5 w-5' />
                  <span className='font-medium'>
                    Click here to update password
                  </span>
                </div>
                <svg
                  className={`text-muted-foreground h-5 w-5 transition-transform ${showPasswordSection ? 'rotate-180' : ''}`}
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>

              {showPasswordSection && (
                <div className='animate-in fade-in slide-in-from-top-2 space-y-4'>
                  <FormField
                    control={form.control}
                    name='currentPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='••••••••'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='newPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='Enter new password'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='Confirm new password'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter className='gap-3 sm:gap-3'>
              <Button type='button' variant='outline' onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type='submit'
                variant='default'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
