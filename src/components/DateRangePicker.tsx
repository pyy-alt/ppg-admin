import { format } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DateRangePickerProps = {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  onClose?: () => void
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  disabled = false,
  onClose,
}: DateRangePickerProps) {
  const displayText = value?.from
    ? value.to
      ? `${format(value.from, 'MMM d, yyyy')} – ${format(value.to, 'MMM d, yyyy')}`
      : `${format(value.from, 'MMM d, yyyy')} – ?`
    : placeholder

  const hasValue = !!value?.from

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onChange(undefined)
    onClose?.()
    value = undefined

  }

  return (
    <Popover onOpenChange={(open) => !open && onClose?.()}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-[300px] justify-start text-left font-normal',
            !hasValue && 'text-muted-foreground'
          )}
        >
          <span className='flex-1 truncate'>{displayText}</span>
          {hasValue && !disabled ? (
            <span
              role='button'
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear}
              className='hover:bg-muted inline-flex items-center justify-center rounded-full p-1 transition-colors'
              aria-label='Clear date range'
            >
              <X className='h-4 w-4' />
            </span>
          ) : (
            <CalendarIcon className='h-4 w-4 opacity-50' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          disabled={(date) =>
            date > new Date() || date < new Date('1900-01-01')
          }
          defaultMonth={value?.from || new Date()}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
