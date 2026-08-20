import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  maxVisible?: number
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  maxVisible = 5,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisible / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisible)
    } else if (currentPage > totalPages - halfVisible) {
      startPage = Math.max(1, totalPages - maxVisible + 1)
    }

    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) pages.push('...')
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'p-2 rounded-md border border-input transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          currentPage === 1
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-muted hover:border-primary'
        )}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-2 text-muted-foreground"
            >
              …
            </span>
          )
        }

        const isActive = page === currentPage
        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              'min-w-10 h-10 rounded-md border border-input transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isActive
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:bg-muted hover:border-primary'
            )}
          >
            {page}
          </button>
        )
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'p-2 rounded-md border border-input transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          currentPage === totalPages
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-muted hover:border-primary'
        )}
        aria-label="Próxima página"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
