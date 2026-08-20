import React from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav
      className={cn('flex items-center gap-1', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            {item.href || item.onClick ? (
              <button
                onClick={item.onClick}
                className="text-sm text-primary hover:underline transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span
                className={cn(
                  'text-sm',
                  item.active
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
