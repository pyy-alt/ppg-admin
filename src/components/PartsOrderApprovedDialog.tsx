import { useState } from 'react'
import { Check, X, FileText, Package, NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from './ui/textarea'

interface PartsOrderApprovedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove?: (salesOrderNumber: string) => void
}

export default function PartsOrderApprovedDialog({
  open,
  onOpenChange,
  onApprove,
}: PartsOrderApprovedDialogProps) {
  const handleApprove = () => {
    const salesOrder = (
      document.getElementById('sales-order') as HTMLInputElement
    )?.value?.trim()
    if (!salesOrder) return
    onApprove?.(salesOrder)
    onOpenChange(false)
  }

  const [isReject, ] = useState(true)
  const [reasonForRejection, setReasonForRejection] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-screen overflow-y-auto sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3 text-2xl font-semibold'>
            {isReject ? <X className='h-7 w-7 rounded-full bg-red-500 p-1 text-white' /> : <Check className='h-7 w-7 rounded-full bg-green-500 p-1 text-white' />}
            {isReject ? 'Parts Order Rejected' : 'Parts Order Approved'}
          </DialogTitle>
          <Separator />
          <button
            onClick={() => onOpenChange(false)}
            className='focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          >
            <X className='h-4 w-4' />
            <span className='sr-only'>Close</span>
          </button>
        </DialogHeader>

        <div className='space-y-10 p-6 pt-8'>
          {/* Section 1: Repair Order Information */}
          <section>
            <h3 className='mb-6 flex items-center gap-3 text-lg font-medium'>
              <FileText className='text-muted-foreground h-6 w-6' />
              Repair Order Information
            </h3>
            <div className='grid grid-cols-1 gap-x-12 gap-y-6 text-sm sm:grid-cols-3'>
              <div>
                <Label className='text-muted-foreground'>Shop RO#</Label>
                <p className='text-foreground mt-1.5 font-medium'>805</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>
                  Ordered From Dealership
                </Label>
                <p className='text-foreground mt-1.5 font-medium'>
                  Pacific Motors (98321)
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Customer</Label>
                <p className='text-foreground mt-1.5 font-medium'>
                  Brian Cooper
                </p>
              </div>

              <div>
                <Label className='text-muted-foreground'>VIN</Label>
                <p className='text-foreground mt-1.5 font-mono'>
                  AUDIZZ5CZKK246801
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Year/Make/Model</Label>
                <p className='text-foreground mt-1.5 font-medium'>
                  2017 Audi S3 Sedan
                </p>
              </div>
            </div>
          </section>

          <Separator className='bg-border/60' />

          {/* Section 2: Parts Order Information */}
          <section>
            <h3 className='mb-6 flex items-center gap-3 text-lg font-medium'>
              <Package className='text-muted-foreground h-6 w-6' />
              Parts Order Information
            </h3>
            <div className='grid grid-cols-1 gap-x-12 gap-y-6 text-sm sm:grid-cols-3'>
              <div>
                <Label className='text-muted-foreground'>Order Submitted</Label>
                <p className='mt-1.5'>2/15/2025 4:01 PM by Jake Renshaw</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Order Approved</Label>
                <p className='mt-1.5 font-medium'>
                  2/24/2025 4:01 PM by Michael Reynolds
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Order Shipped</Label>
                <p className='text-muted-foreground mt-1.5'>---</p>
              </div>
            </div>
          </section>

          <Separator className='bg-border/60' />

          {/* Section 3: Assign Sales Order */}
          {isReject ? (
            <section>
              <h3 className='mb-6 flex items-center gap-3 text-lg font-medium'>
                <NotebookPen className='text-muted-foreground h-6 w-6' />
                Reason for Rejection
              </h3>
              <Textarea
                value={reasonForRejection}
                onChange={(e) => setReasonForRejection(e.target.value)}
                id='sales-order'
                placeholder='Provied a reason for rejection'
                className='mt-2 h-11'
              />
            </section>
          ) : (
            <section>
              <h3 className='mb-6 flex items-center gap-3 text-lg font-medium'>
                <NotebookPen className='text-muted-foreground h-6 w-6' />
                Sales Order #
              </h3>
              <div className='max-w-sm'>
                <Label htmlFor='sales-order' className='text-muted-foreground'>
                  Assign a Sales Order #
                </Label>
                <Input
                  id='sales-order'
                  placeholder='Enter sales order number (e.g. SO-174)'
                  className='mt-2 h-11'
                />
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className='bg-muted/30 flex items-center justify-end gap-3 border-t px-6 py-4'>
          <Button
            variant='outline'
            size='lg'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size='lg'
            className='bg-black px-8 font-medium text-white hover:bg-black/90'
            onClick={handleApprove}
          >
            Approve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
