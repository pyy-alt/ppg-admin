import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  X,
  Package,
  Paperclip,
  Upload,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const formSchema = z.object({
  parts: z.array(
    z.object({ number: z.string().min(1, 'Part number is required') })
  ),
  // 虚拟字段，用于显示附件错误
  _estimateFile: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// 定义初始数据类型
export type PartsOrderData = {
  parts?: string[]
  shopRo?: string
  orderFromDealership?: string
  customer?: string
  vin?: string
  make?: string
  year?: string
  model?: string
  salesOrderNumber?: string
  partsOrderNumber?: number // 0 = 原始订单, 1+ = 补充订单
  isAlternateDealer?: boolean // 是否来自备用经销商
  alternateDealerName?: string // 备用经销商名称
  alternateDealerId?: string // 备用经销商ID
  status?: string // 订单状态，用于判断是否已批准/拒绝
  estimateFiles?: File[] | null
}

type PartsOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'create' | 'edit'
  initialData?: PartsOrderData | null
  defaultDealership?: string // 默认经销商名称
}

export function PartsOrderDialog({
  open,
  onOpenChange,
  initialData = null,
  mode = 'create',
  defaultDealership,
}: PartsOrderDialogProps) {
  const [estimateFiles, setEstimateFiles] = useState<File[]>([])
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parts: [{ number: '' }, { number: '' }, { number: '' }, { number: '' }],
    },
  })
  // 使用确认 hook
  const { handleCloseRequest, ConfirmDialogComponent } =
    useDialogWithConfirm({
      form,
      hasUnsavedFiles: estimateFiles.length > 0, // 检查是否有文件
      onClose: () => {
        form.reset()
        setEstimateFiles([])
        onOpenChange(false)
      },
      title: 'Discard Changes?',
      description:
        'You have unsaved changes. Are you sure you want to close? All your changes will be lost.',
    })

  // 修改 handleClose 使用新的逻辑
  const handleClose = () => {
    handleCloseRequest()
  }
  // 修改 Dialog 的 onOpenChange
  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // 尝试关闭
      handleCloseRequest()
      return false // 阻止默认关闭行为
    }
    return true
  }

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'parts',
  })

  // 判断是否是补充订单
  const isSupplement =
    initialData?.partsOrderNumber !== undefined &&
    initialData.partsOrderNumber > 0

  // 判断是否来自备用经销商
  const isFromAlternateDealer = initialData?.isAlternateDealer === true

  // 判断是否在 CSR 批准/拒绝之前（可以编辑）
  const canEdit =
    !initialData?.status ||
    ['CsrReview', 'DealershipProcessing'].includes(initialData.status)

  // 根据模式生成标题
  const getDialogTitle = () => {
    if (isSupplement) {
      // 补充订单
      const supplementNum = initialData?.partsOrderNumber || 1
      if (mode === 'edit') {
        return `Edit Supplement #${supplementNum}`
      } else {
        return `New Supplement #${supplementNum}`
      }
    } else {
      // 原始零件订单
      if (mode === 'edit') {
        return 'Edit Parts Order'
      } else {
        return 'New Parts Order'
      }
    }
  }

  // 获取第二部分标题
  const getPartsOrderSectionTitle = () => {
    if (isSupplement) {
      const supplementNum = initialData?.partsOrderNumber || 1
      return `Supplement #${supplementNum} Information`
    } else {
      return 'Parts Order Information'
    }
  }

  // 获取按钮文本
  const getSubmitButtonText = () => {
    if (mode === 'edit' && canEdit) {
      return 'Update'
    }
    return 'Save'
  }

  // 当 initialData 变化时，重置表单
  useEffect(() => {
    if (open && initialData) {
      // 编辑模式：使用初始数据
      const parts =
        initialData.parts && initialData.parts.length > 0
          ? initialData.parts.map((part) => ({ number: part }))
          : [{ number: '' }]

      form.reset({
        parts: parts.length > 0 ? parts : [{ number: '' }],
      })

      // 使用 setTimeout 将 setState 移到下一个事件循环
      setTimeout(() => {
        setEstimateFiles(initialData.estimateFiles || [])
      }, 0)
    } else if (open && mode === 'create') {
      // 新增模式：重置为默认值
      form.reset({
        parts: [{ number: '' }, { number: '' }, { number: '' }, { number: '' }],
      })
      setEstimateFiles([])
    }
  }, [open, initialData, mode, form])

  const onSubmit = (data: FormValues) => {
    // 验证附件是否已上传（新增模式或编辑模式但还没有文件时）
    if (
      estimateFiles &&
      estimateFiles.length === 0 &&
      (mode === 'create' || !initialData?.estimateFiles?.length)
    ) {
      form.setError('_estimateFile', {
        type: 'manual',
        message: 'Estimate PDF is required',
      })
      // 滚动到错误位置
      const errorElement = document.querySelector('[data-estimate-error]')
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    console.log('Submitted:', {
      mode,
      data,
      estimateFiles,
      isSupplement,
      partsOrderNumber: initialData?.partsOrderNumber,
    })
    onOpenChange(false)
  }
  // 修改 useDropzone 以支持多个文件
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    // 移除 maxFiles 限制，或设置为更大的数字
    // maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setEstimateFiles((prevFiles) => [...prevFiles, ...acceptedFiles])
    },
  })

  // 删除单个文件
  const removeFile = (index: number) => {
    setEstimateFiles((prev) => prev.filter((_, i) => i !== index))
  }
  // 获取经销商显示文本
  const getDealershipDisplay = () => {
    if (isFromAlternateDealer && initialData?.alternateDealerName) {
      return (
        <div className='flex items-center gap-2'>
          <span className='font-medium'>
            {initialData.alternateDealerName}
            {initialData.alternateDealerId &&
              ` (${initialData.alternateDealerId})`}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className='h-4 w-4 text-yellow-500' />
              </TooltipTrigger>
              <TooltipContent>
                <p>Ordered from an alternate dealer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }
    return (
      <p className='font-medium'>
        {initialData?.orderFromDealership || defaultDealership || '---'}
      </p>
    )
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => handleDialogOpenChange(newOpen)}
      >
        <DialogContent className='flex max-h-[90vh] flex-col p-0 sm:max-w-4xl'>
          {/* 固定头部 - 统一风格 */}
          <DialogHeader className='flex-shrink-0'>
            <DialogTitle className='px-6 py-4 text-2xl font-semibold'>
              {getDialogTitle()}
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

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex min-h-0 flex-1 flex-col'
            >
              {/* 可滚动内容区 */}
              <div className='flex-1 overflow-y-auto px-6 py-6'>
                {/* 1. Repair Order Information（只读） */}
                <section className='mb-8'>
                  <div className='mb-5 flex items-center gap-3'>
                    <Package className='text-foreground h-5 w-5' />
                    <h3 className='text-foreground text-lg font-semibold'>
                      Repair Order Information
                    </h3>
                  </div>
                  <div className='bg-muted/50 grid grid-cols-1 gap-4 rounded-lg p-5 md:grid-cols-3'>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Shop RO #
                      </Label>
                      <p className='font-medium'>
                        {initialData?.shopRo || '---'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Order From Dealership
                      </Label>
                      {getDealershipDisplay()}
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Customer
                      </Label>
                      <p className='font-medium'>
                        {initialData?.customer || '---'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        VIN
                      </Label>
                      <p className='font-medium'>{initialData?.vin || '---'}</p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Year/Make/Model
                      </Label>
                      <p className='font-medium'>
                        {initialData?.year || '---'}{' '}
                        {initialData?.make || '---'}{' '}
                        {initialData?.model || '---'}
                      </p>
                    </div>
                  </div>
                </section>

                <Separator className='my-8' />

                {/* 2. Parts Order Information / Supplement Information（只读） */}
                <section className='mb-8'>
                  <div className='mb-5 flex items-center gap-3'>
                    <Package className='text-foreground h-5 w-5' />
                    <h3 className='text-foreground text-lg font-semibold'>
                      {getPartsOrderSectionTitle()}
                    </h3>
                  </div>
                  <div className='grid grid-cols-3 gap-8 text-sm'>
                    <div>
                      <Label className='text-muted-foreground'>
                        Order Submitted
                      </Label>
                      <p className='mt-1 font-medium'>---</p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground'>
                        Order Approved
                      </Label>
                      <p className='mt-1 font-medium'>---</p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground'>
                        Order Shipped
                      </Label>
                      <p className='mt-1 font-medium'>---</p>
                    </div>
                    {/* 编辑模式下显示 Sales Order Number */}
                    {mode === 'edit' && initialData?.salesOrderNumber && (
                      <div>
                        <Label className='text-muted-foreground'>
                          Sales Order #
                        </Label>
                        <p className='mt-1 font-medium'>
                          {initialData.salesOrderNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <Separator className='my-8' />

                {/* 3. Requested Part Numbers + Attachments 并排 */}
                <div className='grid grid-cols-1 gap-12 md:grid-cols-2'>
                  {/* 左侧：零件输入 */}
                  <section>
                    <div className='mb-5 flex items-center gap-3'>
                      <Package className='text-foreground h-5 w-5' />
                      <h3 className='text-foreground text-lg font-semibold'>
                        Requested Part Numbers
                      </h3>
                    </div>
                    <div className='space-y-4'>
                      {fields.map((field, i) => (
                        <div key={field.id} className='flex items-center gap-3'>
                          <span className='text-muted-foreground w-12 text-sm'>
                            Part {i + 1}
                          </span>
                          <FormField
                            control={form.control}
                            name={`parts.${i}.number`}
                            render={({ field }) => (
                              <FormItem className='flex-1'>
                                <FormControl>
                                  <Input
                                    placeholder='Enter part number'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {fields.length > 1 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => remove(i)}
                            >
                              <Trash2 className='text-destructive h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => append({ number: '' })}
                      >
                        <Plus className='mr-2 h-4 w-4' /> Add a Part
                      </Button>
                    </div>
                  </section>

                  {/* 右侧：Estimate PDF 上传 */}
                  <section>
                    <div className='mb-5 flex items-center gap-3'>
                      <Paperclip className='text-foreground h-5 w-5' />
                      <h3 className='text-foreground text-lg font-semibold'>
                        Attachments
                      </h3>
                    </div>
                    <div className='space-y-3'>
                      <Label className='text-foreground text-sm font-medium'>
                        Estimate
                        {/* 新增模式或编辑模式但还没有文件时才必填 */}
                        {(mode === 'create' ||
                          !initialData?.estimateFiles?.length) && (
                          <span className='text-destructive'>*</span>
                        )}
                      </Label>
                      <div
                        {...getRootProps()}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-all ${isDragActive ? 'border-primary bg-muted' : 'border-border hover:border-primary'}`}
                      >
                        <input {...getInputProps()} />
                        <Upload className='text-muted-foreground mb-3 h-12 w-12' />

                        <p className='text-muted-foreground text-sm'>
                          Drop your PDF files here or{' '}
                          <span className='text-primary hover:underline'>
                            click to browse
                          </span>
                        </p>
                      </div>
                      <div>
                        {estimateFiles && estimateFiles.length > 0 && (
                          <div className='w-full space-y-2'>
                            {estimateFiles.map((file, index) => (
                              <div
                                key={`${file.name}-${index}`}
                                className='flex items-center justify-between rounded-md p-1.5'
                              >
                                <div
                                  className='flex-1 truncate'
                                  title={file.name}
                                >
                                  <p className='cursor-pointer truncate text-sm font-medium text-blue-500 hover:underline'>
                                    {file.name}
                                  </p>
                                  {/* <p className='text-muted-foreground text-xs'>
                                  {(file.size / 1024).toFixed(2)} KB
                                </p> */}
                                </div>
                                <button
                                  type='button'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeFile(index)
                                  }}
                                  className='text-destructive ml-2 text-xs hover:underline'
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* 显示错误信息 */}
                      {form.formState.errors._estimateFile && (
                        <p className='text-destructive text-sm'>
                          {form.formState.errors._estimateFile.message}
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* 固定底部 - 统一风格 */}
              <DialogFooter className='bg-muted/50 w-full flex-shrink-0 border-t px-6 py-4 backdrop-blur'>
                <div className='flex w-full justify-end gap-3'>
                  <Button type='button' variant='outline' onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type='submit' variant='default'>
                    {getSubmitButtonText()}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {ConfirmDialogComponent}
    </>
  )
}
