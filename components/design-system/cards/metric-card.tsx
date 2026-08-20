import React from 'react'
import { cn } from '@/lib/utils'

export interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  className?: string
  onClick?: () => void
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  trend,
  description,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border border-border bg-card p-6 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-primary/50',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-primary opacity-80 ml-4">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-status-available' : 'text-destructive'
            )}
          >
            {trend.isPositive ? '+' : '-'}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground">
            vs período anterior
          </span>
        </div>
      )}
    </div>
  )
}
