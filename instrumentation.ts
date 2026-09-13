/**
 * Next.js instrumentation — valida fail-closed em runtime de produção.
 * Não aplica migrations; não toca schemas de outros produtos.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  try {
    const { assertProductionSecurityEnv, isProductionRuntime, isSecurityAssertSkipped } =
      await import('@/lib/server/env')
    if (isProductionRuntime() && !isSecurityAssertSkipped()) {
      assertProductionSecurityEnv()
      console.info('[instrumentation] Produção: env de segurança OK (fail-closed).')
    } else if (!isProductionRuntime()) {
      console.info(
        '[instrumentation] Dev/test: file/memory/console permitidos com logs explícitos.'
      )
    }
  } catch (err) {
    // Em produção real, falhar o boot é intencional (fail-closed).
    console.error('[instrumentation] Falha na validação de segurança:', err)
    throw err
  }
}
