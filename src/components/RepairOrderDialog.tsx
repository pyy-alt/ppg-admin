import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Upload, Camera, FileText, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
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
  shopRO: z.string().min(1, 'Shop RO # is required'),
  customer: z.string().min(1, 'Customer name is required'),
  vin: z
    .string()
    .min(17, 'VIN must be 17 characters')
    .max(17)
    .optional()
    .or(z.literal('')),
  make: z.string().optional(),
  year: z.string().optional(),
  model: z.string().optional(),
  orderFromDealership: z.string().min(1, 'Order From Dealership is required'),
})

type FormValues = z.infer<typeof formSchema>

export interface RepairOrderData {
  shopRO: string
  customer: string
  orderFromDealership: string
  vin?: string
  make?: string
  year?: string
  model?: string
  measurementsFiles?: File[]
  photoFiles?: File[]
}

interface RepairOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (
    data: FormValues & { measurementsFiles: File[]; photoFiles: File[] }
  ) => void
  // 编辑模式时传入已有数据
  initialData?: RepairOrderData
}

export default function RepairOrderDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: RepairOrderDialogProps) {
  const isEdit = !!initialData

  const [measurementsFiles, setMeasurementsFiles] = useState<File[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shopRO: '',
      customer: '',
      vin: '',
      make: '',
      year: '',
      model: '',
      orderFromDealership: '',
    },
  })

  // 当 initialData 变化时，更新表单和文件
  useEffect(() => {
    if (initialData) {
      form.reset({
        shopRO: initialData.shopRO,
        customer: initialData.customer,
        vin: initialData.vin || '',
        make: initialData.make || '',
        year: initialData.year || '',
        model: initialData.model || '',
        orderFromDealership: initialData.orderFromDealership || '',
      })
      setMeasurementsFiles(initialData.measurementsFiles || [])
      setPhotoFiles(initialData.photoFiles || [])
    } else {
      form.reset({
        shopRO: '',
        customer: '',
        vin: '',
        make: '',
        year: '',
        model: '',
      })
      setMeasurementsFiles([])
      setPhotoFiles([])
    }
  }, [initialData, form])

  const onSubmit = (data: FormValues) => {
    console.log(isEdit ? 'Updated Repair Order:' : 'New Repair Order:', data, {
      measurementsFiles,
      photoFiles,
    })
    onSuccess?.({ ...data, measurementsFiles, photoFiles })
    handleClose()
  }

  const handleClose = () => {
    onOpenChange(false)
    // 延迟重置，避免关闭动画时看到表单清空
    setTimeout(() => {
      form.reset()
      setMeasurementsFiles([])
      setPhotoFiles([])
    }, 200)
  }

  const DropZone = ({
    title,
    icon: Icon,
    files,
    onFilesChange,
    accept,
  }: {
    title: string
    icon: React.ElementType
    files: File[]
    onFilesChange: (files: File[]) => void
    accept?: string
  }) => {
    // 转换 accept 字符串为 react-dropzone 需要的格式
    const getAcceptConfig = (): { [key: string]: string[] } | undefined => {
      if (!accept) return undefined

      if (accept.includes('image')) {
        return { 'image/*': [] }
      }

      if (accept.includes('.pdf')) {
        return {
          'application/pdf': ['.pdf'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            ['.docx'],
        }
      }

      return undefined
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: getAcceptConfig(),
      multiple: true,
      onDrop: (acceptedFiles) => {
        onFilesChange([...files, ...acceptedFiles])
      },
    })

    return (
      <div className='space-y-4'>
        <Label className='text-base font-medium'>{title}</Label>

        <div
          {...getRootProps()}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-all duration-200 active:scale-[0.98] ${
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-border bg-muted/50 hover:border-primary hover:bg-muted'
          }`}
        >
          <input {...getInputProps()} />
          <Icon className='mx-auto h-12 w-12 text-muted-foreground' />
          <p className='mt-2 text-sm text-muted-foreground'>
            {isDragActive ? (
              <>Drop your {title.toLowerCase()} here...</>
            ) : (
              <>
                Drop your {title.toLowerCase()} here or{' '}
                <span className='text-primary hover:underline'>
                  click to browse
                </span>
              </>
            )}
          </p>
          <Button
            variant='ghost'
            size='sm'
            className='mt-4'
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              // 可以在这里添加打开相机的逻辑
            }}
          >
            <Camera className='mr-2 h-4 w-4' />
            Open camera
          </Button>
        </div>

        {files.length > 0 && (
          <div className='space-y-2'>
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}-${file.size}`}
                className='flex items-center justify-between rounded-md bg-muted px-3 py-2 transition-colors hover:bg-muted/80'
              >
                <div className='flex items-center gap-2'>
                  {title.includes('Photo') ? (
                    <ImageIcon className='h-4 w-4' />
                  ) : (
                    <FileText className='h-4 w-4' />
                  )}
                  <span className='max-w-48 truncate text-sm text-primary'>
                    {file.name}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    onFilesChange(files.filter((_, idx) => idx !== i))
                  }}
                  className='rounded p-1 text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive focus:ring-2 focus:ring-destructive focus:ring-offset-1 focus:outline-none'
                  aria-label={`Remove ${file.name}`}
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[90vh] flex-col sm:max-w-4xl'>
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle className='text-2xl font-semibold'>
            {isEdit ? 'Edit Repair Order' : 'New Repair Order'}
          </DialogTitle>
          <Separator />
          <button
            onClick={handleClose}
            className='ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </button>
        </DialogHeader>

        <div className='-mx-6 flex-1 overflow-y-auto scroll-smooth px-6 py-4'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-8 pb-4'
              id='repair-order-form'
            >
              {/* Repair Order Information */}
              <div className='space-y-6'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-5 w-5 text-foreground' />
                  <h3 className='text-lg font-medium'>
                    Repair Order Information
                  </h3>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='shopRO'
                    render={({ field }) => (
                      <FormItem className='flex flex-col space-y-1'>
                        <FormLabel>
                          Shop RO #{' '}
                          {isEdit && (
                            <span className='text-xs text-muted-foreground'>
                              (Read-only)
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter Shop RO #'
                            {...field}
                            disabled={isEdit}
                            className={isEdit ? 'bg-muted' : ''}
                          />
                        </FormControl>
                        <div className='flex min-h-[20px] items-start'>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='customer'
                    render={({ field }) => (
                      <FormItem className='flex flex-col space-y-1'>
                        <FormLabel>Customer</FormLabel>
                        <FormControl>
                          <Input placeholder='Customer name' {...field} />
                        </FormControl>
                        <div className='flex min-h-[20px] items-start'>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='orderFromDealership'
                    render={({ field }) => (
                      <FormItem className='flex flex-col space-y-1'>
                        <FormLabel>Order From Dealership</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='w-[250px]'>
                              <SelectValue placeholder='Select' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='Pacific VW Motors'>
                              Pacific VW Motors | 88321 (Assigned Dealer)
                            </SelectItem>
                            <SelectItem value='Pacific VW Motors'>
                              Pacific VW Motors | 88321 (Assigned Dealer)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className='flex min-h-[20px] items-start'>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='vin'
                    render={({ field }) => (
                      <FormItem className='flex flex-col space-y-1'>
                        <FormLabel>VIN</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter VIN' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='make'
                    render={({ field }) => (
                      <FormItem className='flex flex-col space-y-1'>
                        <FormLabel>Make</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='w-[250px]'>
                              <SelectValue placeholder='Select' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='audi'>Audi</SelectItem>
                            <SelectItem value='vw'>Volkswagen</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='year'
                    render={({ field }) => (
                      <FormItem className='flex flex-col space-y-1'>
                        <FormLabel>Year</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='w-[250px]'>
                              <SelectValue placeholder='Select' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 25 }, (_, i) => (
                              <SelectItem key={i} value={`${2025 - i}`}>
                                {2025 - i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='model'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='q5'>Q5</SelectItem>
                            <SelectItem value='a4'>A4</SelectItem>
                            <SelectItem value='tt'>TT</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Attachments */}
              <div className='space-y-8'>
                <div className='flex items-center gap-2'>
                  <Upload className='h-5 w-5 text-foreground' />
                  <h3 className='text-lg font-medium'>Attachments</h3>
                </div>

                <div className='grid gap-8 md:grid-cols-2'>
                  <DropZone
                    title='Structural Measurements'
                    icon={FileText}
                    files={measurementsFiles}
                    onFilesChange={setMeasurementsFiles}
                    accept='.pdf,.doc,.docx'
                  />

                  <DropZone
                    title='Pre-Repair Photos'
                    icon={ImageIcon}
                    files={photoFiles}
                    onFilesChange={setPhotoFiles}
                    accept='image/*'
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter className='mt-4 flex-shrink-0 gap-3 border-t pt-4'>
          <Button type='button' variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            form='repair-order-form'
            type='submit'
            variant='default'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? isEdit
                ? 'Updating...'
                : 'Saving...'
              : isEdit
                ? 'Update'
                : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
