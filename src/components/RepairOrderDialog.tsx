import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import RequestApi from '@/js/clients/base/OrderApi';
import OrganizationApi from '@/js/clients/base/OrganizationApi';
import OrganizationSearchRequest from '@/js/models/OrganizationSearchRequest';
import type OrganizationSearchResponse from '@/js/models/OrganizationSearchResponse';
import RepairOrder from '@/js/models/RepairOrder';
import RepairOrderCreateModel from '@/js/models/RepairOrderCreateRequest';
import FileAssetFileAssetTypeEnum from '@/js/models/enum/FileAssetFileAssetTypeEnum';
import { X, Upload, Camera, FileText, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { convertFilesToFileAssets } from '@/lib/utils';
import { useDialogWithConfirm } from '@/hooks/use-dialog-with-confirm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next'; // 新增：引入 useTranslation

const formSchema = z.object({
  roNumber: z.string().min(1, 'repairOrder.form.roNumber.required'),
  customer: z.string().min(1, 'repairOrder.form.customer.required'),
  vin: z.string().min(17, 'repairOrder.form.vin.min').max(17, 'repairOrder.form.vin.max').optional().or(z.literal('')),
  make: z.string().optional(),
  year: z.string().optional(),
  model: z.string().optional(),
  orderFromDealershipId: z.string().min(1, 'repairOrder.form.dealership.required'),
});

type FormValues = z.infer<typeof formSchema>;

export interface RepairOrderData {
  dealership: { id: number; name: string; number: string; [key: string]: any };
  roNumber: string;
  customer: string;
  orderFromDealershipId: string;
  vin?: string;
  make?: string;
  year?: string;
  model?: string;
  structuralMeasurementFileAssets?: File[];
  preRepairPhotoFileAssets?: File[];
  [key: string]: any;
}

interface RepairOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (
    data: FormValues & {
      structuralMeasurementFileAssets: File[];
      preRepairPhotoFileAssets: File[];
      [key: string]: any;
    }
  ) => void;
  initialData?: RepairOrderData;
}

const currentYear = new Date().getFullYear();
const listLength = currentYear + 1 - 1949;
const startYear = currentYear + 1;

export default function RepairOrderDialog({ open, onOpenChange, onSuccess, initialData }: RepairOrderDialogProps) {
  const { t } = useTranslation();

  const isEdit = !!initialData;
  const [structuralMeasurementFileAssets, setStructuralMeasurementFileAssets] = useState<any[]>([]);
  const [preRepairPhotoFileAssets, setPreRepairPhotoFileAssets] = useState<any[]>([]);

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
  });

  const [orderFromDealerships, setOrderFromDealerships] = useState<any[]>([]);
  const user = useAuthStore((state) => state.auth.user);

  const performClose: () => void = () => {
    onOpenChange(false);
    setTimeout(() => {
      form.reset();
      setStructuralMeasurementFileAssets([]);
      setPreRepairPhotoFileAssets([]);
    }, 200);
  };

  const { handleCloseRequest, ConfirmDialogComponent } = useDialogWithConfirm({
    form,
    hasUnsavedFiles: structuralMeasurementFileAssets.length > 0 || preRepairPhotoFileAssets.length > 0,
    onClose: performClose,
    title: t('repairOrder.dialog.discardTitle'),
    description: t('repairOrder.dialog.discardDescription'),
  });

  const handleClose = () => {
    handleCloseRequest();
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCloseRequest();
    }
    return true;
  };

  const getOrderFromDealership = async () => {
    try {
      const api = new OrganizationApi();
      const request = OrganizationSearchRequest.create({
        type: 'Dealership',
      });
      api.search(request, {
        status200: (response: OrganizationSearchResponse) => {
          if (response.organizations && response.organizations.length > 0) {
            const dealerships = response.organizations;
            for (let i = 0; i < dealerships.length; i++) {
              if (dealerships[i].id === user?.person?.shop?.sponsorDealership.id) {
                dealerships[i].isShowText = true;
                break;
              } else {
                dealerships[i].isShowText = false;
              }
            }
            setOrderFromDealerships(dealerships || []);
          }
        },
      });
    } catch (error) {
      console.error('Error getting order from dealership:', error);
      return [];
    }
  };

  useEffect(() => {
    getOrderFromDealership();
    if (initialData) {
      if (initialData.year && typeof initialData.year === 'number') initialData.year = String(initialData.year);
      form.reset({
        roNumber: initialData.roNumber,
        customer: initialData.customer,
        vin: initialData.vin || '',
        make: initialData.make || '',
        year: initialData.year || '',
        model: initialData.model || '',
        orderFromDealershipId: initialData.dealership?.id?.toString() || '',
      });
      const imgList = (initialData.preRepairPhotoFileAssets || []).map((item: any) => {
        item.name = item.filename;
        item.viewUrl = import.meta.env.VITE_API_URL + item.viewUrl;
        return item;
      });
      setPreRepairPhotoFileAssets(imgList || []);
      const pdfList = (initialData.structuralMeasurementFileAssets || []).map((item: any) => {
        item.name = item.filename;
        item.viewUrl = import.meta.env.VITE_API_URL + item.viewUrl;
        return item;
      });
      setStructuralMeasurementFileAssets(pdfList || []);
    } else {
      form.reset({
        roNumber: '',
        customer: '',
        vin: '',
        make: '',
        year: '',
        model: '',
        orderFromDealershipId: undefined,
      });
      setStructuralMeasurementFileAssets([]);
      setPreRepairPhotoFileAssets([]);
    }
  }, [initialData, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const api = new RequestApi();
      try {
        const newPhotoFiles = preRepairPhotoFileAssets.filter((f): f is File => f instanceof File);
        const newStructuralFiles = structuralMeasurementFileAssets.filter((f): f is File => f instanceof File);
        const preRepairPhotoFileAssetsToUpload = await convertFilesToFileAssets(
          newPhotoFiles,
          FileAssetFileAssetTypeEnum.PRE_REPAIR_PHOTO
        );
        const structuralFileAssetsToUpload = await convertFilesToFileAssets(
          newStructuralFiles,
          FileAssetFileAssetTypeEnum.STRUCTURAL_MEASUREMENT
        );
        const dealership = orderFromDealerships.find(
          (dealership) => dealership.id === Number(data.orderFromDealershipId)
        );
        const repairOrderPayload = {
          ...(initialData ?? {}),
          roNumber: data.roNumber,
          customer: data.customer,
          vin: data.vin,
          make: data.make,
          year: data.year,
          model: data.model,
          structuralMeasurementFileAssets:
            structuralFileAssetsToUpload.length > 0 ? structuralFileAssetsToUpload : structuralMeasurementFileAssets,
          preRepairPhotoFileAssets:
            preRepairPhotoFileAssetsToUpload.length > 0 ? preRepairPhotoFileAssetsToUpload : preRepairPhotoFileAssets,
          dealership,
          shop: user?.person?.shop || initialData?.shop || null,
        };
        await new Promise((resolve) => {
          if (isEdit) {
            const repairOrder = (RepairOrder as any).create(repairOrderPayload);
            api.repairOrderSave(repairOrder, {
              status200: () => {
                performClose();
                toast.success(t('repairOrder.toast.updateSuccess'));
                onSuccess?.({
                  ...data,
                  structuralMeasurementFileAssets,
                  preRepairPhotoFileAssets,
                });
                resolve(true);
              },
              else: (_statusCode: number, responseText: string) => {
                toast.error(responseText);
                resolve(false);
              },
              error: (error) => {
                console.error('Error saving repair order:', error);
                toast.error(t('repairOrder.toast.updateError'));
                resolve(false);
              },
            });
          } else {
            const model = RepairOrderCreateModel.create({
              repairOrder: repairOrderPayload,
              partsOrder: {
                parts: [],
              },
            });
            api.repairOrderCreate(model, {
              status200: (response) => {
                console.log('Repair Order created successfully:', response);
                onSuccess?.({
                  ...data,
                  structuralMeasurementFileAssets,
                  preRepairPhotoFileAssets,
                  id: response.id,
                });
                performClose();
                toast.success(t('repairOrder.toast.createSuccess'));
                resolve(true);
              },
              else: (_statusCode: number, responseText: string) => {
                toast.error(responseText);
                resolve(false);
              },
              error: (error) => {
                console.error('Error creating repair order:', error);
                toast.error(t('repairOrder.toast.createError'));
                resolve(false);
              },
            });
          }
        });
      } catch (error) {}
    } catch (error) {
      console.error('Error submitting repair order:', error);
      throw error;
    }
  };

  const DropZone = ({
    title,
    icon: Icon,
    files,
    onFilesChange,
    accept,
  }: {
    title: string;
    icon: React.ElementType;
    files: any;
    onFilesChange: (files: File[]) => void;
    accept?: string;
  }) => {
    const getAcceptConfig = (): { [key: string]: string[] } | undefined => {
      if (!accept) return undefined;
      if (accept.includes('image')) {
        return { 'image/*': [] };
      }
      if (accept.includes('.pdf')) {
        return {
          'application/pdf': ['.pdf'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        };
      }
      return undefined;
    };

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
      accept: getAcceptConfig(),
      multiple: true,
      onDrop: (acceptedFiles) => {
        console.log(
          acceptedFiles.length,
          acceptedFiles.map((f) => f.name)
        );
        onFilesChange([...files, ...acceptedFiles]);
      },
    });

    return (
      <div className="space-y-4">
        {ConfirmDialogComponent}
        <Label className="text-base font-medium">{title}</Label>
        <div
          {...getRootProps()}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition-all duration-200 active:scale-[0.98] ${
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-border bg-muted/50 hover:border-primary hover:bg-muted'
          }`}
        >
          <input {...getInputProps()} />
          <Icon className="w-12 h-12 mx-auto text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isDragActive ? (
              <>{t('repairOrder.dropzone.dropHere', { type: title.toLowerCase() })}</>
            ) : (
              <>
                {t('repairOrder.dropzone.instruction', { type: title.toLowerCase() })}{' '}
                <span className="text-primary hover:underline">{t('repairOrder.dropzone.clickToBrowse')}</span>
              </>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-muted hover:bg-muted/80"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            open();
          }}
        >
          <Camera className="w-4 h-4 mr-2" />
          {t('repairOrder.dropzone.openCamera')}
        </Button>
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file: any, i: number) => (
              <div
                key={`${file.name}-${i}-${file.size}`}
                className="flex items-center justify-between px-3 py-2 transition-colors rounded-md"
              >
                <a className="flex items-center gap-2 text-blue-500 cursor-pointer" href={file.viewUrl} target="_blank">
                  {title.includes('Photo') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  <span className="text-sm text-blue-500 underline truncate max-w-48">{file.name}</span>
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilesChange(files.filter((_: any, idx: number) => idx !== i));
                  }}
                  className="p-1 transition-colors rounded text-destructive hover:bg-destructive/10 hover:text-destructive focus:ring-destructive focus:ring-2 focus:ring-offset-1 focus:outline-none"
                  aria-label={t('repairOrder.dropzone.removeFile', { name: file.name })}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[90%] flex-col sm:max-w-7xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl font-semibold">
            {isEdit ? t('repairOrder.dialog.editTitle') : t('repairOrder.dialog.newTitle')}
          </DialogTitle>
          <Separator />
          <button
            onClick={handleClose}
            className="absolute transition-opacity rounded-sm ring-offset-background focus:ring-ring top-4 right-4 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">{t('common.close')}</span>
          </button>
        </DialogHeader>
        <div className="flex-1 px-6 py-4 -mx-6 overflow-y-auto scroll-smooth">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="pb-4 space-y-8" id="repair-order-form">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-foreground" />
                  <h3 className="text-lg font-medium">{t('repairOrder.section.info')}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="roNumber"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1">
                        <FormLabel>
                          {t('repairOrder.form.roNumber.label')}{' '}
                          {isEdit && (
                            <span className="text-xs text-muted-foreground">({t('repairOrder.form.readOnly')})</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('repairOrder.form.roNumber.placeholder')}
                            {...field}
                            disabled={isEdit}
                            className={isEdit ? 'bg-muted' : ''}
                          />
                        </FormControl>
                        <div className="flex min-h-[20px] items-start">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customer"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1">
                        <FormLabel>{t('repairOrder.form.customer.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('repairOrder.form.customer.placeholder')} {...field} />
                        </FormControl>
                        <div className="flex min-h-[20px] items-start">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="orderFromDealershipId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1">
                        <FormLabel>{t('repairOrder.form.dealership.label')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="min-w-[250px]">
                              <SelectValue placeholder={t('common.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {orderFromDealerships.map((dealership) => (
                              <SelectItem
                                key={dealership.id}
                                value={dealership.id?.toString() || ''}
                                className="py-2 pr-8 text-left whitespace-normal"
                              >
                                {dealership.name} | {dealership.dealershipNumber}{' '}
                                {dealership.isShowText ? `(${t('repairOrder.form.assignedDealer')})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex min-h-[20px] items-start">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="vin"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1">
                        <FormLabel>{t('repairOrder.form.vin.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('repairOrder.form.vin.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1">
                        <FormLabel>{t('repairOrder.form.make.label')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[250px]">
                              <SelectValue placeholder={t('common.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Volkswagen" key="Volkswagen">
                              Volkswagen
                            </SelectItem>
                            <SelectItem value="Audi" key="Audi">
                              Audi
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1">
                        <FormLabel>{t('repairOrder.form.year.label')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-[250px]">
                              <SelectValue placeholder={t('common.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: listLength }, (_, i) => {
                              const yearValue = startYear - i;
                              return (
                                <SelectItem key={yearValue} value={`${yearValue}`}>
                                  {yearValue}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('repairOrder.form.model.label')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('repairOrder.form.model.placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-foreground" />
                  <h3 className="text-lg font-medium">{t('repairOrder.section.attachments')}</h3>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <DropZone
                    title={t('repairOrder.attachments.structural')}
                    icon={FileText}
                    files={structuralMeasurementFileAssets}
                    onFilesChange={setStructuralMeasurementFileAssets}
                    accept=".pdf,.doc,.docx"
                  />
                  <DropZone
                    title={t('repairOrder.attachments.preRepairPhotos')}
                    icon={ImageIcon}
                    files={preRepairPhotoFileAssets}
                    onFilesChange={setPreRepairPhotoFileAssets}
                    accept="image/*"
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter className="flex-shrink-0 gap-3 pt-4 mt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button form="repair-order-form" type="submit" variant="default" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? isEdit
                ? t('repairOrder.button.updating')
                : t('repairOrder.button.saving')
              : isEdit
                ? t('repairOrder.button.update')
                : t('repairOrder.button.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
