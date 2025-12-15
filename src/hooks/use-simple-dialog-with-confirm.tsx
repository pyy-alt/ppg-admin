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

  // 处理关闭请求
  const handleCloseRequest = (force: boolean = false) => {
    if (force || !hasUnsavedChanges) {
      // 没有未保存的更改，直接关闭
      onClose()
    } else {
      // 有未保存的更改，显示确认对话框
      setShowConfirmDialog(true)
    }
  }

  // 确认关闭
  const handleConfirmClose = () => {
    setShowConfirmDialog(false)
    onClose()
  }

  // 确认对话框组件
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