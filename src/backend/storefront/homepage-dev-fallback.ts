import net from 'node:net'
import type { ProductCardData } from '@/backend/types/product'

type HomepageFallbackCategory = {
  id: string
  name: string
  slug: string
  icon?: string | null
  image?: string | null
  description?: string | null
  productCount: number
  children: { id: string; name: string; slug: string }[]
}

type HomepageDevFallbackData = {
  banners: []
  categories: HomepageFallbackCategory[]
  featured: ProductCardData[]
  bestSellers: ProductCardData[]
  newArrivals: ProductCardData[]
  newArrivalsPinned: ProductCardData[]
  bestSellersPinned: ProductCardData[]
  flashSale: null
}

const PRISMA_CONNECTION_PATTERNS = [
  /can't reach database server/i,
  /cannot reach database server/i,
  /connect econnrefused/i,
  /connection refused/i,
]

const LOCAL_DB_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])

const DEV_HOMEPAGE_FALLBACK_CATEGORIES: HomepageFallbackCategory[] = [
  {
    id: 'dev-electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Cpu',
    image: null,
    description: null,
    productCount: 0,
    children: [],
  },
  {
    id: 'dev-fashion',
    name: 'Fashion',
    slug: 'fashion',
    icon: 'Shirt',
    image: null,
    description: null,
    productCount: 0,
    children: [],
  },
  {
    id: 'dev-home-appliances',
    name: 'Home & Appliances',
    slug: 'home-appliances',
    icon: 'Home',
    image: null,
    description: null,
    productCount: 0,
    children: [],
  },
  {
    id: 'dev-beauty-health',
    name: 'Beauty & Health',
    slug: 'beauty-health',
    icon: 'Sparkles',
    image: null,
    description: null,
    productCount: 0,
    children: [],
  },
  {
    id: 'dev-sports-fitness',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    icon: 'Dumbbell',
    image: null,
    description: null,
    productCount: 0,
    children: [],
  },
  {
    id: 'dev-books-stationery',
    name: 'Books & Stationery',
    slug: 'books-stationery',
    icon: 'BookOpen',
    image: null,
    description: null,
    productCount: 0,
    children: [],
  },
  {
    id: 'dev-gaming',
    name: 'Gaming',
    slug: 'gaming',
    icon: 'Gamepad2',
    image: null,
    description: null,
    productCount: 0,
    children: [],
  },
  {
    id: 'dev-toys-collectibles',
    name: 'Toys & Collectibles',
    slug: 'toys-collectibles',
    icon: 'ToyBrick',
    image: null,
    description: 'Hot Wheels, LEGO sets, diecast models, action figures, and collectible cards.',
    productCount: 0,
    children: [
      { id: 'dev-hot-wheels', name: 'Hot Wheels', slug: 'hot-wheels' },
      { id: 'dev-lego-sets', name: 'LEGO Sets', slug: 'lego-sets' },
      { id: 'dev-diecast-models', name: 'Diecast Models', slug: 'diecast-models' },
      { id: 'dev-action-figures', name: 'Action Figures', slug: 'action-figures' },
      { id: 'dev-collectible-cards', name: 'Collectible Cards', slug: 'collectible-cards' },
    ],
  },
]

let warnedAboutHomepageDevFallback = false

type LocalDatabaseEndpoint = {
  host: string
  port: number
}

type DatabaseUrlEnv = {
  DATABASE_URL?: string
}

type HomepageFallbackEnv = DatabaseUrlEnv & {
  NODE_ENV?: string
}

function getErrorName(error: unknown) {
  return error && typeof error === 'object' && 'name' in error && typeof error.name === 'string'
    ? error.name
    : ''
}

function getErrorCode(error: unknown) {
  return error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
    ? error.code
    : ''
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : ''
}

export function isPrismaConnectionUnavailableError(error: unknown) {
  const name = getErrorName(error)
  const code = getErrorCode(error)
  const message = getErrorMessage(error)

  if (code === 'P1001') return true

  if (name !== 'PrismaClientInitializationError') return false

  return PRISMA_CONNECTION_PATTERNS.some((pattern) => pattern.test(message))
}

export function shouldUseHomepageDevFallback(
  error: unknown,
  env: Pick<HomepageFallbackEnv, 'NODE_ENV'> = process.env as HomepageFallbackEnv
) {
  return env.NODE_ENV === 'development' && isPrismaConnectionUnavailableError(error)
}

export function getLocalDatabaseEndpoint(env: DatabaseUrlEnv = process.env as DatabaseUrlEnv): LocalDatabaseEndpoint | null {
  const databaseUrl = env.DATABASE_URL
  if (!databaseUrl) return null

  try {
    const parsed = new URL(databaseUrl)
    const host = parsed.hostname

    if (!LOCAL_DB_HOSTS.has(host)) return null

    const port = parsed.port ? Number(parsed.port) : 5432
    if (!Number.isInteger(port) || port <= 0 || port > 65535) return null

    return { host, port }
  } catch {
    return null
  }
}

export function isTcpEndpointReachable(endpoint: LocalDatabaseEndpoint, timeoutMs = 350) {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host: endpoint.host, port: endpoint.port })
    let settled = false

    const finish = (reachable: boolean) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(reachable)
    }

    socket.once('connect', () => finish(true))
    socket.once('error', () => finish(false))
    socket.setTimeout(timeoutMs, () => finish(false))
  })
}

export async function shouldUseHomepageDevFallbackBeforeDb(
  env: HomepageFallbackEnv = process.env as HomepageFallbackEnv,
  isReachable: (endpoint: LocalDatabaseEndpoint) => Promise<boolean> = isTcpEndpointReachable
) {
  if (env.NODE_ENV !== 'development') return false

  const endpoint = getLocalDatabaseEndpoint(env)
  if (!endpoint) return false

  return !(await isReachable(endpoint))
}

export function createHomepageDevFallbackData(): HomepageDevFallbackData {
  return {
    banners: [],
    categories: DEV_HOMEPAGE_FALLBACK_CATEGORIES.map((category) => ({
      ...category,
      children: category.children.map((child) => ({ ...child })),
    })),
    featured: [],
    bestSellers: [],
    newArrivals: [],
    newArrivalsPinned: [],
    bestSellersPinned: [],
    flashSale: null,
  }
}

export function warnHomepageDevFallback(logger: Pick<Console, 'warn'> = console) {
  if (warnedAboutHomepageDevFallback) return

  warnedAboutHomepageDevFallback = true
  logger.warn(
    'Development storefront fallback active: local PostgreSQL is unavailable, so homepage DB-backed data is using safe empty/static development data.'
  )
}

export function resetHomepageDevFallbackWarningForTests() {
  warnedAboutHomepageDevFallback = false
}
