'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  Plus,
  Search,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Select } from '@/components/design-system/forms/select'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Badge } from '@/components/design-system/feedback/badge'
import { Modal } from '@/components/design-system/feedback/modal'
import { Alert } from '@/components/design-system/feedback/alert'
import { EmptyState } from '@/components/design-system/feedback/empty-state'
import { Skeleton } from '@/components/design-system/feedback/skeleton'
import { Tabs } from '@/components/design-system/navigation/tabs'
import { Toggle } from '@/components/design-system/forms/toggle'
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  VisitStatus,
  appointmentStatusBadge,
  appointmentStatusLabels,
  appointmentTypeLabels,
  clientsOptions,
  filterByRealtor,
  formatDateBR,
  initialAppointments,
  propertyOptions,
  toISODate,
  visitStatusBadge,
  visitStatusLabels,
} from '@/lib/phase7-data'
import { isSuperAdmin } from '@/lib/auth'
import { realtorsList } from '@/lib/mock-data'

type ViewMode = 'month' | 'week' | 'day' | 'list'
type UiState = 'loading' | 'ready' | 'error'

const typeOptions = [
  { value: 'all', label: 'Todos os tipos' },
  ...Object.entries(appointmentTypeLabels).map(([value, label]) => ({ value, label })),
]

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  ...Object.entries(appointmentStatusLabels).map(([value, label]) => ({ value, label })),
]

const emptyForm = {
  title: '',
  type: 'visita' as AppointmentType,
  date: toISODate(new Date()),
  startTime: '10:00',
  endTime: '11:00',
  durationMinutes: 60,
  location: '',
  notes: '',
  reminder: true,
  reminderMinutes: 60,
  clientName: '',
  propertyId: '',
  propertyTitle: '',
  visitStatus: 'aguardando_confirmacao' as VisitStatus,
  confirmed: false,
  realtorId: 1,
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(d, diff)
}

function monthMatrix(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const start = startOfWeek(first)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

function typeColor(type: AppointmentType) {
  const map: Record<AppointmentType, string> = {
    visita: 'bg-primary/15 text-primary border-primary/30',
    tarefa: 'bg-secondary/15 text-secondary border-secondary/30',
    ligacao: 'bg-info/15 text-info border-info/30',
    reuniao: 'bg-status-pending/15 text-status-pending border-status-pending/30',
    follow_up: 'bg-status-available/15 text-status-available border-status-available/30',
    pessoal: 'bg-muted text-muted-foreground border-border',
    lembrete: 'bg-destructive/10 text-destructive border-destructive/30',
  }
  return map[type]
}

export default function AgendaPage() {
  const [uiState, setUiState] = useState<UiState>('loading')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [anchorDate, setAnchorDate] = useState(() => new Date(2026, 6, 28))
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [realtorFilter, setRealtorFilter] = useState('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')

  const [detail, setDetail] = useState<Appointment | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'cancel' | 'confirm' | 'complete'
    item: Appointment
  } | null>(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleStart, setRescheduleStart] = useState('')
  const [rescheduleEnd, setRescheduleEnd] = useState('')

  useEffect(() => {
    setIsAdmin(isSuperAdmin())
    const timer = setTimeout(() => {
      try {
        setAppointments(filterByRealtor(initialAppointments))
        setUiState('ready')
      } catch {
        setUiState('error')
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const filtered = useMemo(() => {
    return appointments.filter((apt) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        apt.title.toLowerCase().includes(q) ||
        apt.clientName?.toLowerCase().includes(q) ||
        apt.propertyTitle?.toLowerCase().includes(q) ||
        apt.location?.toLowerCase().includes(q)
      const matchesType = typeFilter === 'all' || apt.type === typeFilter
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
      const matchesRealtor = realtorFilter === 'all' || String(apt.realtorId) === realtorFilter
      return matchesSearch && matchesType && matchesStatus && matchesRealtor
    })
  }, [appointments, search, typeFilter, statusFilter, realtorFilter])

  const selectedDayISO = toISODate(anchorDate)
  const weekStart = startOfWeek(anchorDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const monthDays = monthMatrix(anchorDate)

  const dayAppointments = filtered
    .filter((a) => a.date === selectedDayISO)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const listAppointments = [...filtered].sort((a, b) =>
    `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)
  )

  const flash = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3500)
  }

  const openCreate = (date?: string) => {
    setEditing(null)
    setForm({
      ...emptyForm,
      date: date || selectedDayISO,
      realtorId: isAdmin ? 1 : (filterByRealtor(initialAppointments)[0]?.realtorId ?? 1),
    })
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (item: Appointment) => {
    setEditing(item)
    setForm({
      title: item.title,
      type: item.type,
      date: item.date,
      startTime: item.startTime,
      endTime: item.endTime,
      durationMinutes: item.durationMinutes,
      location: item.location || '',
      notes: item.notes || '',
      reminder: item.reminder,
      reminderMinutes: item.reminderMinutes,
      clientName: item.clientName || '',
      propertyId: item.propertyId ? String(item.propertyId) : '',
      propertyTitle: item.propertyTitle || '',
      visitStatus: item.visitStatus || 'aguardando_confirmacao',
      confirmed: item.confirmed,
      realtorId: item.realtorId,
    })
    setFormError('')
    setFormOpen(true)
    setDetail(null)
  }

  const saveAppointment = () => {
    if (!form.title.trim()) {
      setFormError('Informe o título do compromisso.')
      return
    }
    if (!form.date || !form.startTime || !form.endTime) {
      setFormError('Informe data e horários.')
      return
    }
    if (form.type === 'visita' && (!form.clientName || !form.propertyId)) {
      setFormError('Visitas exigem cliente e imóvel.')
      return
    }

    const realtor = realtorsList.find((r) => r.id === form.realtorId) || realtorsList[0]
    const propertyTitle =
      propertyOptions.find((p) => p.value === form.propertyId)?.label || form.propertyTitle

    const payload: Appointment = {
      id: editing?.id || `apt-${Date.now()}`,
      title: form.title,
      type: form.type,
      status: form.confirmed ? 'confirmado' : editing?.status || 'agendado',
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      durationMinutes: form.durationMinutes,
      location: form.location,
      notes: form.notes,
      reminder: form.reminder,
      reminderMinutes: form.reminderMinutes,
      clientName: form.clientName || undefined,
      propertyTitle: propertyTitle || undefined,
      propertyId: form.propertyId ? Number(form.propertyId) : undefined,
      realtorId: realtor.id,
      realtorName: realtor.name,
      visitStatus: form.type === 'visita' ? form.visitStatus : undefined,
      confirmed: form.confirmed,
      createdAt: editing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setAppointments((prev) => {
      if (editing) return prev.map((a) => (a.id === editing.id ? payload : a))
      return [payload, ...prev]
    })
    setFormOpen(false)
    flash(editing ? 'Compromisso atualizado com sucesso.' : 'Compromisso cadastrado com sucesso.')
  }

  const applyStatus = (item: Appointment, status: AppointmentStatus, visitStatus?: VisitStatus) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === item.id
          ? {
              ...a,
              status,
              visitStatus: visitStatus ?? a.visitStatus,
              confirmed: status === 'confirmado' || status === 'concluido' ? true : a.confirmed,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    )
  }

  const handleConfirmAction = () => {
    if (!confirmAction) return
    const { type, item } = confirmAction
    if (type === 'cancel') {
      applyStatus(item, 'cancelado', item.type === 'visita' ? 'cancelada' : undefined)
      flash('Compromisso cancelado.')
    }
    if (type === 'confirm') {
      applyStatus(item, 'confirmado', item.type === 'visita' ? 'confirmada' : undefined)
      flash('Compromisso confirmado.')
    }
    if (type === 'complete') {
      applyStatus(item, 'concluido', item.type === 'visita' ? 'realizada' : undefined)
      flash('Compromisso marcado como concluído.')
    }
    setConfirmAction(null)
    setDetail(null)
  }

  const openReschedule = (item: Appointment) => {
    setDetail(item)
    setRescheduleDate(item.date)
    setRescheduleStart(item.startTime)
    setRescheduleEnd(item.endTime)
    setRescheduleOpen(true)
  }

  const saveReschedule = () => {
    if (!detail) return
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === detail.id
          ? {
              ...a,
              date: rescheduleDate,
              startTime: rescheduleStart,
              endTime: rescheduleEnd,
              status: 'reagendado',
              visitStatus: a.type === 'visita' ? 'reagendada' : a.visitStatus,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    )
    setRescheduleOpen(false)
    setDetail(null)
    flash('Compromisso reagendado com sucesso.')
  }

  const monthLabel = anchorDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const renderAppointmentCard = (apt: Appointment, compact = false) => (
    <button
      key={apt.id}
      type="button"
      onClick={() => setDetail(apt)}
      className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted/40 ${typeColor(apt.type)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-medium truncate ${compact ? 'text-xs' : 'text-sm'}`}>{apt.title}</p>
          <p className={`opacity-80 ${compact ? 'text-[10px]' : 'text-xs'} mt-1`}>
            {apt.startTime} – {apt.endTime}
            {apt.clientName ? ` · ${apt.clientName}` : ''}
          </p>
        </div>
        {!compact && (
          <Badge variant={appointmentStatusBadge(apt.status)}>
            {appointmentStatusLabels[apt.status]}
          </Badge>
        )}
      </div>
    </button>
  )

  if (uiState === 'loading') {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (uiState === 'error') {
    return (
      <div className="p-4 md:p-6">
        <Alert
          variant="destructive"
          title="Erro ao carregar agenda"
          description="Não foi possível carregar os compromissos. Tente novamente."
        />
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Recarregar
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Agenda' }]} />

      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {isAdmin
                ? 'Visão global de compromissos, visitas e tarefas'
                : 'Sua agenda de visitas, tarefas, ligações e follow-ups'}
            </p>
          </div>
          <Button variant="primary" className="gap-2 w-full sm:w-auto" onClick={() => openCreate()}>
            <Plus className="w-4 h-4" />
            Novo compromisso
          </Button>
        </div>

        {successMsg && (
          <Alert variant="success" title="Sucesso" description={successMsg} onClose={() => setSuccessMsg('')} />
        )}
        {errorMsg && (
          <Alert variant="destructive" title="Erro" description={errorMsg} onClose={() => setErrorMsg('')} />
        )}

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, cliente, imóvel ou local..."
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              label="Tipo"
              options={typeOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
            <Select
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
            {isAdmin && (
              <Select
                label="Corretor"
                options={[
                  { value: 'all', label: 'Todos os corretores' },
                  ...realtorsList.map((r) => ({ value: String(r.id), label: r.name })),
                ]}
                value={realtorFilter}
                onChange={(e) => setRealtorFilter(e.target.value)}
              />
            )}
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch('')
                  setTypeFilter('all')
                  setStatusFilter('all')
                  setRealtorFilter('all')
                }}
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            items={[
              { id: 'month', label: 'Mês', icon: <CalendarIcon className="w-4 h-4" /> },
              { id: 'week', label: 'Semana', icon: <CalendarDays className="w-4 h-4" /> },
              { id: 'day', label: 'Dia', icon: <Clock3 className="w-4 h-4" /> },
              { id: 'list', label: 'Lista', icon: <List className="w-4 h-4" /> },
            ]}
            activeId={viewMode}
            onActiveChange={(id) => setViewMode(id as ViewMode)}
            className="overflow-x-auto"
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setAnchorDate((d) => {
                  if (viewMode === 'month') {
                    return new Date(d.getFullYear(), d.getMonth() - 1, 1)
                  }
                  return addDays(d, viewMode === 'week' ? -7 : -1)
                })
              }
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="tertiary" size="sm" onClick={() => setAnchorDate(new Date(2026, 6, 28))}>
              Hoje
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setAnchorDate((d) => {
                  if (viewMode === 'month') {
                    return new Date(d.getFullYear(), d.getMonth() + 1, 1)
                  }
                  return addDays(d, viewMode === 'week' ? 7 : 1)
                })
              }
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-foreground capitalize ml-1 min-w-[140px]">
              {viewMode === 'month' && monthLabel}
              {viewMode === 'week' &&
                `${formatDateBR(toISODate(weekDays[0]))} – ${formatDateBR(toISODate(weekDays[6]))}`}
              {viewMode === 'day' && formatDateBR(selectedDayISO)}
              {viewMode === 'list' && `${filtered.length} compromisso(s)`}
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="w-8 h-8" />}
            title="Nenhum compromisso encontrado"
            description="Ajuste os filtros ou cadastre um novo compromisso na agenda."
            action={{ label: 'Novo compromisso', onClick: () => openCreate() }}
          />
        ) : (
          <>
            {viewMode === 'month' && (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-7 border-b border-border bg-muted/40">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                    <div key={d} className="px-2 py-3 text-center text-xs font-semibold text-muted-foreground">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {monthDays.map((day) => {
                    const iso = toISODate(day)
                    const inMonth = day.getMonth() === anchorDate.getMonth()
                    const items = filtered.filter((a) => a.date === iso)
                    const isSelected = iso === selectedDayISO
                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => {
                          setAnchorDate(day)
                          setViewMode('day')
                        }}
                        onDoubleClick={() => openCreate(iso)}
                        className={`min-h-[88px] md:min-h-[110px] border-r border-b border-border p-1.5 text-left align-top transition-colors hover:bg-muted/30 ${
                          !inMonth ? 'bg-muted/20 text-muted-foreground' : ''
                        } ${isSelected ? 'ring-2 ring-inset ring-primary/40' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : ''}`}>
                            {day.getDate()}
                          </span>
                          {items.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">{items.length}</span>
                          )}
                        </div>
                        <div className="space-y-1 hidden sm:block">
                          {items.slice(0, 2).map((apt) => (
                            <div
                              key={apt.id}
                              className={`rounded px-1 py-0.5 text-[10px] truncate border ${typeColor(apt.type)}`}
                            >
                              {apt.startTime} {appointmentTypeLabels[apt.type]}
                            </div>
                          ))}
                          {items.length > 2 && (
                            <p className="text-[10px] text-muted-foreground">+{items.length - 2}</p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {viewMode === 'week' && (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekDays.map((day) => {
                  const iso = toISODate(day)
                  const items = filtered
                    .filter((a) => a.date === iso)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  return (
                    <div key={iso} className="bg-card border border-border rounded-lg p-3 min-h-[220px]">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                          </p>
                          <p className="font-semibold text-foreground">{day.getDate()}</p>
                        </div>
                        <Button variant="tertiary" size="sm" onClick={() => openCreate(iso)}>
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {items.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Sem compromissos</p>
                        ) : (
                          items.map((apt) => renderAppointmentCard(apt, true))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {viewMode === 'day' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-foreground">
                      Compromissos de {formatDateBR(selectedDayISO)}
                    </h2>
                    <Button size="sm" onClick={() => openCreate(selectedDayISO)}>
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </Button>
                  </div>
                  {dayAppointments.length === 0 ? (
                    <EmptyState
                      title="Dia livre"
                      description="Não há compromissos neste dia."
                      action={{ label: 'Agendar', onClick: () => openCreate(selectedDayISO) }}
                    />
                  ) : (
                    dayAppointments.map((apt) => renderAppointmentCard(apt))
                  )}
                </div>
                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-foreground">Resumo do dia</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">{dayAppointments.length}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Visitas</span>
                      <span className="font-medium">
                        {dayAppointments.filter((a) => a.type === 'visita').length}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Com lembrete</span>
                      <span className="font-medium">
                        {dayAppointments.filter((a) => a.reminder).length}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Pendentes de confirmação</span>
                      <span className="font-medium">
                        {dayAppointments.filter((a) => !a.confirmed && a.status !== 'cancelado').length}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
                {listAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between hover:bg-muted/20"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground truncate">{apt.title}</p>
                        <Badge variant="default">{appointmentTypeLabels[apt.type]}</Badge>
                        <Badge variant={appointmentStatusBadge(apt.status)}>
                          {appointmentStatusLabels[apt.status]}
                        </Badge>
                        {apt.visitStatus && (
                          <Badge variant={visitStatusBadge(apt.visitStatus)}>
                            {visitStatusLabels[apt.visitStatus]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDateBR(apt.date)} · {apt.startTime}–{apt.endTime}
                        {apt.clientName ? ` · ${apt.clientName}` : ''}
                        {isAdmin ? ` · ${apt.realtorName}` : ''}
                      </p>
                      {apt.location && (
                        <p className="text-xs text-muted-foreground">{apt.location}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setDetail(apt)}>
                        Detalhes
                      </Button>
                      <Button size="sm" variant="tertiary" onClick={() => openEdit(apt)}>
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      <Modal
        isOpen={!!detail && !rescheduleOpen}
        onClose={() => setDetail(null)}
        title={detail?.title}
        description="Detalhes do compromisso"
        size="lg"
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        footer={
          detail && (
            <>
              <Button variant="tertiary" onClick={() => setDetail(null)}>
                Fechar
              </Button>
              <Button variant="outline" onClick={() => openEdit(detail)}>
                Editar
              </Button>
              <Button variant="outline" onClick={() => openReschedule(detail)}>
                Reagendar
              </Button>
              {!detail.confirmed && detail.status !== 'cancelado' && (
                <Button
                  variant="secondary"
                  onClick={() => setConfirmAction({ type: 'confirm', item: detail })}
                >
                  Confirmar
                </Button>
              )}
              {detail.status !== 'concluido' && detail.status !== 'cancelado' && (
                <Button
                  variant="primary"
                  onClick={() => setConfirmAction({ type: 'complete', item: detail })}
                >
                  Concluir
                </Button>
              )}
              {detail.status !== 'cancelado' && (
                <Button
                  variant="danger"
                  onClick={() => setConfirmAction({ type: 'cancel', item: detail })}
                >
                  Cancelar
                </Button>
              )}
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{appointmentTypeLabels[detail.type]}</Badge>
              <Badge variant={appointmentStatusBadge(detail.status)}>
                {appointmentStatusLabels[detail.status]}
              </Badge>
              {detail.visitStatus && (
                <Badge variant={visitStatusBadge(detail.visitStatus)}>
                  {visitStatusLabels[detail.visitStatus]}
                </Badge>
              )}
              {detail.reminder && <Badge variant="info">Lembrete: {detail.reminderMinutes} min</Badge>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <p><span className="text-muted-foreground">Data:</span> {formatDateBR(detail.date)}</p>
              <p><span className="text-muted-foreground">Horário:</span> {detail.startTime} – {detail.endTime}</p>
              <p><span className="text-muted-foreground">Duração:</span> {detail.durationMinutes} min</p>
              <p><span className="text-muted-foreground">Corretor:</span> {detail.realtorName}</p>
              {detail.clientName && (
                <p><span className="text-muted-foreground">Cliente:</span> {detail.clientName}</p>
              )}
              {detail.propertyTitle && (
                <p><span className="text-muted-foreground">Imóvel:</span> {detail.propertyTitle}</p>
              )}
              {detail.location && (
                <p className="sm:col-span-2"><span className="text-muted-foreground">Local:</span> {detail.location}</p>
              )}
            </div>
            {detail.notes && (
              <div>
                <p className="text-muted-foreground mb-1">Observações</p>
                <p className="text-foreground">{detail.notes}</p>
              </div>
            )}
            {detail.type === 'visita' && (
              <Select
                label="Atualizar status da visita"
                options={Object.entries(visitStatusLabels).map(([value, label]) => ({ value, label }))}
                value={detail.visitStatus || 'aguardando_confirmacao'}
                onChange={(e) => {
                  const visitStatus = e.target.value as VisitStatus
                  setAppointments((prev) =>
                    prev.map((a) =>
                      a.id === detail.id
                        ? { ...a, visitStatus, updatedAt: new Date().toISOString() }
                        : a
                    )
                  )
                  setDetail({ ...detail, visitStatus })
                  flash('Status da visita atualizado.')
                }}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Create/Edit modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar compromisso' : 'Novo compromisso'}
        description="Preencha os dados do agendamento"
        size="lg"
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setFormOpen(false)}>
              Voltar
            </Button>
            <Button variant="primary" onClick={saveAppointment}>
              {editing ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && <Alert variant="destructive" description={formError} />}
          <Input
            label="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ex.: Visita — Apartamento Vila Mariana"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tipo"
              options={Object.entries(appointmentTypeLabels).map(([value, label]) => ({
                value,
                label,
              }))}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as AppointmentType })}
            />
            {isAdmin && (
              <Select
                label="Corretor"
                options={realtorsList.map((r) => ({ value: String(r.id), label: r.name }))}
                value={String(form.realtorId)}
                onChange={(e) => setForm({ ...form, realtorId: Number(e.target.value) })}
              />
            )}
            <Input
              label="Data"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <Input
              label="Duração (minutos)"
              type="number"
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) || 0 })}
            />
            <Input
              label="Horário início"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              label="Horário fim"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>

          {(form.type === 'visita' || form.type === 'follow_up' || form.type === 'ligacao') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Cliente"
                placeholder="Selecione o cliente"
                options={clientsOptions}
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              />
              <Select
                label="Imóvel"
                placeholder="Selecione o imóvel"
                options={propertyOptions}
                value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
              />
            </div>
          )}

          {form.type === 'visita' && (
            <>
              <Input
                label="Local de encontro"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex.: Portaria do condomínio"
              />
              <Select
                label="Status da visita"
                options={Object.entries(visitStatusLabels).map(([value, label]) => ({
                  value,
                  label,
                }))}
                value={form.visitStatus}
                onChange={(e) =>
                  setForm({ ...form, visitStatus: e.target.value as VisitStatus })
                }
              />
            </>
          )}

          {form.type !== 'visita' && (
            <Input
              label="Local"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Opcional"
            />
          )}

          <Textarea
            label="Observações"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Detalhes importantes do compromisso"
          />

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div>
              <p className="font-medium text-foreground text-sm">Lembrete</p>
              <p className="text-xs text-muted-foreground">Simulado — sem envio real de notificação</p>
            </div>
            <Toggle
              checked={form.reminder}
              onCheckedChange={(checked) => setForm({ ...form, reminder: checked })}
            />
          </div>

          {form.reminder && (
            <Select
              label="Antecedência do lembrete"
              options={[
                { value: '0', label: 'No horário' },
                { value: '15', label: '15 minutos antes' },
                { value: '30', label: '30 minutos antes' },
                { value: '60', label: '1 hora antes' },
                { value: '120', label: '2 horas antes' },
              ]}
              value={String(form.reminderMinutes)}
              onChange={(e) => setForm({ ...form, reminderMinutes: Number(e.target.value) })}
            />
          )}

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <div>
              <p className="font-medium text-foreground text-sm">Confirmado</p>
              <p className="text-xs text-muted-foreground">Marque se o compromisso já foi confirmado</p>
            </div>
            <Toggle
              checked={form.confirmed}
              onCheckedChange={(checked) => setForm({ ...form, confirmed: checked })}
            />
          </div>
        </div>
      </Modal>

      {/* Reschedule modal */}
      <Modal
        isOpen={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        title="Reagendar compromisso"
        description="Escolha a nova data e horário"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setRescheduleOpen(false)}>
              Voltar
            </Button>
            <Button variant="primary" onClick={saveReschedule}>
              Confirmar reagendamento
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nova data"
            type="date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Início"
              type="time"
              value={rescheduleStart}
              onChange={(e) => setRescheduleStart(e.target.value)}
            />
            <Input
              label="Fim"
              type="time"
              value={rescheduleEnd}
              onChange={(e) => setRescheduleEnd(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Confirm action modal */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.type === 'cancel'
            ? 'Cancelar compromisso'
            : confirmAction?.type === 'confirm'
              ? 'Confirmar compromisso'
              : 'Concluir compromisso'
        }
        description={
          confirmAction?.type === 'cancel'
            ? 'Esta ação marcará o compromisso como cancelado.'
            : confirmAction?.type === 'confirm'
              ? 'O compromisso será marcado como confirmado.'
              : 'O compromisso será marcado como concluído/realizado.'
        }
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirmAction(null)}>
              Voltar
            </Button>
            <Button
              variant={confirmAction?.type === 'cancel' ? 'danger' : 'primary'}
              leftIcon={confirmAction?.type !== 'cancel' ? <CheckCircle2 className="w-4 h-4" /> : undefined}
              onClick={handleConfirmAction}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          {confirmAction?.item.title} — {confirmAction ? formatDateBR(confirmAction.item.date) : ''} às{' '}
          {confirmAction?.item.startTime}
        </p>
      </Modal>
    </div>
  )
}
