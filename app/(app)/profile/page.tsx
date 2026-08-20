'use client'

import { useState } from 'react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/design-system/buttons/button'
import { Input } from '@/components/design-system/forms/input'
import { Textarea } from '@/components/design-system/forms/textarea'
import { Alert } from '@/components/design-system/feedback/alert'
import { Badge } from '@/components/design-system/feedback/badge'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    firstName: 'Corretor',
    lastName: 'Demonstração',
    email: 'corretor@plataforma.com.br',
    phone: '(11) 90000-0001',
    bio: 'Conta seed de desenvolvimento do ImóvelHub',
    creci: '000001',
    company: 'ImóvelHub Demo',
  })

  const handleSave = () => {
    setSaved(true)
    setIsEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Perfil' }]} />

      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas informações pessoais
            </p>
          </div>
          <Button
            variant={isEditing ? 'secondary' : 'primary'}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        {saved && (
          <Alert
            variant="success"
            title="Sucesso"
            description="Seu perfil foi atualizado com sucesso"
          />
        )}

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-primary">AC</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-muted-foreground mt-1">{formData.email}</p>
              <div className="flex gap-2 mt-3">
                <Badge>Gerenciador</Badge>
                <Badge>CRECI {formData.creci}</Badge>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Informações Pessoais
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Primeiro Nome
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="px-3 py-2 text-sm text-foreground">
                        {formData.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sobrenome
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            lastName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="px-3 py-2 text-sm text-foreground">
                        {formData.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    E-mail
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm text-foreground">
                      {formData.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Telefone
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm text-foreground">
                      {formData.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Biografia
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bio: e.target.value,
                        })
                      }
                      rows={4}
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm text-foreground whitespace-pre-wrap">
                      {formData.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Informações Profissionais
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Empresa
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            company: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="px-3 py-2 text-sm text-foreground">
                        {formData.company}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      CRECI
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.creci}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            creci: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="px-3 py-2 text-sm text-foreground">
                        {formData.creci}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="border-t border-border pt-6 mt-6">
              <Button variant="primary" onClick={handleSave} className="w-full">
                Salvar Alterações
              </Button>
            </div>
          )}
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-2">
              Alterar Senha
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Mantenha sua conta segura com uma senha forte
            </p>
            <Button variant="secondary" size="sm">
              Alterar Senha
            </Button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-2">
              Gerenciar Sessões
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Veja e controle seus dispositivos conectados
            </p>
            <Button variant="secondary" size="sm">
              Gerenciar Sessões
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
