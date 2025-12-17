import { useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'

interface DataTablePaginationProps {
  currentPage: number
  totalPages: number // Retain to maintain interface compatibility，but will be recalculated internally
  totalItems: number
  itemsPerPage?: number
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  currentPage,
  totalItems,
  itemsPerPage = 20,
  onPageChange,
}: DataTablePaginationProps) {
  // Calculate total pages based on actual data
  const actualTotalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  // Ensure currentPage does not exceed actual pages
  const validCurrentPage = Math.min(Math.max(1, currentPage), actualTotalPages)

  // Use useRef to avoid circular calls
  const onPageChangeRef = useRef(onPageChange)
  useEffect(() => {
    onPageChangeRef.current = onPageChange
  }, [onPageChange])

  // If currentPage Invalid，Auto-correct
  useEffect(() => {
    if (currentPage !== validCurrentPage && validCurrentPage > 0) {
      onPageChangeRef.current(validCurrentPage)
    }
  }, [currentPage, validCurrentPage]) // Remove onPageChange from dependency array

  const startItem =
    totalItems > 0 ? Math.max(1, (validCurrentPage - 1) * itemsPerPage + 1) : 0
  const endItem =
    totalItems > 0 ? Math.min(validCurrentPage * itemsPerPage, totalItems) : 0

  // Ensure startItem <= endItem
  const finalStartItem = startItem <= endItem ? startItem : endItem
  const finalEndItem = startItem <= endItem ? endItem : startItem

  return (
    <div className='mt-6 flex items-center justify-between '>
      <p className='text-sm text-gray-600 flex-1'>
        {totalItems === 0
          ? 'No items to display'
          : `Viewing items ${finalStartItem}-${finalEndItem} of ${totalItems.toLocaleString()}`}
      </p>

      <PaginationRoot className='justify-end flex-1'>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(1)}
              disabled={validCurrentPage === 1}
            >
              <ChevronsLeft className='h-4 w-4' />
            </Button>
          </PaginationItem>

          <PaginationItem>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(validCurrentPage - 1)}
              disabled={validCurrentPage === 1}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
          </PaginationItem>

          <PaginationItem>
            <span className='px-4 py-2 text-sm text-gray-600'>
              Displaying page {validCurrentPage} of {actualTotalPages}
            </span>
          </PaginationItem>

          <PaginationItem>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(validCurrentPage + 1)}
              disabled={validCurrentPage >= actualTotalPages}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </PaginationItem>

          <PaginationItem>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onPageChange(actualTotalPages)}
              disabled={validCurrentPage >= actualTotalPages}
            >
              <ChevronsRight className='h-4 w-4' />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>
    </div>
  )
}
