export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'suporte'
  | 'financeiro'
  | 'corretor'
  | 'assistente'
  | 'cliente'

export type AuthRealm = 'admin' | 'app' | 'client'
export type UserStatus = 'ativo' | 'inativo' | 'pending_verification'

export interface ServerUser {
  id: string
  name: string
  email: string
  /** Nunca expor ao cliente */
  passwordHash: string
  role: UserRole
  status: UserStatus
  realtorId: number | null
  emailVerifiedAt: string | null
  createdAt: string
  updatedAt: string
  /** Segredo TOTP cifrado (AES-GCM); nunca enviar ao cliente */
  totpSecretEnc?: string | null
  totpEnabled?: boolean
  /** Hashes SHA-256 de códigos de recuperação */
  totpRecoveryHashes?: string[]
}

export type PublicUser = Omit<
  ServerUser,
  'passwordHash' | 'totpSecretEnc' | 'totpRecoveryHashes'
> & {
  totpEnabled: boolean
}
