import React from 'react'
import { cn } from '@/lib/utils'

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  description?: string
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      checked = false,
      onCheckedChange,
      label,
      description,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }

    return (
      <div className="flex items-center gap-3">
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          onClick={handleClick}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            checked ? 'bg-primary' : 'bg-muted',
            className
          )}
          {...props}
        >
          <span
            className={cn(
              'inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200',
              checked ? 'translate-x-5' : 'translate-x-0.5'
            )}
          />
        </button>
        {label && (
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground block cursor-pointer">
              {label}
            </label>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Toggle.displayName = 'Toggle'

export { Toggle }
