import { useState } from 'react'
import type RepairOrder from '@/js/models/RepairOrder'
import { Check, X, FileText, Package, NotebookPen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateOnly } from '@/lib/utils'
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
  onReject?: (comment: string) => void
  isReject?: boolean
  initRepaitOrderData?: RepairOrder
  selectPartsOrderData?: any
}

export default function PartsOrderApprovedDialog({
  open,
  onOpenChange,
  onApprove,
  isReject = false,
  onReject,
  initRepaitOrderData,
  selectPartsOrderData,
}: PartsOrderApprovedDialogProps) {
  const [salesOrder, setSalesOrder] = useState('')
  const [reasonForRejection, setReasonForRejection] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = () => {
    return new Promise(async (resolve) => {
      try {
        if (isReject) {
          if (!reasonForRejection) {
            toast.error('Reason for rejection is required')
            return
          }
          // onReject?.(reasonForRejection)
        } else {
          if (!salesOrder) {
            toast.error('Sales order number is required')
            return
          }
          // onApprove?.(salesOrder)
        }
        setIsLoading(true)

        if (isReject) {
          await onReject?.(reasonForRejection)
          resolve(void 0)
        } else {
          await onApprove?.(salesOrder)
          resolve(void 0)
        }
        setReasonForRejection('')
        setSalesOrder('')
        onOpenChange(false)
        resolve(void 0)
      } catch (error) {
        toast.error(
          `Failed to ${isReject ? 'reject' : 'approve'} parts order ${error}|`
        )
        resolve(void 0)
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-screen overflow-y-auto sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3 text-2xl font-semibold'>
            {isReject ? (
              <X className='p-1 text-white bg-red-500 rounded-full h-7 w-7' />
            ) : (
              <Check className='p-1 text-white bg-green-500 rounded-full h-7 w-7' />
            )}
            {isReject ? 'Parts Order Rejected' : 'Parts Order Approved'}
          </DialogTitle>
          <Separator />
          <button
            onClick={() => onOpenChange(false)}
            className='absolute transition-opacity rounded-sm focus:ring-ring top-4 right-4 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
          >
            <X className='w-4 h-4' />
            <span className='sr-only'>Close</span>
          </button>
        </DialogHeader>

        <div className='p-6 pt-8 space-y-10'>
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

          {/* Section 2: Parts Order Information */}
          <section>
            <h3 className='flex items-center gap-3 mb-6 text-lg font-medium'>
              <Package className='w-6 h-6 text-muted-foreground' />
              Parts Order Information
            </h3>
            <div className='grid grid-cols-1 text-sm gap-x-12 gap-y-6 sm:grid-cols-3'>
              <div>
                <Label className='text-muted-foreground'>Order Submitted</Label>
                <p className='mt-1.5'>
                  {formatDateOnly(
                    initRepaitOrderData?.dateLastSubmitted as Date
                  ) || '--'}
                  {' by' + ' '}
                  {selectPartsOrderData?.submittedByPerson?.firstName +
                    ' ' +
                    selectPartsOrderData?.submittedByPerson?.lastName}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Order Approved</Label>
                {(initRepaitOrderData?.dateClosed && (
                  <p className='mt-1.5 font-medium'>
                    {formatDateOnly(initRepaitOrderData?.dateClosed as Date) ||
                      '--'}
                    {' by' + ' '}
                    {selectPartsOrderData?.reviewedByPerson?.firstName +
                      ' ' +
                      selectPartsOrderData?.reviewedByPerson?.lastName}
                  </p>
                )) || <p className='text-muted-foreground mt-1.5'>--</p>}
              </div>
              <div>
                <Label className='text-muted-foreground'>Order Shipped</Label>
                {(selectPartsOrderData?.shippedByPerson?.dateLastAccess && (
                  <p className='text-muted-foreground mt-1.5'>
                    {selectPartsOrderData?.shippedByPerson?.dateLastAccess ||
                      '--'}
                    {' by' + ' '}
                    {selectPartsOrderData?.shippedByPerson?.firstName +
                      ' ' +
                      selectPartsOrderData?.shippedByPerson?.lastName}
                  </p>
                )) || <p className='text-muted-foreground mt-1.5'>--</p>}
              </div>
            </div>
          </section>

          <Separator className='bg-border/60' />

          {/* Section 3: Assign Sales Order */}
          {isReject ? (
            <section>
              <h3 className='flex items-center gap-3 mb-6 text-lg font-medium'>
                <NotebookPen className='w-6 h-6 text-muted-foreground' />
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
              <h3 className='flex items-center gap-3 mb-6 text-lg font-medium'>
                <NotebookPen className='w-6 h-6 text-muted-foreground' />
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
                  value={salesOrder}
                  onChange={(e) => setSalesOrder(e.target.value.trim())}
                />
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/30'>
          <Button
            variant='outline'
            size='lg'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size='lg'
            className={
              isReject
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }
            onClick={handleApprove}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                {isReject ? 'Rejecting...' : 'Approving...'}
              </>
            ) : isReject ? (
              'Reject'
            ) : (
              'Approve'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
