import { promises as fs } from 'fs'
import path from 'path'
import type { ServerUser } from '@/lib/server/user-types'
import type { StoreBackend, UserStore } from '@/lib/server/store/types'
import { isProductionRuntime } from '@/lib/server/secrets'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

let memoryCache: ServerUser[] | null = null
let warnedProdMemory = false

function warnProdMemoryOnce() {
  if (warnedProdMemory) return
  warnedProdMemory = true
  console.warn(
    '[store:users] Persistência em disco indisponível ou desabilitada. ' +
      'Usando memória do processo — inadequado para multi-instância (Vercel). ' +
      'Aplique supabase/migrations e configure DATABASE_URL.'
  )
}

/**
 * Store de usuários: arquivo em DEV; memória em PROD sem Postgres.
 * Nunca finge que gravou em DB quando o FS falha.
 */
export function createFileUserStore(): UserStore {
  let backend: StoreBackend = isProductionRuntime() ? 'memory' : 'file'

  return {
    get backend() {
      return backend
    },
    async list() {
      if (memoryCache) return memoryCache
      if (isProductionRuntime() && !process.env.ALLOW_FILE_USER_STORE) {
        memoryCache = []
        backend = 'memory'
        warnProdMemoryOnce()
        return memoryCache
      }
      try {
        const raw = await fs.readFile(USERS_FILE, 'utf8')
        memoryCache = JSON.parse(raw) as ServerUser[]
        backend = 'file'
        return memoryCache
      } catch {
        memoryCache = []
        return memoryCache
      }
    },
    async save(users: ServerUser[]) {
      memoryCache = users
      if (isProductionRuntime() && !process.env.ALLOW_FILE_USER_STORE) {
        backend = 'memory'
        warnProdMemoryOnce()
        return
      }
      try {
        await fs.mkdir(DATA_DIR, { recursive: true })
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
        backend = 'file'
      } catch {
        backend = 'memory'
        warnProdMemoryOnce()
      }
    },
  }
}

/** Reset de cache (testes). */
export function __resetUserStoreCacheForTests() {
  memoryCache = null
  warnedProdMemory = false
}
