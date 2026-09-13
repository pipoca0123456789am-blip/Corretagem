'use client'

import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { AgentCard } from '@/components/design-system/cards/agent-card'
import { Plus } from 'lucide-react'

export default function AgentsPage() {
  const agents = [
    {
      id: 1,
      name: 'João Silva',
      title: 'Corretor',
      email: 'joao@imovel.hub',
      phone: '(11) 99999-1111',
      rating: 4.8,
      reviews: 245,
      avatar: 'JS',
    },
    {
      id: 2,
      name: 'Maria Santos',
      title: 'Corretora',
      email: 'maria@imovel.hub',
      phone: '(11) 99999-2222',
      rating: 4.9,
      reviews: 312,
      avatar: 'MS',
    },
    {
      id: 3,
      name: 'Carlos Oliveira',
      title: 'Corretor',
      email: 'carlos@imovel.hub',
      phone: '(11) 99999-3333',
      rating: 4.7,
      reviews: 198,
      avatar: 'CO',
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Agentes' }]} />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agentes</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie sua equipe de agentes
            </p>
          </div>
          <Button variant="primary" className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Agente
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} {...agent} />
          ))}
        </div>
      </div>
    </div>
  )
}
