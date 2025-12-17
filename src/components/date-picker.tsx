import { format } from 'date-fns'
import { Calendar as CalendarIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Pick a date',
  disabled = true,
}: DatePickerProps) {
  // Remove showClearButton State and useEffect，direct dependencies selected State

  const handleClear = (e: React.MouseEvent) => {
    // 🚨 Prevent event bubbling to PopoverTrigger
    e.stopPropagation()
    onSelect(undefined) // Clear date
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!selected}
          className={cn(
            'data-[empty=true]:text-muted-foreground w-[240px] justify-start bg-gray-100 pr-2 text-start font-normal', // Adjust pr-2 Leave space for clear button
            selected && 'pl-3' // When there is a date，Left side padding Adjust
          )}
        >
          {/* 1. Date or placeholder display */}
          <span className='flex-1 text-left'>
            {selected ? (
              format(selected, 'MMM d, yyyy')
            ) : (
              <span className='opacity-50'>{placeholder}</span>
            )}
          </span>

          {/* 2. CalendarIcon and ClearButton Mutually exclusive display on the far right */}
          {selected && !disabled ? (
            <span
              role='button'
              tabIndex={0}
              className='ms-auto flex h-6 w-6 cursor-pointer items-center justify-center opacity-50 hover:opacity-100' // Simulate button style
              onClick={handleClear} // Call with stopPropagation the handler function
            >
              <XIcon className='h-4 w-4' />
            </span>
          ) : (
            // 🚨 When there is no date，Display CalendarIcon
            <CalendarIcon className='h-4 w-4 opacity-50' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          className='bg-gray-100'
          mode='single'
          captionLayout='dropdown'
          selected={selected}
          onSelect={onSelect}
          disabled={(date: Date) =>
            date > new Date() || date < new Date('1900-01-01') || disabled
          }
        />
      </PopoverContent>
    </Popover>
  )
}
