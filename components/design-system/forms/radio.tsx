import React from 'react'
import { cn } from '@/lib/utils'

export interface RadioOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  name: string
  options: RadioOption[]
  value?: string | number
  onChange?: (value: string | number) => void
  label?: string
  error?: string
  orientation?: 'vertical' | 'horizontal'
}

export const RadioGroup = React.forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      name,
      options,
      value,
      onChange,
      label,
      error,
      orientation = 'vertical',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <fieldset
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        {label && (
          <legend className="block text-sm font-medium text-foreground mb-3">
            {label}
          </legend>
        )}
        <div className={cn(
          'space-y-2',
          orientation === 'horizontal' && 'flex flex-wrap gap-4'
        )}>
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                className={cn(
                  'w-5 h-5 rounded-full border-2 border-input bg-background cursor-pointer accent-primary transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  error && 'border-destructive'
                )}
              />
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-medium text-foreground">
                  {option.label}
                </p>
                {option.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
        {error && (
          <p className="text-sm text-destructive mt-2">
            {error}
          </p>
        )}
      </fieldset>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

export { RadioGroup }
