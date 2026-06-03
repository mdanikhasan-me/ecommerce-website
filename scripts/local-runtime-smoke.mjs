import { spawn, spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { join, resolve } from 'node:path'

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_STARTUP_TIMEOUT_MS = 90_000
const DEFAULT_REQUEST_TIMEOUT_MS = 20_000
const LOG_LINE_LIMIT = 80
const REMOVED_STOREFRONT_DEALS_PATH = `/${'deals'}`
const REMOVED_ADMIN_FLASH_API_PATH = `/api/admin/${'flash'}-${'sales'}`

export const DEFAULT_SMOKE_PROBES = [
  { label: 'home', path: '/', expectedStatuses: [200] },
  { label: 'category electronics', path: '/category/electronics', expectedStatuses: [200] },
  { label: 'product detail', path: '/products/xiaomi-redmi-note-13-pro-256gb', expectedStatuses: [200] },
  { label: 'cart', path: '/cart', expectedStatuses: [200] },
  { label: 'checkout auth boundary', path: '/checkout', expectedStatuses: [307, 308] },
  { label: 'track order', path: '/track-order', expectedStatuses: [200] },
  { label: 'admin auth boundary', path: '/admin/dashboard', expectedStatuses: [307, 308] },
  { label: 'products API sanitized params', path: '/api/products?page=bad&limit=100000', expectedStatuses: [200] },
  {
    label: 'product view malformed id',
    path: '/api/products/bad%24id/view',
    method: 'POST',
    body: {},
    expectedStatuses: [404],
  },
  {
    label: 'return request unauthenticated',
    path: '/api/returns',
    method: 'POST',
    body: {},
    expectedStatuses: [401],
  },
  { label: 'removed storefront route', path: REMOVED_STOREFRONT_DEALS_PATH, expectedStatuses: [404] },
  { label: 'removed admin API route', path: REMOVED_ADMIN_FLASH_API_PATH, expectedStatuses: [404] },
  { label: 'sitemap', path: '/sitemap.xml', expectedStatuses: [200] },
  { label: 'robots', path: '/robots.txt', expectedStatuses: [200] },
]

export function parseSmokeArgs(argv = []) {
  const args = {
    mode: 'dev',
    host: DEFAULT_HOST,
    port: 3110,
    startupTimeoutMs: DEFAULT_STARTUP_TIMEOUT_MS,
    requestTimeoutMs: DEFAULT_REQUEST_TIMEOUT_MS,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const next = argv[index + 1]

    if (arg === '--mode') {
      args.mode = next
      index += 1
    } else if (arg === '--host' || arg === '--hostname') {
      args.host = next
      index += 1
    } else if (arg === '--port') {
      args.port = Number(next)
      index += 1
    } else if (arg === '--startup-timeout-ms') {
      args.startupTimeoutMs = Number(next)
      index += 1
    } else if (arg === '--request-timeout-ms') {
      args.requestTimeoutMs = Number(next)
      index += 1
    }
  }

  if (args.mode !== 'dev' && args.mode !== 'start') {
    throw new Error('Unsupported smoke mode. Use dev or start.')
  }
  if (!Number.isSafeInteger(args.port) || args.port < 1 || args.port > 65535) {
    throw new Error('Smoke port must be an integer between 1 and 65535.')
  }
  if (!args.host || /[\s/\\]/.test(args.host)) {
    throw new Error('Smoke host must be a simple hostname or IP address.')
  }
  if (!Number.isFinite(args.startupTimeoutMs) || args.startupTimeoutMs < 5_000) {
    throw new Error('Startup timeout must be at least 5000ms.')
  }
  if (!Number.isFinite(args.requestTimeoutMs) || args.requestTimeoutMs < 1_000) {
    throw new Error('Request timeout must be at least 1000ms.')
  }

  return args
}

export function createNextSmokeCommand({ mode, host, port }) {
  return {
    command: process.execPath,
    args: [
      join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next'),
      mode,
      '--hostname',
      host,
      '--port',
      String(port),
    ],
  }
}

export function isExpectedStatus(status, expectedStatuses) {
  if (Array.isArray(expectedStatuses) && expectedStatuses.length > 0) {
    return expectedStatuses.includes(status)
  }
  return status < 500
}

export function hasUnsafeApiLeak(body, contentType = '') {
  if (!contentType.toLowerCase().includes('application/json')) return false
  return /PrismaClient(?:KnownRequestError|ValidationError|InitializationError)?|DATABASE_URL|SHADOW_DATABASE_URL|postgres(?:ql)?:\/\/[^\s"']+|"stack"\s*:|\bat\s+[A-Za-z0-9_$.[\]/\\-]+\s+\([^)]*:\d+:\d+\)|Bearer\s+[A-Za-z0-9._-]{20,}/i.test(body)
}

export function sanitizeSmokeLog(value) {
  return String(value)
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[redacted-db-url]')
    .replace(/(authorization|cookie|set-cookie):[^\r\n]+/gi, '$1: [redacted]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms))
}

function appendLogLine(lines, chunk) {
  const text = sanitizeSmokeLog(chunk)
  if (!text) return
  lines.push(text)
  while (lines.length > LOG_LINE_LIMIT) lines.shift()
}

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      redirect: 'manual',
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timer)
  }
}

async function waitForServer(baseUrl, childState, startupTimeoutMs) {
  const startedAt = Date.now()
  let lastError = null

  while (Date.now() - startedAt < startupTimeoutMs) {
    if (childState.exited) {
      throw new Error(`Smoke server exited before readiness: ${childState.code ?? childState.signal}`)
    }

    try {
      const response = await fetchWithTimeout(baseUrl, {}, 5_000)
      if (response.status < 500) return
    } catch (error) {
      lastError = error
    }

    await wait(500)
  }

  throw new Error(`Smoke server did not become ready: ${lastError?.message ?? 'timeout'}`)
}

export async function stopProcessTree(child) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    })
    return
  }

  child.kill('SIGTERM')
  await wait(1000)
  if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
}

async function runProbe(baseUrl, probe, requestTimeoutMs) {
  const url = new URL(probe.path, baseUrl)
  const method = probe.method ?? 'GET'
  const headers = new Headers(probe.headers ?? {})

  headers.set('user-agent', 'boilabin-local-runtime-smoke')
  if (method !== 'GET' && method !== 'HEAD') {
    headers.set('content-type', 'application/json')
    headers.set('origin', baseUrl)
    headers.set('referer', `${baseUrl}/`)
  }

  const response = await fetchWithTimeout(
    url,
    {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(probe.body ?? {}),
    },
    requestTimeoutMs,
  )
  const contentType = response.headers.get('content-type') ?? ''
  const body = await response.text()
  const rawLeak = hasUnsafeApiLeak(body, contentType)
  const okStatus = isExpectedStatus(response.status, probe.expectedStatuses)

  const ok = okStatus && !rawLeak

  return {
    label: probe.label,
    path: probe.path,
    method,
    status: response.status,
    ok,
    rawLeak,
    location: response.headers.get('location') ?? null,
    contentType,
    bodySample: ok ? '' : sanitizeSmokeLog(body),
  }
}

export async function runLocalRuntimeSmoke(options) {
  const { mode, host, port, startupTimeoutMs, requestTimeoutMs } = options
  const baseUrl = `http://${host}:${port}`
  const command = createNextSmokeCommand({ mode, host, port })
  const logs = []
  const childState = { exited: false, code: null, signal: null }
  const child = spawn(command.command, command.args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })

  child.stdout.on('data', (chunk) => appendLogLine(logs, chunk))
  child.stderr.on('data', (chunk) => appendLogLine(logs, chunk))
  child.once('exit', (code, signal) => {
    childState.exited = true
    childState.code = code
    childState.signal = signal
  })

  try {
    await waitForServer(baseUrl, childState, startupTimeoutMs)
    const results = []

    for (const probe of DEFAULT_SMOKE_PROBES) {
      results.push(await runProbe(baseUrl, probe, requestTimeoutMs))
    }

    return {
      mode,
      baseUrl,
      ok: results.every((result) => result.ok),
      results,
      logs: results.every((result) => result.ok) ? [] : logs,
    }
  } finally {
    await stopProcessTree(child)
  }
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

async function runCli() {
  const options = parseSmokeArgs(process.argv.slice(2))
  const result = await runLocalRuntimeSmoke(options)

  console.log(JSON.stringify(result, null, 2))
  if (!result.ok) process.exitCode = 1
}

if (isCliEntrypoint()) {
  runCli().catch((error) => {
    console.error(sanitizeSmokeLog(error?.message ?? error))
    process.exitCode = 1
  })
}
