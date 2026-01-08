// src/components/PartsOrderDialog.tsx
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import RequestApi from '@/js/clients/base/OrderApi';
import PartsOrder from '@/js/models/PartsOrder';
import type RepairOrder from '@/js/models/RepairOrder';
import FileAssetFileAssetTypeEnum from '@/js/models/enum/FileAssetFileAssetTypeEnum';
import { X, Trash2, Loader2, NotebookPen, Package, Paperclip, Upload, Plus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { convertFilesToFileAssets, formatDateOnly } from '@/lib/utils';
import { useDialogWithConfirm } from '@/hooks/use-dialog-with-confirm';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next'; // 新增导入
import { useLocation } from '@tanstack/react-router';

const formSchema = z.object({
  parts: z.array(z.object({ number: z.string().min(1, 'partsOrder.form.partNumber.required') })),
  // Virtual field，Used to display attachment errors
  _estimateFile: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Define initial data type
export type PartsOrderData = {
  id?: number;
  parts?: string[];
  shopRo?: string;
  orderFromDealership?: string;
  customer?: string;
  vin?: string;
  make?: string;
  year?: string;
  model?: string;
  salesOrderNumber?: string;
  partsOrderNumber?: number; // 0 = Original order, 1+ = Supplemental order
  isAlternateDealer?: boolean; // Is it from an alternate dealer
  alternateDealerName?: string; // Alternate dealer name
  alternateDealerId?: string; // Alternate dealerID
  status?: string; // Order status，Used to determine if approved/Reject
  estimateFileAssets?: File[] | null;
  [key: string]: any;
};

type PartsOrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
  initialData?: PartsOrderData | undefined;
  isSupplementMode?: boolean;
  supplementNumber?: number;
  defaultDealership?: string; // Default dealer name
  initRepaitOrderData?: RepairOrder;
  onSuccess?: () => void;
  isReject?: boolean;
  onHandleResubmit?: (comment: string) => void;
};

export function PartsOrderDialog({
  open,
  onOpenChange,
  isReject = false,
  initialData,
  isSupplementMode,
  supplementNumber,
  mode = 'create',
  initRepaitOrderData,
  onSuccess,
  onHandleResubmit,
}: PartsOrderDialogProps) {
  const location = useLocation(); // 获取当前路由信息
  const currentPathname = location.pathname;  
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.auth.user);
  const userType = user?.person?.type;
  const isCsr = userType === 'Csr';
  
  const [estimateFiles, setEstimateFiles] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string>('');
  const [partsError, setPartsError] = useState<string>('');
  const [salesOrderNumber, setSalesOrderNumber] = useState<string>('');
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parts: [{ number: '' }, { number: '' }, { number: '' }, { number: '' }],
    },
  });

  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');

  // Use confirmation hook
  const { ConfirmDialogComponent } = useDialogWithConfirm({
    form,
    hasUnsavedFiles: estimateFiles.length > 0, // Check for files
    onClose: () => {
      form.reset();
      setEstimateFiles([]);
      onOpenChange(false);
    },
    title: t('common.discardTitle'),
    description: t('common.discardDescription'),
  });

  const createdUrls = useRef<Set<string>>(new Set());

  // Edit the original parts order directly after creating a new repair order Reassign
  if (initialData && Array.isArray(initialData)) {
    initialData = initialData[0];
  }

  const handleClose = () => {
    // handleCloseRequest();
    form.reset();
    setEstimateFiles([]);
    onOpenChange(false);
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // handleCloseRequest();
      form.reset();
      setEstimateFiles([]);
      onOpenChange(false);
      return false; // Prevent default close behavior
    }
    return true;
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'parts',
  });

  // Determine if it is a supplemental order
  const isSupplement =
    isSupplementMode ?? (initialData?.partsOrderNumber !== undefined && initialData.partsOrderNumber > 0);
  const supplementNum = supplementNumber ?? (initialData?.partsOrderNumber ?? 0) + 1;
  const getDialogTitle = () => {
    if (isReject) {
      return t('partsOrder.dialog.resubmitTitle');
    }

    if (isSupplement) {
      const isEditMode = !!initialData?.id;
      return isEditMode
        ? t('partsOrder.dialog.editSupplement', { num: supplementNum })
        : t('partsOrder.dialog.newSupplement', { num: supplementNum }); // 或 newSupplement
    }

    return initialData?.id && currentPathname.split('/').length>2 ? t('partsOrder.dialog.editTitle') : t('partsOrder.dialog.newTitle');
  };

  const getPartsOrderSectionTitle = () => {
    if (isSupplement) {
      return t('partsOrder.section.supplementInfo', { num: supplementNum });
    }
    return t('partsOrder.section.info');
  };

  // Check if it's a new order (not edit mode)
  const isNewOrder = getDialogTitle() === t('partsOrder.dialog.newTitle')

  // When initialData changes，Reset form
  useEffect(() => {
    if (open && initialData) {
      // Edit mode：Use initial data
      const parts =
        initialData.parts && initialData.parts.length > 0
          ? initialData.parts.map((part) => ({ number: part }))
          : [{ number: '' }];
      form.reset({
        parts: parts.length > 0 ? parts : [{ number: '' }],
      });
      // Initialize sales order number
      setSalesOrderNumber(initialData.salesOrderNumber || '');
      // Use setTimeout Move setState to the next event loop
      // setTimeout(() => {
      // setEstimateFiles(initialData.estimateFileAssets || [])
      // }, 0)
      const pdfList = (initialData.estimateFileAssets || []).map((item: any) => {
        item.name = item.filename;
        item.viewUrl = import.meta.env.VITE_API_URL + item.viewUrl;
        return item;
      });
      setEstimateFiles(pdfList || []);
    } else if (open && mode === 'create') {
      // New mode：Reset to default value
      form.reset({
        parts: [{ number: '' }],
      });
      setSalesOrderNumber('');
      setEstimateFiles([]);
    }
  }, [open, initialData, mode, form]);

  const onSubmit = async (data: FormValues) => {
    // CSR only edits sales order number, skip other validations
    if (!isCsr) {
      // Validate at least one part number
      const hasAtLeastOnePart = data.parts.some((part) => part.number.trim() !== '');
      if (!hasAtLeastOnePart) {
        setPartsError(t('partsOrder.validation.atLeastOnePart'));
        toast.error(t('partsOrder.validation.atLeastOnePart'));
        setTimeout(() => {
          const partsSection = document.querySelector('[data-parts-section]');
          partsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return;
      }
      setPartsError(''); // Clear error message
      
      // Validate at least one attachment
      if (estimateFiles.length === 0) {
        setAttachmentError(t('partsOrder.validation.atLeastOneAttachment'));
        toast.error(t('partsOrder.validation.atLeastOneAttachment'));
        setTimeout(() => {
          const attachmentsSection = document.querySelector('[data-attachments-section]');
          attachmentsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return;
      }
      setAttachmentError(''); // Clear error message
    }
    
    const newFiles = estimateFiles.filter((f): f is File => f instanceof File);
    // Convert file to FileAsset Array
    const estimateFileAssets = await convertFilesToFileAssets(newFiles, FileAssetFileAssetTypeEnum.ESTIMATE);
    try {
      const api = new RequestApi();
      const partsOrder = (PartsOrder as any).create({
        ...initialData,
        // CSR only edits sales order number, keep original parts and attachments
        parts: isCsr ? initialData?.parts : data.parts.map((part) => part.number),
        estimateFileAssets: isCsr 
          ? initialData?.estimateFileAssets 
          : (estimateFileAssets.length > 0 ? estimateFileAssets : estimateFiles),
        salesOrderNumber: salesOrderNumber, // Include sales order number
        repairOrder: initRepaitOrderData,
      });
      setLoading(true);
      return new Promise((resolve, reject) => {
        api.partsOrderSave(partsOrder, {
          status200: () => {
            toast.success(t('partsOrder.toast.saveSuccess'));
            onOpenChange(false);
            onSuccess?.();
            setLoading(false);
            resolve(void 0);
          },
          error: () => {
            toast.error(t('partsOrder.toast.saveError'));
            setLoading(false);
            reject(void 0);
          },
          else: (_statusCode: number, responseText: string) => {
            toast.error(responseText);
            setLoading(false);
            reject(void 0);
          },
        });
      });
    } catch (error: unknown) {
      setLoading(false);
      toast.error(t('partsOrder.toast.saveError'));
    }
  };

  // Modify useDropzone to support multiple files
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    // Remove maxFiles Limit，or set to a larger number
    // maxFiles: 1,
    onDrop: (acceptedFiles) => {
      console.log(acceptedFiles);
      setEstimateFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
      // Clear error when files are added
      if (attachmentError) {
        setAttachmentError('');
      }
    },
  });

  const handlePreview = (file: any) => {
    let previewUrl: string;

    if (file instanceof File) {
      previewUrl = URL.createObjectURL(file);
      createdUrls.current.add(previewUrl);
    } else {
      previewUrl = file.viewUrl || file.relativePath;
    }

    window.open(previewUrl, '_blank');
  };

  const removeFile = (index: number) => {
    const file = estimateFiles[index];
    setEstimateFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (file instanceof File) {
        const potentialUrl = Array.from(createdUrls.current).find((url) => url.startsWith('blob:'));
        if (potentialUrl) {
          URL.revokeObjectURL(potentialUrl);
          createdUrls.current.delete(potentialUrl);
        }
      }
      // Check if no files left after removal
      if (newFiles.length === 0) {
        setAttachmentError(t('partsOrder.validation.atLeastOneAttachment'));
      }
      return newFiles;
    });
  };
  useEffect(() => {
    return () => {
      createdUrls.current.forEach((url) => URL.revokeObjectURL(url));
      createdUrls.current.clear();
    };
  }, []);
  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => handleDialogOpenChange(newOpen)}>
        <DialogContent className="flex max-h-[90vh] flex-col p-0 sm:max-w-4xl">
          <DialogHeader className="flex justify-center shrink-0">
            <DialogTitle className="px-6 py-3 text-2xl font-semibold">{getDialogTitle()}</DialogTitle>
            <button
              onClick={handleClose}
              className="absolute transition-opacity rounded-sm ring-offset-background focus:ring-ring top-4 right-4 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">{t('common.close')}</span>
            </button>
            <Separator />
          </DialogHeader>
          <Form {...form}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                // Check parts before form validation
                const formData = form.getValues();
                const hasAtLeastOnePart = formData.parts.some((part) => part.number.trim() !== '');
                if (!hasAtLeastOnePart) {
                  setPartsError(t('partsOrder.validation.atLeastOnePart'));
                  toast.error(t('partsOrder.validation.atLeastOnePart'));
                  setTimeout(() => {
                    const partsSection = document.querySelector('[data-parts-section]');
                    partsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                  return;
                }
                // Check attachment before form validation
                if (estimateFiles.length === 0) {
                  setAttachmentError(t('partsOrder.validation.atLeastOneAttachment'));
                  toast.error(t('partsOrder.validation.atLeastOneAttachment'));
                  setTimeout(() => {
                    const attachmentsSection = document.querySelector('[data-attachments-section]');
                    attachmentsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                  return;
                }
                form.handleSubmit(onSubmit)(e);
              }} 
              className="flex flex-col flex-1 min-h-0"
            >
              <div className="flex-1 px-6 py-2 overflow-y-auto">
                <section className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">{t('repairOrder.section.info')}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 p-5 rounded-lg bg-muted/50 md:grid-cols-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('repairOrder.form.roNumber.label')}</Label>
                      <p className="font-medium">{initRepaitOrderData?.roNumber || '---'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('repairOrder.form.dealership.label')}</Label>
                      <p className="font-medium">{initRepaitOrderData?.dealership.name || '---'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('repairOrder.form.customer.label')}</Label>
                      <p className="font-medium">{initRepaitOrderData?.customer || '---'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('repairOrder.form.vin.label')}</Label>
                      <p className="font-medium">{initRepaitOrderData?.vin || '---'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">{t('repairOrder.form.ymm.label')}</Label>
                      <p className="font-medium">
                        {initRepaitOrderData?.year && initRepaitOrderData?.make && initRepaitOrderData?.model
                          ? `${initRepaitOrderData?.year} ${initRepaitOrderData?.make} ${initRepaitOrderData?.model}`
                          : '---'}
                      </p>
                    </div>
                  </div>
                </section>
                <Separator className='mb-8' />
                {/* 2. Parts Order Information / Supplement Information（Read-only） */}
                <section>
                  <div className="flex items-center gap-3 mb-5">
                    <Package className="w-5 h-5 text-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">{getPartsOrderSectionTitle()}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-8 text-sm">
                    <div>
                      <Label className="text-muted-foreground">{t('partsOrder.section.submitted')}</Label>
                      {!isNewOrder && initialData?.dateSubmitted ? (
                        <p className="mt-1 font-medium">
                          {formatDateOnly(initialData.dateSubmitted)}
                          {initialData.submittedByPerson && (
                            <>
                              {' '}{t('common.by')}{' '}
                              {initialData.submittedByPerson.firstName}{' '}
                              {initialData.submittedByPerson.lastName}
                            </>
                          )}
                        </p>
                      ) : (
                        <p className="mt-1 font-medium">---</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('partsOrder.section.approved')}</Label>
                      {!isNewOrder && initialData?.dateReviewed ? (
                        <p className="mt-1 font-medium">
                          {formatDateOnly(initialData.dateReviewed)}
                          {initialData.reviewedByPerson && (
                            <>
                              {' '}{t('common.by')}{' '}
                              {initialData.reviewedByPerson.firstName}{' '}
                              {initialData.reviewedByPerson.lastName}
                            </>
                          )}
                        </p>
                      ) : (
                        <p className="mt-1 font-medium">---</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('partsOrder.section.shipped')}</Label>
                      {!isNewOrder && initialData?.dateShipped ? (
                        <p className="mt-1 font-medium">
                          {formatDateOnly(initialData.dateShipped)}
                          {initialData.shippedByPerson && (
                            <>
                              {' '}{t('common.by')}{' '}
                              {initialData.shippedByPerson.firstName}{' '}
                              {initialData.shippedByPerson.lastName}
                            </>
                          )}
                        </p>
                      ) : (
                        <p className="mt-1 font-medium">---</p>
                      )}
                    </div>
                    {/* Display in edit mode Sales Order Number */}
                    {initialData?.id && (
                      <div>
                        <Label className="text-muted-foreground">{t('partsOrder.section.salesOrder')}</Label>
                        {isCsr && initialData?.status === 'DealershipProcessing' ? (
                          <Input 
                            type="text" 
                            value={salesOrderNumber}
                            onChange={(e) => setSalesOrderNumber(e.target.value)}
                            placeholder={t('partsOrder.form.salesOrder.placeholder')}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 font-medium">
                            {initialData.salesOrderNumber || '---'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
                <Separator className="my-8" />
                {/* 3. Requested Part Numbers + Attachments Side by side */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                  {/* Left：Parts input */}
                  <section data-parts-section>
                    <div className="flex items-center gap-3 mb-5">
                      <Package className="w-5 h-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('partsOrder.section.requestedParts')}
                        <span className="text-destructive ml-1">*</span>
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {fields.map((field, i) => (
                        <div key={field.id} className="flex items-center gap-3">
                          <span className="w-12 text-sm text-muted-foreground">
                            {t('partsOrder.form.partNumber.label', { num: i + 1 })}
                          </span>
                          <FormField
                            disabled={initialData?.status === 'DealershipProcessing' || isCsr}
                            control={form.control}
                            name={`parts.${i}.number`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input 
                                    placeholder={t('partsOrder.form.partNumber.placeholder')} 
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      // Clear error when user starts typing
                                      if (partsError && e.target.value.trim() !== '') {
                                        setPartsError('');
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {fields.length > 1 && (
                            <Button
                              disabled={initialData?.status === 'DealershipProcessing' || isCsr}
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(i)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        disabled={initialData?.status === 'DealershipProcessing' || isCsr}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ number: '' })}
                      >
                        <Plus className="w-4 h-4 mr-2" /> {t('partsOrder.button.addPart')}
                      </Button>
                      {/* Display parts error message */}
                      {partsError && (
                        <div className="flex items-start gap-2 px-3 py-2.5 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          <span>{partsError}</span>
                        </div>
                      )}
                    </div>
                  </section>
                  {/* Right：Estimate PDF Upload */}
                  <section data-attachments-section>
                    <div className="flex items-center gap-3 mb-5">
                      <Paperclip className="w-5 h-5 text-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">{t('repairOrder.section.attachments')}</h3>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-foreground">
                        {t('partsOrder.attachments.estimate')}
                        {/* Required only when in add mode or edit mode and there are no files yet */}
                        {(mode === 'create' || !initialData?.estimateFileAssets?.length) && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      <div
                        {...getRootProps()}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-all ${isDragActive ? 'border-primary bg-muted' : 'border-border hover:border-primary'}`}
                      >
                        <input {...getInputProps()} disabled={initialData?.status === 'DealershipProcessing' || isCsr} />
                        <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {isDragActive ? (
                            t('partsOrder.dropzone.dropPdf')
                          ) : (
                            <>
                              {t('partsOrder.dropzone.instructionPdf')}{' '}
                              <span className="text-primary hover:underline">
                                {t('partsOrder.dropzone.clickToBrowse')}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <div>
                        {estimateFiles && estimateFiles.length > 0 && (
                          <div className="w-full space-y-2">
                            {estimateFiles.map((file: any, index) => {
                              const key = file.viewUrl ? file.viewUrl : `${file.name}-${index}`;
                              return (
                                <div key={key} className="flex items-center justify-between rounded-md p-1.5">
                                  <div className="flex-1 truncate" title={file.name}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handlePreview(file);
                                      }}
                                      className="text-sm font-medium text-blue-500 underline truncate cursor-pointer"
                                    >
                                      {file.name || file.filename}
                                    </button>
                                    {/* <p className='text-xs text-muted-foreground'>
                                  {(file.size / 1024).toFixed(2)} KB
                                </p> */}
                                  </div>
                                  {!isCsr && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                      }}
                                      className="ml-2 text-xs text-destructive hover:underline"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {/* Display attachment error message */}
                      {attachmentError && (
                        <div className="flex items-start gap-2 px-3 py-2.5 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          <span>{attachmentError}</span>
                        </div>
                      )}
                      {/* Display error message */}
                      {form.formState.errors._estimateFile && (
                        <p className="text-sm text-destructive">{form.formState.errors._estimateFile.message}</p>
                      )}
                    </div>
                  </section>
                </div>
                <div>
                  {/* If it isisRejece Must be filledcommentInformation */}
                  {isReject && (
                    <div className="mt-6">
                      <h3 className="flex items-center gap-3 text-lg font-medium">
                        <NotebookPen className="h-5 text-muted-foreground w5" />
                        {t('partsOrder.section.comment')}
                      </h3>
                      <Input
                        type="textarea"
                        placeholder={t('partsOrder.form.comment.placeholder')}
                        value={comment}
                        className="mt-2 h-11"
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Fixed bottom - Unified style */}
              <DialogFooter className="flex-shrink-0 w-full px-6 py-4 border-t bg-muted/50 backdrop-blur">
                <div className="flex justify-end w-full gap-3">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    {t('common.cancel')}
                  </Button>
                  {isReject ? (
                    <Button
                      type="button"
                      onClick={async () => {
                        // Validate before submitting
                        const formData = form.getValues();
                        const hasAtLeastOnePart = formData.parts.some((part) => part.number.trim() !== '');
                        if (!hasAtLeastOnePart) {
                          setPartsError(t('partsOrder.validation.atLeastOnePart'));
                          toast.error(t('partsOrder.validation.atLeastOnePart'));
                          setTimeout(() => {
                            const partsSection = document.querySelector('[data-parts-section]');
                            partsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                          return;
                        }
                        if (estimateFiles.length === 0) {
                          setAttachmentError(t('partsOrder.validation.atLeastOneAttachment'));
                          toast.error(t('partsOrder.validation.atLeastOneAttachment'));
                          setTimeout(() => {
                            const attachmentsSection = document.querySelector('[data-attachments-section]');
                            attachmentsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                          return;
                        }
                        
                        setLoading(true);
                        try {
                          await onSubmit(formData as FormValues);
                          await onHandleResubmit?.(comment);
                        } catch (error) {
                          // Error already handled in onSubmit
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('partsOrder.button.resubmitting')}
                        </>
                      ) : (
                        t('partsOrder.button.resubmit')
                      )}
                    </Button>
                  ) : (
                    <Button type="submit" variant="default" disabled={loading || form.formState.isSubmitting}>
                      {loading || form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {initialData?.id ? t('partsOrder.button.updating') : t('partsOrder.button.saving')}
                        </>
                      ) : initialData?.id ? (
                        t('partsOrder.button.update')
                      ) : (
                        t('partsOrder.button.save')
                      )}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {ConfirmDialogComponent}
    </>
  );
}
