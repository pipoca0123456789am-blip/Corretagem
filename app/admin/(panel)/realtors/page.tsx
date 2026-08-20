'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Badge } from '@/components/design-system/feedback/badge'
import { realtorsList } from '@/lib/mock-data'
import { Search, ChevronDown } from 'lucide-react'

export default function RealtorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'sales' | 'rating'>('name')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedRealtor, setSelectedRealtor] = useState<(typeof realtorsList)[0] | null>(null)

  const breadcrumbItems = [
    { label: 'Admin', href: '/admin/dashboard' },
    { label: 'Corretores', href: '/admin/realtors' },
  ]

  const filteredRealtors = useMemo(() => {
    let filtered = realtorsList.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus
      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'sales') return b.salesThisMonth - a.salesThisMonth
      if (sortBy === 'rating') return b.rating - a.rating
      return 0
    })

    return filtered
  }, [searchTerm, filterStatus, sortBy])

  return (
    <main className="min-h-screen bg-background">
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-2xl font-bold text-foreground md:text-3xl mt-4">Corretores da plataforma</h1>
          <p className="text-muted-foreground mt-2">
            Gestão global de contas — abra a ficha para ver página profissional, IA, assinatura e imóveis de cada corretor.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="name">Ordenar por Nome</option>
              <option value="sales">Ordenar por Vendas</option>
              <option value="rating">Ordenar por Avaliação</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">E-mail</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Região</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Plano</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Vendas</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Avaliação</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRealtors.map((realtor) => (
                  <tr key={realtor.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{realtor.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{realtor.email}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{realtor.region}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={realtor.plan === 'professional' ? 'primary' : 'secondary'}>{realtor.plan === 'professional' ? 'Profissional' : 'Inicial'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{realtor.salesThisMonth}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="flex items-center gap-1">
                        <span>⭐</span>
                        {realtor.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant={realtor.status === 'active' ? 'success' : 'secondary'}>{realtor.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/realtors/${realtor.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        Abrir ficha
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedRealtor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card">
                <h2 className="text-2xl font-bold text-foreground">Detalhes do Corretor</h2>
                <button
                  onClick={() => setSelectedRealtor(null)}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center text-3xl">
                    👤
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{selectedRealtor.name}</h3>
                    <p className="text-muted-foreground">{selectedRealtor.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={selectedRealtor.status === 'active' ? 'success' : 'secondary'}>{selectedRealtor.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>
                      <Badge variant={selectedRealtor.plan === 'professional' ? 'primary' : 'secondary'}>{selectedRealtor.plan === 'professional' ? 'Profissional' : 'Inicial'}</Badge>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                    <p className="text-foreground font-medium">{selectedRealtor.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Região</p>
                    <p className="text-foreground font-medium">{selectedRealtor.region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Membro Desde</p>
                    <p className="text-foreground font-medium">{selectedRealtor.joinedAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Taxa de Comissão</p>
                    <p className="text-foreground font-medium">{selectedRealtor.commissionRate}%</p>
                  </div>
                </div>

                {/* Performance */}
                <div className="border-t border-border pt-4">
                  <h4 className="font-bold text-foreground mb-4">Desempenho</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Total de Vendas</p>
                      <p className="text-xl font-bold text-foreground">{selectedRealtor.totalSales}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Vendas Este Mês</p>
                      <p className="text-xl font-bold text-foreground">{selectedRealtor.salesThisMonth}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Avaliação</p>
                      <p className="text-xl font-bold text-foreground">⭐ {selectedRealtor.rating}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <p className="text-xl font-bold text-foreground">
                        {selectedRealtor.status === 'active' ? '• Ativo' : '• Inativo'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border pt-4 flex flex-wrap gap-3">
                  <Link href={`/admin/realtors/${selectedRealtor.id}`} className="flex-1 min-w-[140px]">
                    <Button variant="primary" size="md" className="w-full">
                      Abrir ficha completa
                    </Button>
                  </Link>
                  <Button variant="outline" size="md" onClick={() => setSelectedRealtor(null)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
