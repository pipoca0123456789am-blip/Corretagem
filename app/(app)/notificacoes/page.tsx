'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Select } from '@/components/design-system/forms/select'
import { Badge } from '@/components/design-system/feedback/badge'
import {
  SupportState,
  SuccessNote,
  useSupportLoad,
} from '@/components/support/shared'
import {
  AppNotification,
  NotificationType,
  getScopedNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationTypeLabels,
  relativeTime,
} from '@/lib/phase16-data'

export default function NotificationsPage() {
  const { state, reload } = useSupportLoad()
  const [items, setItems] = useState<AppNotification[]>([])
  const [type, setType] = useState('all')
  const [success, setSuccess] = useState('')

  const refresh = () => setItems(getScopedNotifications())

  useEffect(() => {
    refresh()
  }, [state])

  const filtered = useMemo(() => {
    return items
      .filter((n) => type === 'all' || n.type === type)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [items, type])

  const unread = items.filter((n) => !n.read).length

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Painel', href: '/dashboard' }, { label: 'Notificações' }]} />
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Central de notificações</h1>
            <p className="text-sm text-muted-foreground">
              {unread} não lida{unread === 1 ? '' : 's'} · sem envio real de push/e-mail
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              markAllNotificationsRead()
              refresh()
              setSuccess('Todas marcadas como lidas.')
            }}
          >
            Marcar todas como lidas
          </Button>
        </div>

        {success ? <SuccessNote message={success} onClose={() => setSuccess('')} /> : null}

        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'all', label: 'Todos os tipos' },
            ...(Object.entries(notificationTypeLabels) as [NotificationType, string][]).map(
              ([value, label]) => ({ value, label })
            ),
          ]}
        />

        <SupportState
          state={state === 'ready' && filtered.length === 0 ? 'empty' : state}
          onRetry={reload}
          empty={{ title: 'Nenhuma notificação', description: 'Novidades da sua operação aparecerão aqui.' }}
        >
          <div className="space-y-2">
            {filtered.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`flex w-full flex-col gap-1 rounded-xl border p-4 text-left transition-colors ${
                  n.read ? 'border-border bg-card' : 'border-primary/30 bg-primary/5'
                }`}
                onClick={() => {
                  markNotificationRead(n.id)
                  refresh()
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{n.title}</p>
                  <Badge variant="secondary">{notificationTypeLabels[n.type]}</Badge>
                  {!n.read ? <Badge variant="primary">Nova</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{relativeTime(n.createdAt)}</span>
                  {n.href ? (
                    <Link
                      href={n.href}
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Abrir
                    </Link>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </SupportState>
      </div>
    </div>
  )
}
