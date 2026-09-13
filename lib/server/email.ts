/**
 * Abstração de e-mail transacional (OTP, reset de senha).
 * Produção: sem provedor real → NÃO finge envio (ok:false); conta permanece pending_verification.
 */

import { isProductionRuntime } from '@/lib/server/secrets'
import { hasEmailProviderEnv } from '@/lib/server/env'

export type EmailProviderName = 'console' | 'resend' | 'smtp' | 'none'

export interface SendEmailInput {
  to: string
  subject: string
  text: string
  html?: string
  /** Campos sensíveis — só logados mascarados */
  sensitiveHint?: string
}

export interface EmailSendResult {
  ok: boolean
  provider: EmailProviderName
  error?: string
}

function resolveProvider(): EmailProviderName {
  const raw = (process.env.EMAIL_PROVIDER || '').trim().toLowerCase()
  if (raw === 'resend' || raw === 'smtp' || raw === 'console') return raw
  if (process.env.RESEND_API_KEY) return 'resend'
  if (isProductionRuntime()) return 'none'
  return 'console'
}

/** Redige códigos/tokens em logs. */
export function redactSensitive(value: string | undefined | null): string {
  if (!value) return '[empty]'
  const v = String(value)
  if (v.length <= 4) return '****'
  return `${v.slice(0, 2)}…${v.slice(-2)} (${v.length} chars)`
}

function logDev(input: SendEmailInput, provider: EmailProviderName) {
  const hint = input.sensitiveHint ? redactSensitive(input.sensitiveHint) : undefined
  if (isProductionRuntime()) {
    console.info(
      '[email]',
      provider,
      'to=',
      input.to,
      'subject=',
      input.subject,
      hint ? `secret=${hint}` : ''
    )
    return
  }
  console.info('[email:dev]', {
    provider,
    to: input.to,
    subject: input.subject,
    text: input.text,
    sensitive: hint,
  })
}

async function sendResend(input: SendEmailInput): Promise<EmailSendResult> {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim() || 'ImóvelHub <onboarding@resend.dev>'
  if (!key) {
    return { ok: false, provider: 'resend', error: 'RESEND_API_KEY ausente' }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html || `<pre>${input.text}</pre>`,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    console.error('[email:resend] falha', res.status, body.slice(0, 200))
    return { ok: false, provider: 'resend', error: `HTTP ${res.status}` }
  }
  return { ok: true, provider: 'resend' }
}

async function sendSmtp(input: SendEmailInput): Promise<EmailSendResult> {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()
  const from = process.env.EMAIL_FROM?.trim() || user || 'noreply@localhost'
  if (!host || !user || !pass) {
    return {
      ok: false,
      provider: 'smtp',
      error: 'SMTP_HOST/SMTP_USER/SMTP_PASS ausentes — use EMAIL_PROVIDER=resend',
    }
  }
  console.warn(
    '[email:smtp] Bridge SMTP nativo não embutido neste build. ' +
      'Configure EMAIL_PROVIDER=resend. ' +
      `Host=${host} from=${from} to=${input.to}`
  )
  return {
    ok: false,
    provider: 'smtp',
    error: 'SMTP nativo não configurado neste build — use Resend',
  }
}

export async function sendEmail(input: SendEmailInput): Promise<EmailSendResult> {
  const provider = resolveProvider()
  logDev(input, provider)

  if (provider === 'none') {
    console.error(
      '[email] Produção sem provedor — NÃO fingindo envio. Conta permanece pending_verification.'
    )
    return {
      ok: false,
      provider: 'none',
      error: 'Provedor de e-mail não configurado em produção',
    }
  }

  if (provider === 'console') {
    // Em produção, console nunca deve ser tratado como sucesso real
    if (isProductionRuntime()) {
      return {
        ok: false,
        provider: 'console',
        error: 'EMAIL_PROVIDER=console proibido em produção',
      }
    }
    return { ok: true, provider: 'console' }
  }
  if (provider === 'resend') {
    if (!hasEmailProviderEnv()) {
      return { ok: false, provider: 'resend', error: 'RESEND_API_KEY ausente' }
    }
    return sendResend(input)
  }
  if (provider === 'smtp') {
    return sendSmtp(input)
  }
  return { ok: false, provider: 'none', error: 'Provedor desconhecido' }
}

export async function sendOtpEmail(to: string, code: string): Promise<EmailSendResult> {
  return sendEmail({
    to,
    subject: 'Seu código de verificação — ImóvelHub',
    text: `Seu código de verificação é: ${code}\n\nVálido por 10 minutos. Se não solicitou, ignore este e-mail.`,
    html: `<p>Seu código de verificação é: <strong>${code}</strong></p><p>Válido por 10 minutos.</p>`,
    sensitiveHint: code,
  })
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  token: string
): Promise<EmailSendResult> {
  return sendEmail({
    to,
    subject: 'Redefinição de senha — ImóvelHub',
    text: `Use o link para redefinir sua senha (válido 30 min):\n${resetUrl}\n\nSe não solicitou, ignore este e-mail.`,
    html: `<p>Use o link para redefinir sua senha (válido 30 min):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    sensitiveHint: token,
  })
}
