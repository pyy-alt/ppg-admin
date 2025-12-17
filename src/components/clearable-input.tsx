import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import * as React from 'react'

interface ClearableInputProps
  extends React.ComponentProps<typeof Input> {
  // Optional：Only allow clearing type=text when
}

export function ClearableInput({
  value,
  onChange,
  className,
  ...props
}: ClearableInputProps) {
  const handleClear = () => {
    if (!onChange) return
    // Simulate a null value event to external
    const event = {
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>
    onChange(event)
  }

  const hasValue = typeof value === 'string' && value.length > 0

  return (
    <div className='relative flex-1'>
      <Input
        {...props}
        value={value}
        onChange={onChange}
        className={`${className ?? ''} pr-8`}
      />
      {hasValue && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='absolute top-1/2 right-1 h-5 w-5 -translate-y-1/2 rounded-full hover:bg-muted'
          onClick={handleClear}
        >
          <X className='h-3 w-3 text-muted-foreground' />
        </Button>
      )}
    </div>
  )
}