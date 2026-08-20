import React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export type AlertVariant = 'success' | 'warning' | 'destructive' | 'info'

export interface AlertProps {
  variant?: AlertVariant
  title?: string
  description: string
  icon?: React.ReactNode
  onClose?: () => void
  className?: string
}

const variantConfig: Record<AlertVariant, { bg: string; text: string; border: string }> = {
  success: { bg: 'bg-status-available/10', text: 'text-status-available', border: 'border-status-available/30' },
  warning: { bg: 'bg-status-pending/10', text: 'text-status-pending', border: 'border-status-pending/30' },
  destructive: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
  info: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30' },
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  description,
  icon,
  onClose,
  className,
}) => {
  const config = variantConfig[variant]

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-4 flex items-start gap-4',
        config.bg,
        config.border,
        className
      )}
    >
      {icon && (
        <div className={cn('flex-shrink-0 mt-0.5', config.text)}>
          {icon}
        </div>
      )}

      <div className="flex-1">
        {title && (
          <h4 className={cn('font-semibold mb-1', config.text)}>
            {title}
          </h4>
        )}
        <p className={cn('text-sm', config.text)}>
          {description}
        </p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className={cn('flex-shrink-0 mt-0.5 hover:opacity-80 transition-opacity', config.text)}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
