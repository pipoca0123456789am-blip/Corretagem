import React from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: number
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  activeId: string
  onActiveChange: (id: string) => void
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onActiveChange,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex gap-1 border-b border-border',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => !item.disabled && onActiveChange(item.id)}
          disabled={item.disabled}
          className={cn(
            'relative px-4 py-3 text-sm font-medium transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            activeId === item.id
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground',
            item.disabled && 'cursor-not-allowed'
          )}
        >
          <div className="flex items-center gap-2">
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {item.badge}
              </span>
            )}
          </div>
          {activeId === item.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  )
}
