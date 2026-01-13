import { ChevronDown, ChevronUp } from "lucide-react"
import { TableHead } from "./ui/table"

export function SortableTableHead({
  children,
  field,
  currentSortBy,
  currentAscending,
  onSort,
}: {
  children: React.ReactNode
  field: string
  currentSortBy: string
  currentAscending: boolean
  onSort: (field: string) => void
}) {
  const isActive = currentSortBy === field
  
  // 始终显示排序图标，只改变图标类型
  const getSortIcon = () => {
    if (isActive) {
      return currentAscending ? <ChevronUp size={16} /> : <ChevronDown size={16} />
    }
    // 未激活状态显示上下排列的双向箭头（使用灰色）
    return (
      <svg width="10" height="16" viewBox="0 0 10 16" className="inline ml-1 opacity-50">
        <path d="M5 3 L8 6 L2 6 Z" fill="currentColor" />
        <path d="M5 13 L8 10 L2 10 Z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <TableHead
      className="cursor-pointer select-none text-foreground font-semibold"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <span className="text-xs">{getSortIcon()}</span>
      </div>
    </TableHead>
  )
}