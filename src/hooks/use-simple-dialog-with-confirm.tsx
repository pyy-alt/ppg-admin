import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface UseSimpleDialogWithConfirmOptions {
  onClose: () => void
  hasUnsavedChanges?: boolean
  title?: string
  description?: string
}

export function useSimpleDialogWithConfirm({
  onClose,
  hasUnsavedChanges = false,
  title = 'Unsaved Changes',
  description = 'You have unsaved changes. Are you sure you want to close? Your changes will be lost.',
}: UseSimpleDialogWithConfirmOptions) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Handle close request
  const handleCloseRequest = (force: boolean = false) => {
    if (force || !hasUnsavedChanges) {
      // No unsaved changes，Close directly
      onClose()
    } else {
      // There are unsaved changes，Show confirmation dialog
      setShowConfirmDialog(true)
    }
  }

  // Confirm close
  const handleConfirmClose = () => {
    setShowConfirmDialog(false)
    onClose()
  }

  // Confirmation dialog component
  const ConfirmDialogComponent = (
    <ConfirmDialog
      open={showConfirmDialog}
      onOpenChange={setShowConfirmDialog}
      title={title}
      desc={description}
      cancelBtnText="Cancel"
      confirmText="Confirm Close"
      destructive
      handleConfirm={handleConfirmClose}
    />
  )

  return {
    handleCloseRequest,
    ConfirmDialogComponent,
    hasUnsavedChanges,
  }
}