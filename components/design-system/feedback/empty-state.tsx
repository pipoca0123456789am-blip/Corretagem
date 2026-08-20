import React from 'react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center',
      className
    )}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
