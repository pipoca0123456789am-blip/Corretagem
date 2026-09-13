'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Toggle } from '@/components/design-system/forms/toggle'
import { Alert } from '@/components/design-system/feedback/alert'
import { logoutApp } from '@/lib/auth'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    smsAlerts: false,
    darkMode: true,
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  })
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleLogout = async () => {
    await logoutApp()
    router.push('/login')
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Configurações' }]} />

      <div className="p-4 md:p-6 space-y-6 pb-28">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Configurações</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Personalize sua experiência na plataforma
          </p>
        </div>

        <Link
          href="/settings/aplicativo"
          className="block rounded-xl border border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10 md:p-5"
        >
          <p className="font-semibold text-foreground">Aplicativo</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Instalar o ImóvelHub Corretor no computador ou celular, ver instruções e status da instalação.
          </p>
        </Link>

        {saved && (
          <Alert
            variant="success"
            title="Sucesso"
            description="Suas configurações foram salvas com sucesso"
          />
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Notificações
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Notificações em Tempo Real
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre ofertas e atividades
                  </p>
                </div>
                <Toggle
                  checked={settings.notifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      notifications: checked,
                    })
                  }
                />
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    Atualizações por e-mail
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Receba resumos e novidades por email
                  </p>
                </div>
                <Toggle
                  checked={settings.emailUpdates}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      emailUpdates: checked,
                    })
                  }
                />
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Alertas por SMS</p>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas críticos por SMS
                  </p>
                </div>
                <Toggle
                  checked={settings.smsAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      smsAlerts: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Aparência
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Modo Escuro</p>
                  <p className="text-sm text-muted-foreground">
                    Alterne entre tema claro e escuro
                  </p>
                </div>
                <Toggle
                  checked={settings.darkMode}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      darkMode: checked,
                    })
                  }
                />
              </div>

              <div className="border-t border-border pt-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      language: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (USA)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div className="border-t border-border pt-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Fuso Horário
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      timezone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="America/Sao_Paulo">
                    São Paulo (GMT-3)
                  </option>
                  <option value="America/Rio_Branco">Rio Branco (GMT-4)</option>
                  <option value="America/Manaus">Manaus (GMT-4)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Conta</h2>
            <div className="space-y-4">
              <Link href="/profile">
                <Button variant="secondary" className="w-full justify-start">
                  Editar Perfil
                </Button>
              </Link>

              <Button variant="secondary" className="w-full justify-start">
                Alterar Senha
              </Button>

              <Button variant="secondary" className="w-full justify-start">
                Gerenciar Sessões
              </Button>

              <div className="border-t border-border pt-4">
                <Button
                  variant="danger"
                  className="w-full justify-start"
                  onClick={() => setShowLogoutModal(true)}
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-destructive mb-4">
              Zona de Perigo
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Ações irreversíveis que afetam sua conta
            </p>
            <Button variant="danger" className="w-full">
              Excluir conta
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button variant="primary" onClick={handleSave} size="lg">
            Salvar Alterações
          </Button>
          <Button variant="secondary" size="lg">
            Cancelar
          </Button>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold text-foreground mb-2">
                Confirmar saída
              </h2>
              <p className="text-muted-foreground mb-6">
                Você tem certeza que deseja sair da plataforma?
              </p>
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
