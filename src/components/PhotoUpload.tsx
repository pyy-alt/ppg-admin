// src/components/PhotoUpload.tsx
import { useCallback, useState } from 'react'
import { Image, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from './ui/button'

interface PhotoUploadProps {
  onUpload?: (files: File[]) => void
}

export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // 累积文件，而不是替换（最多 maxFiles 个）
      setFiles((prevFiles) => {
        const newFiles = [...prevFiles, ...acceptedFiles]
        // 只保留最新的 maxFiles 个文件
        return newFiles.slice(0, 2)
      })
      onUpload?.(acceptedFiles)
    },
    [onUpload]
  )
  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: true,
    maxFiles: 2,
  })

  return (
    <Card className='p-6'>
      <h3 className='mb-4 text-lg font-semibold'>Pre-Repair Photos</h3>

      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <input {...getInputProps({ multiple: true })} />

        <div className='flex flex-col items-center gap-3'>
          <div className='rounded-full bg-gray-100 p-3'>
            <Image className='h-8 w-8 text-gray-600' />
          </div>

          <p className='text-lg font-medium text-gray-700'>
            Drop your photos here or{' '}
            <span className='text-blue-600 underline'>click to browse</span>
          </p>
        </div>
      </div>
      {/* 展示出上传的文件 */}
      <div className='mt-2 flex flex-col flex-wrap gap-2'>
        {files.map((file, index) => (
          <div key={index}>
            {/* <img src={URL.createObjectURL(file)} alt={file.name} /> */}
            <div className='flex flex-row'>
              <p>
                <span>{index + 1}</span>
                {file.name}
              </p>
              <Button
                variant='ghost'
                size='icon'
                className='ml-1'
                onClick={() => handleRemoveFile(index)}
              >
                <X className='h-4 w-4 text-red-500' />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
