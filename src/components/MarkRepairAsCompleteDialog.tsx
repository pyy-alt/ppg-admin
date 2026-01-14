import { useState, useEffect } from 'react';
import type RepairOrder from '@/js/models/RepairOrder';
import { X, FileText, Paperclip, Upload, Camera, Trash2, AlertTriangle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next'; // 新增导入

interface MarkRepairAsCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (photos: File[]) => void;
  initRepaitOrderData?: RepairOrder;
}

export function MarkRepairAsCompleteDialog({
  open,
  onOpenChange,
  onComplete,
  initRepaitOrderData,
}: MarkRepairAsCompleteDialogProps) {
  const { t } = useTranslation();

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string>('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // 当对话框打开/关闭时清空数据
  useEffect(() => {
    if (!open) {
      setPhotos([]);
      setPhotoError('');
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    }
  }, [open]);

  // Create preview URLs when photos change
  useEffect(() => {
    // Revoke old URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Create new URLs
    const newUrls = photos.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);
    
    // Cleanup function
    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const { getRootProps, getInputProps, isDragActive,open: openCamera } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (acceptedFiles) => {
      setPhotos((prev) => [...prev, ...acceptedFiles]);
      if (acceptedFiles.length > 0) {
        setPhotoError(''); // 清除错误
      }
    },
  });

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    // 清除错误（如果有的话）
    if (photoError) {
      setPhotoError('');
    }
  };

  const handleComplete = () => {
    // Post-repair photos 不再是必需的，直接提交
    setPhotoError('');
    onComplete?.(photos);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] flex-col p-0 sm:max-w-4xl">
        {/* Fixed header - Unified style */}
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="px-6 py-4 text-2xl font-semibold">
            {t('repairOrder.completeDialog.title')}
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
        <div className="flex-1 min-h-0 p-6 pt-8 space-y-10 overflow-y-auto">
          {/* Section 1: Repair Order Information */}
          <section>
            <h3 className="flex items-center gap-3 mb-6 text-lg font-medium">
              <FileText className="w-6 h-6 text-muted-foreground" />
              {t('repairOrder.section.info')}
            </h3>
            <div className="grid grid-cols-1 text-sm gap-x-12 gap-y-6 sm:grid-cols-3">
              <div>
                <Label className="text-muted-foreground">{t('repairOrder.form.roNumber.label')}</Label>
                <p className="text-foreground mt-1.5 font-medium">{initRepaitOrderData?.roNumber || '--'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('repairOrder.form.dealership.label')}</Label>
                <p className="text-foreground mt-1.5 font-medium">{initRepaitOrderData?.dealership?.name || '--'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('repairOrder.form.customer.label')}</Label>
                <p className="text-foreground mt-1.5 font-medium">{initRepaitOrderData?.customer || '--'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('repairOrder.form.vin.label')}</Label>
                <p className="text-foreground mt-1.5">{initRepaitOrderData?.vin || '--'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('repairOrder.form.ymm.label')}</Label>
                <p className="text-foreground mt-1.5 font-medium">
                  {initRepaitOrderData?.year}/{initRepaitOrderData?.make}/{initRepaitOrderData?.model}
                </p>
              </div>
            </div>
          </section>
          <Separator className="bg-border/60" />
          {/* Section 2: Attachments - Post-Repair Photos */}
          <section data-attachments-section>
            <h3 className="flex items-center gap-3 mb-6 text-lg font-medium">
              <Paperclip className="w-6 h-6 text-muted-foreground" />
              {t('repairOrder.section.attachments')}
            </h3>
            <div className="space-y-4">
              <Label className="font-medium text-foreground">
                {t('repairOrder.completeDialog.postRepairPhotos')}
              </Label>
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`relative cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-all ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {isDragActive ? (
                    t('repairOrder.dropzone.dropHere', { type: t('repairOrder.completeDialog.photos') })
                  ) : (
                    <>
                      {t('repairOrder.dropzone.instruction', { type: t('repairOrder.completeDialog.photos') })}{' '}
                      <span className="font-medium text-primary hover:underline">
                        {t('repairOrder.dropzone.clickToBrowse')}
                      </span>
                    </>
                  )}
                </p>
              </div>
              {/* 错误提示 */}
              {photoError && (
                <div className="flex items-start gap-2 p-3 text-sm border rounded-md bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{photoError}</p>
                </div>
              )}
              {/* Open Camera Button（Optional） */}
              <Button variant="outline" size="sm" className="w-fit"   onClick={(e) => {
            e.preventDefault();
            openCamera();
          }}>
                <Camera className="w-4 h-4 mr-2" />
                {t('repairOrder.dropzone.openCamera')}
              </Button>
            </div>
            <div>
              {/* Uploaded file list */}
              {photos.length > 0 && (
                <div className="mt-2">
                  {photos.map((file, index, array) => (
                    <span key={index} className="inline-flex items-center gap-1">
                      <a
                        href={previewUrls[index]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-blue-700 underline hover:underline"
                      >
                        {file.name}
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                        className="inline-flex items-center p-0.5 rounded text-destructive hover:bg-destructive/10"
                        title="删除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {index < array.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" size="lg" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button size="lg" className="px-8 font-medium text-white bg-black hover:bg-black/90" onClick={handleComplete}>
            {t('repairOrder.completeDialog.button')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
