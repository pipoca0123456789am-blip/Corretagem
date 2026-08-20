import React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variants: Record<string, string> = {
  default: 'bg-primary',
  success: 'bg-status-available',
  warning: 'bg-status-pending',
  destructive: 'bg-destructive',
}

const sizes: Record<string, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <p className="text-sm font-medium text-foreground">
              {label}
            </p>
          )}
          {showPercentage && (
            <p className="text-sm font-medium text-muted-foreground">
              {Math.round(percentage)}%
            </p>
          )}
        </div>
      )}
      <div className={cn(
        'w-full bg-muted rounded-full overflow-hidden',
        sizes[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            variants[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
