'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
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
    .enum(['Admin', 'CSR', 'Field Staff'])
    .refine((val) => val !== undefined, {
      message: 'Please select a role',
    }),
  regions: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddNetworkUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: FormValues) => void
}

export default function AddNetworkUserDialog({
  open,
  onOpenChange,
  onSuccess,
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

  const selectedRole = form.watch('role')
  const showRegionSelector = selectedRole === 'CSR'
  const onSubmit = (data: FormValues) => {
    console.log('Creating user:', data)
    onSuccess?.(data)
    onOpenChange(false)
    form.reset() // 自动重置表单
  }

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      form.reset() // 关闭时自动重置
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            Add Network User
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
                    <FormLabel>First Name</FormLabel>
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
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='Admin'>Admin</SelectItem>
                      <SelectItem value='CSR'>CSR</SelectItem>
                      <SelectItem value='Field Staff'>Field Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showRegionSelector && (
              <div className='space-y-3'>
                <Label>CSR Region(s)</Label>
                <div className='space-y-3 rounded-md border bg-muted p-4'>
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
                                  const value = checked
                                    ? [...(field.value || []), region]
                                    : field.value?.filter(
                                        (r) => r !== region
                                      ) || []
                                  field.onChange(value)
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

            <DialogFooter className='mt-4 gap-3 border-t pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                variant='default'
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
