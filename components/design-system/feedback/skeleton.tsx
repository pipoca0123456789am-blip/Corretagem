import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-muted rounded-md animate-pulse',
        className
      )}
      {...props}
    />
  )
}

export interface SkeletonLineProps {
  count?: number
  className?: string
}

export const SkeletonLine: React.FC<SkeletonLineProps> = ({ count = 3, className }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4 rounded',
            i === count - 1 && 'w-4/5',
            className
          )}
        />
      ))}
    </div>
  )
}

export interface SkeletonCardProps {
  count?: number
  className?: string
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 3, className }) => {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <SkeletonLine count={2} />
      </div>
    </div>
  )
}
