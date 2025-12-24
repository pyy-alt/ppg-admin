import { useState } from 'react'
import type RepairOrder from '@/js/models/RepairOrder'
import { X, FileText, Paperclip, Upload, Camera, Trash2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface MarkRepairAsCompleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: (photos: File[]) => void
  initRepaitOrderData?: RepairOrder
}

export function MarkRepairAsCompleteDialog({
  open,
  onOpenChange,
  onComplete,
  initRepaitOrderData,
}: MarkRepairAsCompleteDialogProps) {
  const [photos, setPhotos] = useState<File[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (acceptedFiles) => {
      setPhotos((prev) => [...prev, ...acceptedFiles])
    },
  })

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleComplete = () => {
    if (photos.length === 0)
      return toast.error('Please upload at least one photo')
    onComplete?.(photos)
    onOpenChange(false)
  }

  const handleClose = () => {
    setPhotos([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[90vh] flex-col p-0 sm:max-w-4xl'>
        {/* Fixed header - Unified style */}
        <DialogHeader className='flex-shrink-0'>
          <DialogTitle className='px-6 py-4 text-2xl font-semibold'>
            Mark Repair as Complete
          </DialogTitle>
          <Separator />

          <button
            onClick={handleClose}
            className='absolute transition-opacity rounded-sm ring-offset-background focus:ring-ring top-4 right-4 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          >
            <X className='w-4 h-4' />
            <span className='sr-only'>Close</span>
          </button>
        </DialogHeader>

        <div className='flex-1 min-h-0 p-6 pt-8 space-y-10 overflow-y-auto'>
          {/* Section 1: Repair Order Information */}
          <section>
            <h3 className='flex items-center gap-3 mb-6 text-lg font-medium'>
              <FileText className='w-6 h-6 text-muted-foreground' />
              Repair Order Information
            </h3>
            <div className='grid grid-cols-1 text-sm gap-x-12 gap-y-6 sm:grid-cols-3'>
              <div>
                <Label className='text-muted-foreground'>Shop RO#</Label>
                <p className='text-foreground mt-1.5 font-medium'>
                  {initRepaitOrderData?.roNumber || '--'}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>
                  Ordered From Dealership
                </Label>
                <p className='text-foreground mt-1.5 font-medium'>
                  {initRepaitOrderData?.dealership?.name || '--'}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Customer</Label>
                <p className='text-foreground mt-1.5 font-medium'>
                  {initRepaitOrderData?.customer || '--'}
                </p>
              </div>

              <div>
                <Label className='text-muted-foreground'>VIN</Label>
                <p className='text-foreground mt-1.5'>
                  {initRepaitOrderData?.vin || '--'}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Year/Make/Model</Label>
                <p className='text-foreground mt-1.5 font-medium'>
                  {initRepaitOrderData?.year}/{initRepaitOrderData?.make}/
                  {initRepaitOrderData?.model}
                </p>
              </div>
            </div>
          </section>

          <Separator className='bg-border/60' />

          {/* Section 2: Attachments - Post-Repair Photos */}
          <section>
            <h3 className='flex items-center gap-3 mb-6 text-lg font-medium'>
              <Paperclip className='w-6 h-6 text-muted-foreground' />
              Attachments
            </h3>

            <div className='space-y-4'>
              <Label className='font-medium text-foreground'>
                Post-Repair Photos <span className='text-destructive'>*</span>
              </Label>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`relative cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-all ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
                <p className='text-muted-foreground'>
                  Drop your photos here or{' '}
                  <span className='font-medium text-primary hover:underline'>
                    click to browse
                  </span>
                </p>
              </div>
              {/* Open Camera Button（Optional） */}
              <Button variant='outline' size='sm' className='w-fit'>
                <Camera className='w-4 h-4 mr-2' />
                Open camera
              </Button>
            </div>
            <div>
              {/* Uploaded file list */}
              {photos.length > 0 && (
                <div className='mt-2 space-y-1'>
                  {photos.map((file, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between rounded-md p-1.5'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='text-left'>
                          <p className='max-w-xs text-sm font-medium text-blue-500 truncate hover:underline'>
                            {file.name}
                          </p>
                          {/* <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(0)} KB
                            </p> */}
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation()
                          removePhoto(index)
                        }}
                        className='p-1 rounded text-destructive hover:bg-destructive/10'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30'>
          <Button variant='outline' size='lg' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size='lg'
            className='px-8 font-medium text-white bg-black hover:bg-black/90'
            onClick={handleComplete}
          >
            Mark Repair as Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
