import { useEffect } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import PersonApi from '@/js/clients/base/PersonApi'
import PersonCreateModel from '@/js/models/Person'
import Person from '@/js/models/Person'
import { X } from 'lucide-react'
import { useTranslation } from '@/context/i18n-provider'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { PersonType } from '@/js/models/enum/PersonTypeEnum'
import { toast } from 'sonner'

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z
    .enum(['ProgramAdministrator', 'Csr', 'FieldStaff'])
    .optional()
    .refine((val) => val !== undefined, {
      message: 'Please select a role',
    }),
  regions: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddNetworkUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: Person | null
  onSuccess?: (data: FormValues) => void
  onError?: (error: Error) => void
}

export default function AddNetworkUserDialog({
  open,
  onOpenChange,
  initialValues,
  onSuccess,
  onError,
}: AddNetworkUserDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: undefined,
      regions: [],
    },
  })

  // 使用 useWatch 代替 form.watch()
  const selectedRole = useWatch({
    control: form.control,
    name: 'role',
  })
  const showRegionSelector = selectedRole === 'FieldStaff'
  const showCsrRegionSelector = selectedRole === 'Csr'
  const onSubmit = async (data: FormValues) => {
    try {
      if (initialValues) {
      } else {
        const request = PersonCreateModel.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          type: data.role as PersonType,
        })
        const personApi = new PersonApi()
        await personApi.createNetworkUser(request, {
          status200: (response) => {
            onSuccess?.(response)
            toast.success('Users fetched successfully',{
              position: 'top-right',
            })
          },
          error: (error) => {
            onError?.(error)
          },
        })
        onOpenChange(false)
        form.reset()
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      form.reset() // 关闭时自动重置
    }
  }
  // 当角色切换时，清空 regions 字段
  useEffect(() => {
    if (selectedRole) {
      form.setValue('regions', [])
    }
  }, [selectedRole, form])
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        {/* 固定头部 - 统一风格 */}
        <DialogHeader className='shrink-0'>
          <DialogTitle className='px-6 py-4 text-2xl font-semibold'>
            {initialValues ? 'Edit Network User' : 'Add Network User'}
          </DialogTitle>
          <Separator />

          <button
            onClick={() => handleOpenChange(false)}
            className='ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </button>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-6 py-4'
          >
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('user.firstName')}</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter first name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter last name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='user@vwgoa.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className='w-full'>
                      <SelectTrigger>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='ProgramAdministrator'>Admin</SelectItem>
                      <SelectItem value='Csr'>CSR</SelectItem>
                      <SelectItem value='FieldStaff'>Field Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showRegionSelector && (
              <div className='space-y-3'>
                <Label>CSR Region(s)</Label>
                <div className='bg-muted space-y-3 rounded-md border p-4'>
                  {['Eastern US', 'Central US', 'Western US', 'Canada'].map(
                    (region) => (
                      <FormField
                        key={region}
                        control={form.control}
                        name='regions'
                        render={({ field }) => (
                          <FormItem className='flex items-center space-x-3'>
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(region)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), region]
                                    : (field.value || []).filter(
                                        (r: string) => r !== region
                                      )
                                  field.onChange(newValue)
                                }}
                              />
                            </FormControl>
                            <FormLabel className='cursor-pointer font-normal'>
                              {region}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {showCsrRegionSelector && (
              <div className='space-y-3'>
                <Label>CSR Region</Label>
                <div className='bg-muted space-y-3 rounded-md border p-4'>
                  <FormField
                    control={form.control}
                    name='regions'
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value?.[0] || ''}
                        onValueChange={(value) => {
                          // 将字符串转换为数组（单选，所以数组只有一个元素）
                          field.onChange([value])
                        }}
                      >
                        {[
                          'Eastern US',
                          'Central US',
                          'Western US',
                          'Canada',
                        ].map((region) => (
                          <FormItem
                            key={region}
                            className='flex items-center space-y-0 space-x-3'
                          >
                            <FormControl>
                              <RadioGroupItem value={region} id={region} />
                            </FormControl>
                            <FormLabel
                              htmlFor={region}
                              className='cursor-pointer font-normal'
                            >
                              {region}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    )}
                  />
                </div>
              </div>
            )}

            <DialogFooter className='mt-4 gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type='submit'
                variant='default'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? t('common.creating')
                  : t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
