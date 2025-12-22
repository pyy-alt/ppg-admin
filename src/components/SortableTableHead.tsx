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
  const direction = isActive ? (currentAscending ? <ChevronUp size={16}/> : <ChevronDown size={16} />) : ''

  return (
    <TableHead
      className="cursor-pointer select-none text-foreground font-semibold"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {isActive && <span className="text-xs">{direction}</span>}
      </div>
    </TableHead>
  )
}