import React from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  description?: string
  error?: string
  onCheckedChange?: (checked: boolean) => void
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      error,
      onCheckedChange,
      onChange,
      ...props
    },
    ref
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event)
      onCheckedChange?.(event.target.checked)
    }

    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-6">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'w-5 h-5 rounded border-2 border-input bg-background text-primary accent-primary cursor-pointer transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-destructive',
              className
            )}
            {...props}
            onChange={handleChange}
          />
        </div>
        {label && (
          <div className="flex-1 pt-0.5">
            <label className="text-sm font-medium text-foreground cursor-pointer block">
              {label}
            </label>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
            {error && (
              <p className="text-xs text-destructive mt-1">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
