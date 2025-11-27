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
  // 移除 showClearButton 状态和 useEffect，直接依赖 selected 状态

  const handleClear = (e: React.MouseEvent) => {
    // 🚨 阻止事件冒泡到 PopoverTrigger
    e.stopPropagation()
    onSelect(undefined) // 清除日期
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!selected}
          className={cn(
            'data-[empty=true]:text-muted-foreground w-[240px] justify-start bg-gray-100 pr-2 text-start font-normal', // 调整 pr-2 留出清除按钮空间
            selected && 'pl-3' // 有日期时，左侧 padding 调整
          )}
        >
          {/* 1. 日期或占位符显示 */}
          <span className='flex-1 text-left'>
            {selected ? (
              format(selected, 'MMM d, yyyy')
            ) : (
              <span className='opacity-50'>{placeholder}</span>
            )}
          </span>

          {/* 2. CalendarIcon 和 ClearButton 互斥显示在最右边 */}
          {selected && !disabled  ? (
            <span
              role='button'
              tabIndex={0}
              className='ms-auto flex h-6 w-6 cursor-pointer items-center justify-center opacity-50 hover:opacity-100' // 模拟按钮样式
              onClick={handleClear} // 调用带 stopPropagation 的处理函数
            >
              <XIcon className='h-4 w-4' />
            </span>
          ) : (
             (
              // 🚨 当没有日期时，显示 CalendarIcon
              <CalendarIcon className='h-4 w-4 opacity-50' />
            )
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
