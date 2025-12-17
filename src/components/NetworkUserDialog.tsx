import { useEffect } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import PersonApi from '@/js/clients/base/PersonApi'
import PersonCreateModel from '@/js/models/Person'
import type Person from '@/js/models/Person'
import Region from '@/js/models/Region'
import { type PersonType } from '@/js/models/enum/PersonTypeEnum'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { useTranslation } from '@/context/i18n-provider'
import { useDialogWithConfirm } from '@/hooks/use-dialog-with-confirm'
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
  csrRegion: z.object({ id: z.number(), name: z.string() }).optional(),
  fieldStaffRegions: z
    .array(z.object({ id: z.number(), name: z.string() }))
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NetworkUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: Person | null
  filterByRegion?: { id: number; name: string } | null
  onSuccess?: (data: FormValues) => void
  onError?: (error: Error) => void
}

export default function NetworkUserDialog({
  open,
  onOpenChange,
  initialValues,
  onSuccess,
  onError,
}: NetworkUserDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: undefined,
      csrRegion: undefined,
      fieldStaffRegions: [],
    },
  })
  const regions = useAuthStore((state) => state.auth.user?.regions || [])
  useEffect(() => {
    if (initialValues && open) {
      form.reset({
        firstName: initialValues.firstName || '',
        lastName: initialValues.lastName || '',
        email: initialValues.email || '',
        role: initialValues.type as
          | 'ProgramAdministrator'
          | 'Csr'
          | 'FieldStaff'
          | undefined,
        csrRegion: initialValues.csrRegion,
        fieldStaffRegions: initialValues.fieldStaffRegions,
      })
    } else if (!initialValues && open) {
      // ✅ If none initialValues，Reset to default value
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        role: undefined,
        csrRegion: undefined,
        fieldStaffRegions: [],
      })
    }
  }, [initialValues, open, form])

  // Use useWatch Replace form.watch()
  const selectedRole = useWatch({
    control: form.control,
    name: 'role',
  })
  const showRegionSelector = selectedRole === 'FieldStaff'
  const showCsrRegionSelector = selectedRole === 'Csr'

  const { handleCloseRequest, ConfirmDialogComponent } = useDialogWithConfirm({
    form,
    onClose: () => {
      form.reset()
      onOpenChange(false)
    },
    title: 'Discard Changes?',
    description:
      'You have unsaved changes. Are you sure you want to close? All your changes will be lost.',
  })

  const onSubmit = async (data: FormValues) => {
    try {
      const request = PersonCreateModel.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        type: data.role as PersonType,
        id: initialValues?.id || undefined, // ✅ Edit mode requires id，Creation mode is undefined
        csrRegion: data.csrRegion
          ? Region.create({ id: data.csrRegion.id, name: data.csrRegion.name })
          : undefined,
        fieldStaffRegions: data.fieldStaffRegions
          ? data.fieldStaffRegions.map((r) => Region.create(r))
          : [],
      })
      const personApi = new PersonApi()

      await new Promise((resolve) => {
        // ✅ Fix：Call separately，Do not use await（Because these methods return void）
        if (initialValues) {
          personApi.edit(request, {
            status200: (response) => {
              onSuccess?.(response)
              toast.success('User updated successfully', {
                position: 'top-right',
              })
              onOpenChange(false)
              form.reset()
              resolve(true)
            },
            error: (error) => {
              onError?.(error)
              resolve(false)
            },
            else: (_statusCode: number, responseText: string) => {
              toast.error(responseText)
              resolve(false)
            },
          })
        } else {
          personApi.createNetworkUser(request, {
            status200: (response) => {
              onSuccess?.(response)
              toast.success('User created successfully', {
                position: 'top-right',
              })
              onOpenChange(false)
              form.reset()
              resolve(true)
            },
            error: (error) => {
              onError?.(error)
              resolve(false)
            },
            else: () => {
              resolve(false)
            },
          })
        }
      })
    } catch (error: unknown) {
      onError?.(error as Error)
      throw error
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleCloseRequest()
    } else {
      onOpenChange(true)
    }
    // onOpenChange(isOpen)
    // if (!isOpen) {
    //   form.reset() // Automatically reset when closed
    // }
  }
  // When switching roles，Clear regions Field
  useEffect(() => {
    if (selectedRole) {
      form.setValue('csrRegion', undefined)
      form.setValue('fieldStaffRegions', [])
    }
  }, [selectedRole, form])
  const { t } = useTranslation()

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className='sm:max-w-lg'>
          {/* Fixed header - Unified style */}
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
                        <SelectItem value='ProgramAdministrator'>
                          Admin
                        </SelectItem>
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
                  <Label>Field Staff Region(s))</Label>
                  <div className='bg-muted space-y-3 rounded-md border p-4'>
                    {regions.map((region) => (
                      <FormField
                        key={region.id}
                        control={form.control}
                        name='fieldStaffRegions'
                        render={({ field }) => (
                          <FormItem className='flex items-center space-x-3'>
                            <FormControl>
                              <Checkbox
                                checked={field.value?.some(
                                  (r: Region) => r.id === region.id
                                )}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [
                                        ...(field.value || []),
                                        { id: region.id, name: region.name },
                                      ]
                                    : (field.value || []).filter(
                                        (r: { id: number; name: string }) =>
                                          r.id !== region.id
                                      )
                                  field.onChange(newValue)
                                }}
                              />
                            </FormControl>
                            <FormLabel className='cursor-pointer font-normal'>
                              {region.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showCsrRegionSelector && (
                <div className='space-y-3'>
                  <Label>CSR Region</Label>
                  <div className='bg-muted space-y-3 rounded-md border p-4'>
                    <FormField
                      control={form.control}
                      name='csrRegion'
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value?.id?.toString() || ''}
                          onValueChange={(value) => {
                            const selectedRegion = regions.find(
                              (r) => r.id?.toString() === value
                            )
                            field.onChange(
                              selectedRegion
                                ? {
                                    id: selectedRegion.id,
                                    name: selectedRegion.name,
                                  }
                                : undefined
                            )
                          }}
                        >
                          {regions.map((region) => (
                            <FormItem
                              key={region.id}
                              className='flex items-center space-y-0 space-x-3'
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={region.id?.toString() || ''}
                                  id={region.id?.toString() || ''}
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={region.id?.toString() || ''}
                                className='cursor-pointer font-normal'
                              >
                                {region.name}
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
                  {initialValues
                    ? form.formState.isSubmitting
                      ? t('common.submiting')
                      : t('common.submit')
                    : form.formState.isSubmitting
                      ? t('common.creating')
                      : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {ConfirmDialogComponent} {/* Add this row */}
    </>
  )
}
