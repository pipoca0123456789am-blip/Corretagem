/**
 * Cliente público Supabase (browser / RSC sem secrets).
 * Auth do ImóvelHub NÃO usa isto como fonte de sessão — cookies HttpOnly server-side.
 */

export function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url || !anonKey) {
    return null
  }

  return { url, anonKey }
}
