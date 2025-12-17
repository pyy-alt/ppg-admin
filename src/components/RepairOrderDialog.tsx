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
      [key: string]: any
    }
  ) => void
  // Pass existing data in edit mode
  initialData?: RepairOrderData
}

// Get current year
const currentYear = new Date().getFullYear()
// Calculate list length
const listLength = currentYear + 1 - 1949
// Calculate starting year (Next year)
const startYear = currentYear + 1
export default function RepairOrderDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: RepairOrderDialogProps) {
  const isEdit = !!initialData

  const [structuralMeasurementFileAssets, setStructuralMeasurementFileAssets] =
    useState<any[]>([])
  const [preRepairPhotoFileAssets, setPreRepairPhotoFileAssets] = useState<
    any[]
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

  // ✅ Fix：Function that actually executes close（Do not check for unsaved changes）
  const performClose: () => void = () => {
    onOpenChange(false)
    // Delay reset，Avoid seeing form cleared when closing animation
    setTimeout(() => {
      form.reset()
      setStructuralMeasurementFileAssets([])
      setPreRepairPhotoFileAssets([])
    }, 200)
  }

  // Use confirmation hook
  const { handleCloseRequest, ConfirmDialogComponent } = useDialogWithConfirm({
    form,
    hasUnsavedFiles:
      structuralMeasurementFileAssets.length > 0 ||
      preRepairPhotoFileAssets.length > 0,
    onClose: performClose, // ✅ Fix：Directly pass in close function，Do not call handleClose
    title: 'Discard Changes?',
    description:
      'You have unsaved changes. Are you sure you want to close? All your changes will be lost.',
  })

  const handleClose = () => {
    handleCloseRequest() // This will check for unsaved changes，If there are, show confirmation dialog
  }

  // Modify Dialog of onOpenChange
  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Try to close，Will check for unsaved changes
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
          if (response.organizations && response.organizations.length > 0) {
            const dealerships = response.organizations
            for (let i = 0; i < dealerships.length; i++) {
              if (
                dealerships[i].id === user?.person?.shop?.sponsorDealership.id
              ) {
                dealerships[i].isShowText = true
                break
              }else {
                dealerships[i].isShowText = false
              }
            }
            setOrderFromDealerships(dealerships || [])
          }
        },
      })
    } catch (error) {
      console.error('Error getting order from dealership:', error)
      return []
    }
  }

  // When initialData changes，Update form and files
  useEffect(() => {
    getOrderFromDealership()
    if (initialData) {
      if (initialData.year && typeof initialData.year === 'number')
        initialData.year = String(initialData.year)
      form.reset({
        roNumber: initialData.roNumber,
        customer: initialData.customer,
        vin: initialData.vin || '',
        make: initialData.make || '',
        year: initialData.year || '',
        model: initialData.model || '',
        orderFromDealershipId: initialData.dealership?.id?.toString() || '',
      })
      const imgList = (initialData.preRepairPhotoFileAssets || []).map(
        (item: any) => {
          item.name = item.filename
          item.viewUrl = import.meta.env.VITE_API_URL + item.viewUrl
          return item
        }
      )
      setPreRepairPhotoFileAssets(imgList || [])
      const pdfList = (initialData.structuralMeasurementFileAssets || []).map(
        (item: any) => {
          item.name = item.filename
          item.viewUrl = import.meta.env.VITE_API_URL + item.viewUrl
          return item
        }
      )
      setStructuralMeasurementFileAssets(pdfList || [])
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

      // Convert file to FileAsset array
      try {
        // Only keep「newly uploaded」files base64 Upload
        const newPhotoFiles = preRepairPhotoFileAssets.filter(
          (f): f is File => f instanceof File
        )

        const newStructuralFiles = structuralMeasurementFileAssets.filter(
          (f): f is File => f instanceof File
        )
        const preRepairPhotoFileAssetsToUpload = await convertFilesToFileAssets(
          newPhotoFiles,
          FileAssetFileAssetTypeEnum.PRE_REPAIR_PHOTO
        )
        const structuralFileAssetsToUpload = await convertFilesToFileAssets(
          newStructuralFiles,
          FileAssetFileAssetTypeEnum.STRUCTURAL_MEASUREMENT
        )

        const dealership = orderFromDealerships.find(
          (dealership) => dealership.id === Number(data.orderFromDealershipId)
        )
        const repairOrderPayload = {
          ...(initialData ?? {}), // Include id and other original fields（Edit mode）
          roNumber: data.roNumber,
          customer: data.customer,
          vin: data.vin,
          make: data.make,
          year: data.year,
          model: data.model,
          structuralMeasurementFileAssets:
            structuralFileAssetsToUpload.length > 0
              ? structuralFileAssetsToUpload
              : structuralMeasurementFileAssets,
          preRepairPhotoFileAssets:
            preRepairPhotoFileAssetsToUpload.length > 0
              ? preRepairPhotoFileAssetsToUpload
              : preRepairPhotoFileAssets,
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
                // All non 200（including 404、403、409 etc.）Will eventually reach here
                resolve(false) // Only responsible for ending Promise，Restore button status
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
                  id: response.id,
                })
                performClose()
                toast.success('Repair Order created successfully')
                resolve(true)
              },
              else: (_statusCode: number, responseText: string) => {
                // All non 200（including 404、403、409 etc.）Will eventually reach here
                toast.error(responseText)
                resolve(false) // Only responsible for ending Promise，Restore button status
              },
              error: (error) => {
                console.error('Error creating repair order:', error)
                toast.error('Error creating repair order:', error)
                resolve(false)
              },
            })
          }
        })
      } catch (error) {}
    } catch (error) {
      console.error('Error submitting repair order:', error)
      throw error // ✅ Re-throw error，Let React Hook Form know submission failed
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
    files: any
    onFilesChange: (files: File[]) => void
    accept?: string
  }) => {
    // Convert accept string to react-dropzone required format
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
        console.log(
          acceptedFiles.length,
          acceptedFiles.map((f) => f.name)
        )
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
            // Logic to open camera can be added here
            // Temporarily use file selection
            open()
          }}
        >
          <Camera className='mr-2 h-4 w-4' />
          Open camera
        </Button>

        {files.length > 0 && (
          <div className='space-y-2'>
            {files.map((file: any, i: number) => (
              <div
                key={`${file.name}-${i}-${file.size}`}
                className='flex items-center justify-between rounded-md px-3 py-2 transition-colors'
              >
                <a
                  className='flex cursor-pointer items-center gap-2 text-blue-500'
                  href={file.viewUrl}
                  target='_blank'
                >
                  {title.includes('Photo') ? (
                    <ImageIcon className='h-4 w-4' />
                  ) : (
                    <FileText className='h-4 w-4' />
                  )}
                  <span className='max-w-48 truncate text-sm text-blue-500 underline'>
                    {file.name}
                  </span>
                  {/* <span className='text-muted-foreground text-xs'>
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span> */}
                </a>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    onFilesChange(
                      files.filter((_: any, idx: number) => idx !== i)
                    )
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
      <DialogContent className='flex max-h-[90vh] w-[90%] flex-col sm:max-w-7xl'>
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
                            <SelectTrigger className='min-w-[250px]'>
                              <SelectValue placeholder='Select' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {orderFromDealerships.map((dealership) => (
                              <SelectItem
                                key={dealership.id}
                                value={dealership.id?.toString() || ''}
                                className='py-2 pr-8 text-left whitespace-normal'
                              >
                                {dealership.name} | {dealership.dealershipNumber}{' '}
                                {dealership.isShowText
                                  ? '(Assigned Dealer)'
                                  : ''}
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
                            {/* Core logic：Generate year list */}
                            {Array.from({ length: listLength }, (_, i) => {
                              const yearValue = startYear - i // Decrement starting from next year
                              return (
                                <SelectItem
                                  key={yearValue}
                                  value={`${yearValue}`} // Select of value Preferably a string
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
