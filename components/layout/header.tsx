'use client'

import { Bell, Search, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAppSession, logoutApp } from '@/lib/auth'
import {
  getScopedNotifications,
  markNotificationRead,
  relativeTime,
  unreadNotificationCount,
} from '@/lib/phase16-data'

export function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => [] as ReturnType<typeof getScopedNotifications>)
  const [unread, setUnread] = useState(0)
  const [name, setName] = useState('Corretor')
  const [email, setEmail] = useState('')
  const [initials, setInitials] = useState('CD')

  const refresh = () => {
    const list = getScopedNotifications()
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 6)
    setNotifications(list)
    setUnread(unreadNotificationCount())
  }

  useEffect(() => {
    const s = getAppSession()
    const n = s?.name || 'Corretor Demonstração'
    const e = s?.email || ''
    setName(n)
    setEmail(e)
    setInitials(n.slice(0, 2).toUpperCase())
    refresh()
  }, [])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="w-10 md:hidden" />

        <div className="mx-4 flex max-w-xl flex-1 items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Painel do Corretor</p>
            <p className="text-[11px] text-muted-foreground">Sua carteira · dados isolados</p>
          </div>
          <div className="relative hidden flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar imóveis, clientes, leads..."
              className="w-full rounded-lg bg-muted py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen)
                setProfileOpen(false)
                refresh()
              }}
              className="relative rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unread > 0 ? (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <h3 className="font-semibold text-foreground">Notificações</h3>
                  <Link
                    href="/notificacoes"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    Ver todas
                  </Link>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">Nenhuma notificação.</p>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        type="button"
                        className={`w-full border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted ${
                          notif.read ? '' : 'bg-primary/5'
                        }`}
                        onClick={() => {
                          markNotificationRead(notif.id)
                          refresh()
                          setNotificationsOpen(false)
                          if (notif.href) window.location.href = notif.href
                        }}
                      >
                        <p className="text-sm text-foreground">{notif.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {relativeTime(notif.createdAt)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen)
                setNotificationsOpen(false)
              }}
              className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <span className="text-sm font-bold text-primary">{initials}</span>
              </div>
            </button>

            {profileOpen ? (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                <div className="border-b border-border p-4">
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-primary">
                    Corretor
                  </p>
                </div>
                <nav className="p-2">
                  <Link
                    href="/profile"
                    className="block rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    Meu perfil
                  </Link>
                  <Link
                    href="/settings/aplicativo"
                    className="block rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    Instalar aplicativo
                  </Link>
                  <Link
                    href="/configuracoes"
                    className="block rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    Configurações
                  </Link>
                  <hr className="my-2 border-border" />
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-muted"
                    onClick={async () => {
                      await logoutApp()
                      window.location.href = '/login'
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </nav>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
