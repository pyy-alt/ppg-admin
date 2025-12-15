import { useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface UseDialogWithConfirmOptions<T extends Record<string, any>> {
  form: UseFormReturn<T>
  hasUnsavedFiles?: boolean // 用于检查是否有未保存的文件
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

  // 检查是否有未保存的更改
  const hasUnsavedChanges = form.formState.isDirty || hasUnsavedFiles

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

  // // 取消关闭
  // const handleCancelClose = () => {
  //   setShowConfirmDialog(false)
  //   setPendingClose(false)
  // }

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

