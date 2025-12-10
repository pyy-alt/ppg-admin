import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import RequestApi from '@/js/clients/base/OrderApi'
import OrganizationApi from '@/js/clients/base/OrganizationApi'
import OrganizationSearchRequest from '@/js/models/OrganizationSearchRequest'
import type OrganizationSearchResponse from '@/js/models/OrganizationSearchResponse'
import RepairOrder from '@/js/models/RepairOrder'
import RepairOrderCreateModel from '@/js/models/RepairOrderCreateRequest'
import FileAssetFileAssetTypeEnum from '@/js/models/enum/FileAssetFileAssetTypeEnum'
import { X, Upload, Camera, FileText, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { convertFilesToFileAssets } from '@/lib/utils'
import { useDialogWithConfirm } from '@/hooks/use-dialog-with-confirm'
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
  roNumber: z.string().min(1, 'Shop RO # is required'),
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
  orderFromDealershipId: z.string().min(1, 'Order From Dealership is required'),
})

type FormValues = z.infer<typeof formSchema>

export interface RepairOrderData {
  dealership: { id: number; name: string; number: string; [key: string]: any }
  roNumber: string
  customer: string
  orderFromDealershipId: string
  vin?: string
  make?: string
  year?: string
  model?: string
  structuralMeasurementFileAssets?: File[]
  preRepairPhotoFileAssets?: File[]
  [key: string]: any
}

interface RepairOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (
    data: FormValues & {
      structuralMeasurementFileAssets: File[]
      preRepairPhotoFileAssets: File[]
    }
  ) => void
  // 编辑模式时传入已有数据
  initialData?: RepairOrderData
}

// 获取当前年份
const currentYear = new Date().getFullYear()
// 计算列表长度
const listLength = currentYear + 1 - 1949
// 计算起始年份 (明年)
const startYear = currentYear + 1
export default function RepairOrderDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: RepairOrderDialogProps) {
  const isEdit = !!initialData

  const [structuralMeasurementFileAssets, setStructuralMeasurementFileAssets] =
    useState<File[]>([])
  const [preRepairPhotoFileAssets, setPreRepairPhotoFileAssets] = useState<
    File[]
  >([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roNumber: '',
      customer: '',
      vin: '',
      make: '',
      year: '',
      model: '',
      orderFromDealershipId: '',
    },
  })
  const [orderFromDealerships, setOrderFromDealerships] = useState<any[]>([])
  const user = useAuthStore((state) => state.auth.user)
  // ✅ 修复：实际执行关闭的函数（不检查未保存更改）
  const performClose: () => void = () => {
    onOpenChange(false)
    // 延迟重置，避免关闭动画时看到表单清空
    setTimeout(() => {
      form.reset()
      setStructuralMeasurementFileAssets([])
      setPreRepairPhotoFileAssets([])
    }, 200)
  }

  // 使用确认 hook
  const { handleCloseRequest, ConfirmDialogComponent } = useDialogWithConfirm({
    form,
    hasUnsavedFiles:
      structuralMeasurementFileAssets.length > 0 ||
      preRepairPhotoFileAssets.length > 0,
    onClose: performClose, // ✅ 修复：直接传入关闭函数，不调用 handleClose
    title: 'Discard Changes?',
    description:
      'You have unsaved changes. Are you sure you want to close? All your changes will be lost.',
  })

  const handleClose = () => {
    handleCloseRequest() // 这会检查是否有未保存更改，如果有则显示确认对话框
  }

  // 修改 Dialog 的 onOpenChange
  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // 尝试关闭，会检查是否有未保存更改
      handleCloseRequest()
    }
    return true
  }

  const getOrderFromDealership = async () => {
    try {
      const api = new OrganizationApi()
      const request = OrganizationSearchRequest.create({
        type: 'Dealership',
      })
      api.search(request, {
        status200: (response: OrganizationSearchResponse) => {
          console.log('Order from dealership:', response)
          setOrderFromDealerships(response.organizations || [])
        },
      })
    } catch (error) {
      console.error('Error getting order from dealership:', error)
      return []
    }
  }
  // 当 initialData 变化时，更新表单和文件
  useEffect(() => {
    getOrderFromDealership()
    console.log(initialData)
    if (initialData) {
      form.reset({
        roNumber: initialData.roNumber,
        customer: initialData.customer,
        vin: initialData.vin || '',
        make: initialData.make || '',
        year: initialData.year || '',
        model: initialData.model || '',
        orderFromDealershipId: initialData.dealership?.id?.toString() || '',
      })
      setStructuralMeasurementFileAssets(
        initialData.structuralMeasurementFileAssets || []
      )
      setPreRepairPhotoFileAssets(initialData.preRepairPhotoFileAssets || [])
    } else {
      form.reset({
        roNumber: '',
        customer: '',
        vin: '',
        make: '',
        year: '',
        model: '',
        orderFromDealershipId: undefined,
      })
      setStructuralMeasurementFileAssets([])
      setPreRepairPhotoFileAssets([])
    }
  }, [initialData, form])

  const onSubmit = async (data: FormValues) => {
    try {
      const api = new RequestApi()

      // 转换文件为 FileAsset 数组
      const structuralMeasurementFiles = await convertFilesToFileAssets(
        structuralMeasurementFileAssets,
        FileAssetFileAssetTypeEnum.STRUCTURAL_MEASUREMENT
      )

      const preRepairPhotoFiles = await convertFilesToFileAssets(
        preRepairPhotoFileAssets,
        FileAssetFileAssetTypeEnum.PRE_REPAIR_PHOTO
      )

      const dealership = orderFromDealerships.find(
        (dealership) => dealership.id === Number(data.orderFromDealershipId)
      )
      const repairOrderPayload = {
        ...(initialData ?? {}), // 包含 id 等原始字段（编辑模式）
        roNumber: data.roNumber,
        customer: data.customer,
        vin: data.vin,
        make: data.make,
        year: data.year,
        model: data.model,
        structuralMeasurementFileAssets:
          structuralMeasurementFiles.length > 0
            ? structuralMeasurementFiles
            : initialData?.structuralMeasurementFileAssets,
        preRepairPhotoFileAssets:
          preRepairPhotoFiles.length > 0
            ? preRepairPhotoFiles
            : initialData?.preRepairPhotoFileAssets,
        dealership,
        shop: user?.person?.shop || initialData?.shop || null,
      }

      await new Promise((resolve) => {
        if (isEdit) {
          const repairOrder = (RepairOrder as any).create(repairOrderPayload)
          api.repairOrderSave(repairOrder, {
            status200: () => {
              performClose()
              toast.success('Repair Order saved successfully')
              onSuccess?.({
                ...data,
                structuralMeasurementFileAssets,
                preRepairPhotoFileAssets,
              })
              resolve(true)
            },
            else: (_statusCode: number, responseText: string) => {
              toast.error(responseText)
              // 所有非 200（包括 404、403、409 等）最终会走到这里
              resolve(false) // 只负责结束 Promise，恢复按钮状态
            },
            error: (error) => {
              console.error('Error saving repair order:', error)
              toast.error('Error saving repair order:', error)
              resolve(false)
            },
          })
        } else {
          const model = RepairOrderCreateModel.create({
            repairOrder: repairOrderPayload,
            partsOrder: {
              parts: [],
            },
          })

          api.repairOrderCreate(model, {
            status200: (response) => {
              console.log('Repair Order created successfully:', response)
              onSuccess?.({
                ...data,
                structuralMeasurementFileAssets,
                preRepairPhotoFileAssets,
              })
              performClose()
              toast.success('Repair Order created successfully')
              resolve(true)
            },
            else: (_statusCode: number, responseText: string) => {
              // 所有非 200（包括 404、403、409 等）最终会走到这里
              toast.error(responseText)
              resolve(false) // 只负责结束 Promise，恢复按钮状态
            },
            error: (error) => {
              console.error('Error creating repair order:', error)
              toast.error('Error creating repair order:', error)
              resolve(false)
            },
          })
        }
      })
    } catch (error) {
      console.error('Error submitting repair order:', error)
      throw error // ✅ 重新抛出错误，让 React Hook Form 知道提交失败
    }
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

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
      accept: getAcceptConfig(),
      multiple: true,
      onDrop: (acceptedFiles) => {
        onFilesChange([...files, ...acceptedFiles])
      },
    })

    return (
      <div className='space-y-4'>
        {ConfirmDialogComponent}
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
          <Icon className='text-muted-foreground mx-auto h-12 w-12' />
          <p className='text-muted-foreground mt-2 text-sm'>
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
        </div>
        <Button
          variant='outline'
          className='bg-muted hover:bg-muted/80'
          size='sm'
          onClick={(e) => {
            e.preventDefault()
            // 可以在这里添加打开相机的逻辑
            // 暂时使用选择文件
            open()
          }}
        >
          <Camera className='mr-2 h-4 w-4' />
          Open camera
        </Button>

        {files.length > 0 && (
          <div className='space-y-2'>
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}-${file.size}`}
                className='flex items-center justify-between rounded-md px-3 py-2 transition-colors'
              >
                <div className='flex items-center gap-2 text-blue-500'>
                  {title.includes('Photo') ? (
                    <ImageIcon className='h-4 w-4' />
                  ) : (
                    <FileText className='h-4 w-4' />
                  )}
                  <span className='max-w-48 truncate text-sm text-blue-500 hover:underline'>
                    {file.name}
                  </span>
                  {/* <span className='text-muted-foreground text-xs'>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span> */}
                </div>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    onFilesChange(files.filter((_, idx) => idx !== i))
                  }}
                  className='text-destructive hover:bg-destructive/10 hover:text-destructive focus:ring-destructive rounded p-1 transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none'
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
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col sm:max-w-4xl'>
        <DialogHeader className='shrink-0'>
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
                  <FileText className='text-foreground h-5 w-5' />
                  <h3 className='text-lg font-medium'>
                    Repair Order Information
                  </h3>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='roNumber'
                    render={({ field }) => (
                      <FormItem className='flex flex-col space-y-1'>
                        <FormLabel>
                          Shop RO #{' '}
                          {isEdit && (
                            <span className='text-muted-foreground text-xs'>
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
                    name='orderFromDealershipId'
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
                            {orderFromDealerships.map((dealership) => (
                              <SelectItem
                                key={dealership.id}
                                value={dealership.id?.toString() || ''}
                              >
                                {dealership.name} | {dealership.number}{' '}
                                (Assigned Dealer)
                              </SelectItem>
                            ))}
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
                            <SelectItem value='Volkswagen' key='Volkswagen'>
                              Volkswagen
                            </SelectItem>
                            <SelectItem value='Audi' key='Audi'>
                              Audi
                            </SelectItem>
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
                            {/* 核心逻辑：生成年份列表 */}
                            {Array.from({ length: listLength }, (_, i) => {
                              const yearValue = startYear - i // 从明年开始递减
                              return (
                                <SelectItem
                                  key={yearValue}
                                  value={`${yearValue}`} // Select 的 value 最好是字符串
                                >
                                  {yearValue}
                                </SelectItem>
                              )
                            })}
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
                        <FormControl>
                          <Input placeholder='Enter Model' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Attachments */}
              <div className='space-y-8'>
                <div className='flex items-center gap-2'>
                  <Upload className='text-foreground h-5 w-5' />
                  <h3 className='text-lg font-medium'>Attachments</h3>
                </div>

                <div className='grid gap-8 md:grid-cols-2'>
                  <DropZone
                    title='Structural IMeasurements'
                    icon={FileText}
                    files={structuralMeasurementFileAssets}
                    onFilesChange={setStructuralMeasurementFileAssets}
                    accept='.pdf,.doc,.docx'
                  />

                  <DropZone
                    title='Pre-Repair Photos'
                    icon={ImageIcon}
                    files={preRepairPhotoFileAssets}
                    onFilesChange={setPreRepairPhotoFileAssets}
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
