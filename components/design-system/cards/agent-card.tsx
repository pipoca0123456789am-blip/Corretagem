import React from 'react'
import { cn } from '@/lib/utils'
import { Mail, Phone } from 'lucide-react'

export interface AgentCardProps {
  name: string
  title: string
  avatar?: string
  email?: string
  phone?: string
  badge?: string
  propertiesCount?: number
  salesCount?: number
  rating?: number
  className?: string
  onClick?: () => void
}

export const AgentCard: React.FC<AgentCardProps> = ({
  name,
  title,
  avatar,
  email,
  phone,
  badge,
  propertiesCount,
  salesCount,
  rating,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border border-border bg-card p-6 text-center transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:border-primary/50',
        className
      )}
    >
      {/* Avatar */}
      {avatar && (
        <img
          src={avatar}
          alt={name}
          className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
        />
      )}

      {/* Name and Title */}
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {name}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {title}
      </p>

      {/* Badge */}
      {badge && (
        <div className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary mb-4">
          {badge}
        </div>
      )}

      {/* Stats */}
      {(propertiesCount !== undefined || salesCount !== undefined || rating !== undefined) && (
        <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-border">
          {propertiesCount !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Propriedades</p>
              <p className="text-lg font-bold text-foreground">{propertiesCount}</p>
            </div>
          )}
          {salesCount !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Vendas</p>
              <p className="text-lg font-bold text-foreground">{salesCount}</p>
            </div>
          )}
          {rating !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground">Avaliação</p>
              <p className="text-lg font-bold text-status-available">{rating.toFixed(1)}</p>
            </div>
          )}
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2">
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            <Mail className="w-4 h-4" />
            {email}
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="w-4 h-4" />
            {phone}
          </a>
        )}
      </div>
    </div>
  )
}
