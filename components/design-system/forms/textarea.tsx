import React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  showCharCount?: boolean
  containerClassName?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      showCharCount = false,
      containerClassName,
      disabled,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className={cn('w-full', containerClassName)}>
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className="block text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          {showCharCount && maxLength && (
            <span className="text-xs text-muted-foreground">
              {charCount} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full px-3 py-2 rounded-md border-2 border-input bg-background text-foreground placeholder:text-muted-foreground transition-colors duration-200 resize-vertical min-h-24',
            'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
            className
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea'

export { Textarea }
