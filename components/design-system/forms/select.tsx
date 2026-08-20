import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  options: SelectOption[]
  placeholder?: string
  error?: string
  hint?: string
  containerClassName?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      options,
      placeholder,
      error,
      hint,
      containerClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-10 px-3 pr-10 rounded-md border-2 border-input bg-background text-foreground appearance-none cursor-pointer transition-colors duration-200',
              'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && (
          <p className="text-sm text-destructive mt-1.5">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-muted-foreground mt-1.5">{hint}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
