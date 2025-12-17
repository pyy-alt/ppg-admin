import { useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface UseDialogWithConfirmOptions<T extends Record<string, any>> {
  form: UseFormReturn<T>
  hasUnsavedFiles?: boolean // Used to check for unsaved files
  onClose: () => void
  title?: string
  description?: string
}

export function useDialogWithConfirm<T extends Record<string, any>>({
  form,
  hasUnsavedFiles = false,
  onClose,
  title = 'Unsaved Changes',
  description = 'You have unsaved changes. Are you sure you want to close? Your changes will be lost.',
}: UseDialogWithConfirmOptions<T>) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Check for unsaved changes
  const hasUnsavedChanges = form.formState.isDirty || hasUnsavedFiles

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

  // // Cancel close
  // const handleCancelClose = () => {
  //   setShowConfirmDialog(false)
  //   setPendingClose(false)
  // }

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

