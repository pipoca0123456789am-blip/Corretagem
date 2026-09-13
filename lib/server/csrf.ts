/**
 * Proteção CSRF básica para mutações cookie-authenticated.
 * SameSite=Lax cobre o caso comum; Origin/Host fecha lacunas cross-site POST.
 */

export function assertSameOrigin(request: Request): { ok: true } | { ok: false; error: string } {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (!host) {
    return { ok: false, error: 'Host ausente' }
  }

  // Same-origin fetch de browsers modernos envia Origin em POST cross-site;
  // em same-origin também envia. Sem Origin (ex.: same-origin form GET→POST raro / curl):
  // exige Sec-Fetch-Site quando presente.
  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite === 'cross-site') {
    return { ok: false, error: 'Origem cruzada bloqueada' }
  }

  if (origin) {
    try {
      const o = new URL(origin)
      if (o.host !== host) {
        return { ok: false, error: 'Origin não confere com Host' }
      }
    } catch {
      return { ok: false, error: 'Origin inválida' }
    }
  }

  return { ok: true }
}

export function csrfDeniedResponse() {
  return Response.json({ ok: false, error: 'Requisição bloqueada (CSRF).' }, { status: 403 })
}
