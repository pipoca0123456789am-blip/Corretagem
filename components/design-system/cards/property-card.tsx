import React from 'react'
import { cn } from '@/lib/utils'

export type PropertyStatus = 'available' | 'sold' | 'rented' | 'pending'

export interface PropertyCardProps {
  image?: string
  title: string
  location: string
  price: number
  status: PropertyStatus
  bedrooms?: number
  bathrooms?: number
  area?: number
  agent?: {
    name: string
    avatar?: string
  }
  className?: string
  onClick?: () => void
}

const statusConfig: Record<PropertyStatus, { label: string; className: string }> = {
  available: { label: 'Disponível', className: 'bg-status-available/10 text-status-available' },
  sold: { label: 'Vendido', className: 'bg-status-sold/10 text-status-sold' },
  rented: { label: 'Alugado', className: 'bg-status-rented/10 text-status-rented' },
  pending: { label: 'Pendente', className: 'bg-status-pending/10 text-status-pending' },
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  image,
  title,
  location,
  price,
  status,
  bedrooms,
  bathrooms,
  area,
  agent,
  className,
  onClick,
}) => {
  const config = statusConfig[status]

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg overflow-hidden border border-border bg-card transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg hover:border-primary/50',
        className
      )}
    >
      {/* Image */}
      {image && (
        <div className="relative h-48 bg-muted overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className={cn('absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold', config.className)}>
            {config.label}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          {location}
        </p>

        {/* Features Grid */}
        {(bedrooms || bathrooms || area) && (
          <div className="flex gap-4 mb-4 pb-4 border-b border-border">
            {bedrooms !== undefined && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Quartos</p>
                <p className="font-semibold text-foreground">{bedrooms}</p>
              </div>
            )}
            {bathrooms !== undefined && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Banheiros</p>
                <p className="font-semibold text-foreground">{bathrooms}</p>
              </div>
            )}
            {area !== undefined && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Área (m²)</p>
                <p className="font-semibold text-foreground">{area}</p>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Preço</p>
          <p className="text-2xl font-bold text-primary">
            R$ {price.toLocaleString('pt-BR')}
          </p>
        </div>

        {/* Agent */}
        {agent && (
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            {agent.avatar && (
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <p className="text-xs font-medium text-foreground">
                {agent.name}
              </p>
              <p className="text-xs text-muted-foreground">Corretor</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
