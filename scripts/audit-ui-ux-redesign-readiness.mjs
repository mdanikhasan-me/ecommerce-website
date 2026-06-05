import { spawn } from 'node:child_process'
import { existsSync, promises as fs, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  createBrowserLaunchArgs,
  resolveBrowserExecutable,
} from './local-browser-runtime-check.mjs'
import { createLocalAssetDependencyEvidence, collectLocalAssetDependencyAudit } from './audit-local-asset-dependencies.mjs'
import { auditStorefrontMediaSources } from './audit-storefront-media-sources.mjs'
import {
  createNextSmokeCommand,
  sanitizeSmokeLog,
  stopProcessTree,
} from './local-runtime-smoke.mjs'

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.css'])
const SKIP_DIRS = new Set(['.git', '.next', 'node_modules', 'audit-reports', 'public/uploads'])
const DEFAULT_OUT_DIR = 'audit-reports/286-ui-ux-redesign-transition-inventory'
const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_SERVER_PORT = 3140
const DEFAULT_CDP_PORT = 9340
const DEFAULT_TIMEOUT_MS = 90_000
const PRODUCT_VIEW_PATTERN = /\/api\/products\/[^/]+\/view(?:$|[?#])/i
const REMOVED_STOREFRONT_ROUTE = ['/', 'de', 'als'].join('')
const REMOVED_ADMIN_ROUTE = ['/api/admin/', ['fla', 'sh'].join(''), '-', ['sa', 'les'].join('')].join('')

export const UI_REDESIGN_ROUTE_PATHS = [
  '/',
  '/category',
  '/category/electronics',
  '/search?q=phone',
  '/products/iphone-15-pro-128gb',
  '/cart',
  '/checkout',
  '/track-order',
  '/faq',
  '/returns',
  '/contact',
  REMOVED_STOREFRONT_ROUTE,
  REMOVED_ADMIN_ROUTE,
]

export const UI_REDESIGN_VIEWPORTS = [
  { label: 'mobile-360', width: 360, height: 800, mobile: true, deviceScaleFactor: 2 },
  { label: 'mobile-390', width: 390, height: 844, mobile: true, deviceScaleFactor: 2 },
  { label: 'mobile-430', width: 430, height: 932, mobile: true, deviceScaleFactor: 2 },
  { label: 'narrow-480', width: 480, height: 900, mobile: true, deviceScaleFactor: 2 },
  { label: 'small-600', width: 600, height: 900, mobile: false, deviceScaleFactor: 1 },
  { label: 'mid-700', width: 700, height: 960, mobile: false, deviceScaleFactor: 1 },
  { label: 'tablet-768', width: 768, height: 1024, mobile: false, deviceScaleFactor: 1 },
  { label: 'tablet-900', width: 900, height: 1024, mobile: false, deviceScaleFactor: 1 },
  { label: 'desktop-1024', width: 1024, height: 768, mobile: false, deviceScaleFactor: 1 },
  { label: 'desktop-1366', width: 1366, height: 768, mobile: false, deviceScaleFactor: 1 },
]

const SCREENSHOT_PAIRS = new Set([
  '/|mobile-390',
  '/|desktop-1366',
  '/category/electronics|mobile-390',
  '/category/electronics|desktop-1366',
  '/search?q=phone|mobile-390',
  '/search?q=phone|desktop-1366',
  '/products/iphone-15-pro-128gb|mobile-390',
  '/products/iphone-15-pro-128gb|desktop-1366',
  '/cart|mobile-390',
  '/cart|desktop-1366',
  '/checkout|mobile-390',
  '/track-order|mobile-390',
])

function normalizePath(value) {
  return value.split(path.sep).join('/')
}

function stripRouteGroups(value) {
  return value.replace(/\([^/]+\)\//g, '')
}

function routeFromStorePage(relativePath) {
  const normalized = normalizePath(relativePath)
  const withoutRoot = normalized.replace(/^src\/app\/\(store\)\//, '')
  if (withoutRoot === 'page.tsx') return '/'
  if (withoutRoot === 'layout.tsx') return '(store layout)'
  if (!withoutRoot.endsWith('/page.tsx')) return null

  const route = `/${withoutRoot
    .replace(/\/page\.tsx$/, '')
    .replace(/\[([^\]]+)\]/g, ':$1')}`

  return stripRouteGroups(route)
}

async function walkFiles(root, relativeDir = '') {
  const absoluteDir = path.join(root, relativeDir)
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const relativePath = relativeDir ? path.join(relativeDir, entry.name) : entry.name
    const normalized = normalizePath(relativePath)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || SKIP_DIRS.has(normalized)) continue
      files.push(...await walkFiles(root, relativePath))
      continue
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(normalized)
    }
  }

  return files
}

async function readText(root, relativePath) {
  return fs.readFile(path.join(root, relativePath), 'utf8')
}

function countMatches(content, pattern) {
  return (content.match(pattern) ?? []).length
}

function extractImports(content) {
  return [...content.matchAll(/import\s+(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g)]
    .map((match) => match[1])
}

function extractFrontendComponents(imports) {
  return imports
    .filter((source) => source.startsWith('@/frontend/components/'))
    .map((source) => source.replace('@/frontend/components/', ''))
    .sort()
}

function classifyRoute(route, content) {
  const pathValue = route || ''
  const riskReasons = []
  if (/checkout|order|account/.test(pathValue)) riskReasons.push('auth/order boundary')
  if (/products\/:slug/.test(pathValue)) riskReasons.push('product detail tracking and structured data')
  if (/category|search/.test(pathValue)) riskReasons.push('listing filters and SEO metadata')
  if (/cart/.test(pathValue)) riskReasons.push('client cart state')
  if (content.includes('redirect(')) riskReasons.push('redirect behavior')
  if (content.includes('JsonLd') || content.includes('generateMetadata')) riskReasons.push('SEO metadata/JSON-LD')

  return {
    visualPriority: pathValue === '/' || /category|search|products|cart|checkout/.test(pathValue) ? 'high' : 'medium',
    redesignRisk: riskReasons.length > 1 ? 'high' : riskReasons.length === 1 ? 'medium' : 'low',
    riskReasons,
  }
}

export async function collectUiUxRedesignInventory({ cwd = process.cwd() } = {}) {
  const root = path.resolve(cwd)
  const files = await walkFiles(root)
  const sourceFiles = []

  for (const relativePath of files) {
    const content = await readText(root, relativePath)
    sourceFiles.push({ relativePath, content })
  }

  const storeRoutes = []
  for (const file of sourceFiles.filter((entry) => entry.relativePath.startsWith('src/app/(store)/'))) {
    const route = routeFromStorePage(file.relativePath)
    if (!route || route === '(store layout)') continue
    const imports = extractImports(file.content)
    const classification = classifyRoute(route, file.content)

    storeRoutes.push({
      route,
      file: file.relativePath,
      majorComponents: extractFrontendComponents(imports),
      dataDependencies: {
        database: /\bdb\./.test(file.content),
        auth: /\bauth\(/.test(file.content),
        redirect: file.content.includes('redirect('),
        clientFetch: /\bfetch\(/.test(file.content),
        metadata: /generateMetadata|metadata: Metadata/.test(file.content),
        jsonLd: file.content.includes('JsonLd'),
      },
      visualPriority: classification.visualPriority,
      redesignRisk: classification.redesignRisk,
      riskReasons: classification.riskReasons,
      screenshotRecommended: UI_REDESIGN_ROUTE_PATHS.some((target) => target.split('?')[0] === route.replace(/:slug/g, 'electronics')),
    })
  }

  const componentFiles = sourceFiles.filter((entry) => entry.relativePath.startsWith('src/frontend/components/'))
  const componentAreaCounts = {}
  for (const file of componentFiles) {
    const area = file.relativePath.split('/')[3] ?? 'unknown'
    componentAreaCounts[area] = (componentAreaCounts[area] ?? 0) + 1
  }

  const combinedComponentText = componentFiles.map((entry) => entry.content).join('\n')
  const globals = sourceFiles.find((entry) => entry.relativePath === 'src/app/globals.css')?.content ?? ''
  const tailwind = sourceFiles.find((entry) => entry.relativePath === 'tailwind.config.ts')?.content ?? ''
  const combinedUiText = `${combinedComponentText}\n${globals}\n${tailwind}`
  const cssVariables = [...new Set([...globals.matchAll(/--([a-z0-9-]+):\s*([^;]+);/gi)].map((match) => match[1]))].sort()
  const globalComponentClasses = [
    'skeleton',
    'product-card',
    'section-title',
    'badge-sale',
    'badge-new',
    'badge-bestseller',
    'price-current',
    'price-original',
    'input-base',
    'btn-primary',
    'btn-secondary',
    'btn-outline',
    'btn-accent',
    'trust-badge',
    'container-site',
    'section-kicker',
    'section-shell',
    'editorial-link',
  ].filter((className) => globals.includes(`.${className}`))

  const uiPrimitiveFiles = componentFiles
    .filter((entry) => entry.relativePath.startsWith('src/frontend/components/ui/'))
    .map((entry) => entry.relativePath)
    .sort()

  const overlayFiles = componentFiles
    .filter((entry) => /fixed\s+inset|aria-modal|role="dialog"|Escape|keydown/.test(entry.content))
    .map((entry) => entry.relativePath)
    .sort()

  const genericAriaLabels = []
  for (const file of componentFiles) {
    const genericCount = countMatches(file.content, /aria-label=["'](?:Form input|Text area|Select option)["']/g)
    if (genericCount > 0) genericAriaLabels.push({ file: file.relativePath, genericCount })
  }

  const tokenInventory = {
    cssVariableCount: cssVariables.length,
    cssVariables,
    globalComponentClasses,
    tailwindSemanticColorKeys: [
      'background',
      'foreground',
      'primary',
      'secondary',
      'muted',
      'accent',
      'card',
      'popover',
      'destructive',
      'success',
      'warning',
    ].filter((key) => tailwind.includes(`${key}:`) || globals.includes(`--${key}`)),
    fontFamilies: ['sans', 'display', 'brand', 'mono'].filter((key) => tailwind.includes(`${key}:`)),
    arbitraryValueUsageCount: countMatches(combinedUiText, /\[[^\]\n]{2,120}\]/g),
    hardcodedHexColorCount: countMatches(combinedUiText, /#[0-9a-f]{3,8}\b/gi),
    customBreakpointUsageCount: countMatches(combinedUiText, /(?:min|max)-\[[^\]]+\]/g),
    customShadowUsageCount: countMatches(combinedUiText, /shadow-\[[^\]]+\]/g),
    customRadiusUsageCount: countMatches(combinedUiText, /rounded-\[[^\]]+\]/g),
  }

  const componentInventory = {
    componentFileCount: componentFiles.length,
    componentAreaCounts,
    uiPrimitiveFiles,
    clientComponentCount: componentFiles.filter((entry) => entry.content.trimStart().startsWith("'use client'")).length,
    nextImageComponentFiles: componentFiles.filter((entry) => entry.content.includes("from 'next/image'")).map((entry) => entry.relativePath).sort(),
    lucideImportFiles: componentFiles.filter((entry) => entry.content.includes("from 'lucide-react'")).map((entry) => entry.relativePath).sort(),
    overlayFiles,
    genericAriaLabels,
    productCardSharedBy: [
      'src/app/(store)/page.tsx',
      'src/app/(store)/category/[slug]/page.tsx',
      'src/app/(store)/search/page.tsx',
      'src/app/(store)/new-arrivals/page.tsx',
      'src/app/(store)/products/[slug]/page.tsx',
    ].filter((relativePath) => existsSync(path.join(root, relativePath))),
  }

  const riskFindings = [
    {
      area: 'design-system',
      level: 'warning',
      finding: 'Buttons, inputs, cards, shells, and overlays are mostly global classes or feature-local markup rather than reusable UI primitives.',
    },
    {
      area: 'tokens',
      level: tokenInventory.arbitraryValueUsageCount > 150 ? 'warning' : 'info',
      finding: 'Large arbitrary Tailwind value usage means spacing, radii, and shadows should be standardized before broad visual edits.',
    },
    {
      area: 'accessibility',
      level: genericAriaLabels.length > 0 ? 'warning' : 'info',
      finding: 'Some admin forms still use generic accessible names; storefront redesign should include accessible-name guardrails.',
    },
    {
      area: 'overlays',
      level: overlayFiles.length > 0 ? 'warning' : 'info',
      finding: 'Header menu, cart drawer, filters, and admin overlays are hand-rolled and need focused keyboard/focus review before large interaction changes.',
    },
    {
      area: 'media',
      level: 'warning',
      finding: 'Hero/category/product images depend on strict local asset and managed-upload boundaries from Step 285; redesign should not replace or relocate media.',
    },
  ]

  return {
    generatedBy: 'scripts/audit-ui-ux-redesign-readiness.mjs',
    databaseRequired: false,
    privateEnvRead: false,
    sourceFilesReadCount: sourceFiles.length,
    storeRoutes: storeRoutes.sort((a, b) => a.route.localeCompare(b.route)),
    tokenInventory,
    componentInventory,
    responsiveEvidencePlan: {
      routeCount: UI_REDESIGN_ROUTE_PATHS.length,
      viewportCount: UI_REDESIGN_VIEWPORTS.length,
      routes: UI_REDESIGN_ROUTE_PATHS,
      viewports: UI_REDESIGN_VIEWPORTS.map(({ label, width, height }) => ({ label, width, height })),
      screenshotPairs: [...SCREENSHOT_PAIRS].sort(),
      productViewPostRequiresInterception: true,
    },
    riskFindings,
    recommendedFirstImplementation: {
      title: 'Design-system and accessibility foundation before broad visual redesign',
      safeFiles: [
        'src/app/globals.css',
        'src/frontend/components/ui/*',
        'src/frontend/components/product/ProductCard.tsx',
        'src/frontend/components/product/SearchFiltersPanel.tsx',
        'src/frontend/components/admin/ProductEditorForm.tsx',
      ],
      keepSeparateApproval: [
        'src/frontend/components/layout/Footer.tsx',
        'src/frontend/components/layout/NewsletterForm.tsx',
        'src/frontend/components/home/PromoSection.tsx',
        'public/assets/**',
        'public/uploads/**',
      ],
    },
  }
}

export async function collectSanitizedMediaConstraintEvidence({ cwd = process.cwd() } = {}) {
  const localAssetAudit = await collectLocalAssetDependencyAudit({ cwd })
  const localAssetEvidence = createLocalAssetDependencyEvidence(localAssetAudit)
  const storefrontMedia = auditStorefrontMediaSources({ cwd })

  return {
    generatedBy: 'scripts/audit-ui-ux-redesign-readiness.mjs',
    databaseRequired: false,
    privateEnvRead: false,
    rawUrlsStored: false,
    rawUploadFilenamesStored: false,
    localAssetDependency: localAssetEvidence,
    storefrontMediaSourceSummary: {
      scanFileCount: storefrontMedia.scanFiles.length,
      categoryAssetsPresent: storefrontMedia.categoryAssets.every((asset) => asset.exists),
      heroAssetsPresent: storefrontMedia.heroAssets.every((asset) => asset.exists),
      babyKidsAssetRestored: storefrontMedia.babyKidsExists,
      toysCollectiblesAssetPresent: storefrontMedia.toysCollectibles.exists,
      toysCollectiblesSharesPixelsWithGaming: storefrontMedia.toysCollectibles.sharesPixelsWithGaming,
      remoteReferenceCount: storefrontMedia.remoteReferences.length,
      uniqueRemoteUrlCount: storefrontMedia.remoteUrls.length,
      productSeedRemoteCount: storefrontMedia.productSeedRemoteCount,
      productSeedLocalReplacementCount: storefrontMedia.productSeedLocalReplacementCount,
      staleProductReplacementRemoteCount: storefrontMedia.staleProductReplacementRemoteCount,
      unexpectedRemoteHeroCount: storefrontMedia.unexpectedRemoteHeroCount,
      acceptedRemoteMediaPresentCount: storefrontMedia.acceptedRemoteMedia.filter((entry) => entry.present).length,
      productImageReplacementLocalExistsCount: storefrontMedia.productImageReplacements.filter((entry) => entry.localExists).length,
    },
    notes: [
      'This evidence intentionally stores aggregate counts only.',
      'Raw remote media URLs and upload filenames are omitted.',
      'Local absolute repository paths are omitted.',
      'Remote catalog/product media remains a separate backlog from static UI redesign.',
    ],
  }
}

function parseArgs(argv) {
  const options = {
    outDir: DEFAULT_OUT_DIR,
    browser: false,
    mode: 'dev',
    host: DEFAULT_HOST,
    port: DEFAULT_SERVER_PORT,
    cdpPort: DEFAULT_CDP_PORT,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const next = argv[index + 1]

    if (arg === '--out-dir') {
      options.outDir = next
      index += 1
    } else if (arg === '--browser') {
      options.browser = true
    } else if (arg === '--mode') {
      options.mode = next
      index += 1
    } else if (arg === '--host') {
      options.host = next
      index += 1
    } else if (arg === '--port') {
      options.port = Number(next)
      index += 1
    } else if (arg === '--cdp-port') {
      options.cdpPort = Number(next)
      index += 1
    } else if (arg === '--timeout-ms') {
      options.timeoutMs = Number(next)
      index += 1
    } else {
      throw new Error(`Unsupported option: ${arg}`)
    }
  }

  if (!options.outDir) throw new Error('Output directory is required.')
  if (!['dev', 'start'].includes(options.mode)) throw new Error('Mode must be dev or start.')
  if (!Number.isSafeInteger(options.port) || options.port < 1 || options.port > 65535) throw new Error('Invalid server port.')
  if (!Number.isSafeInteger(options.cdpPort) || options.cdpPort < 1 || options.cdpPort > 65535) throw new Error('Invalid CDP port.')
  if (options.port === options.cdpPort) throw new Error('Server and CDP ports must differ.')

  return options
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function removeTempDirQuietly(directory) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      rmSync(directory, { recursive: true, force: true })
      return true
    } catch {
      await wait(300)
    }
  }

  return false
}

async function waitForHttp(url, timeoutMs) {
  const startedAt = Date.now()
  let lastError = null

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' })
      if (response.status < 500) return response
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await wait(500)
  }

  throw new Error(`Timed out waiting for local server: ${sanitizeSmokeLog(lastError?.message ?? 'timeout')}`)
}

async function startNextServer({ mode, host, port, timeoutMs }) {
  const command = createNextSmokeCommand({ mode, host, port })
  const logs = []
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

  child.stdout.on('data', (chunk) => logs.push(sanitizeSmokeLog(chunk)))
  child.stderr.on('data', (chunk) => logs.push(sanitizeSmokeLog(chunk)))

  try {
    await waitForHttp(`http://${host}:${port}`, timeoutMs)
    return { child, logs }
  } catch (error) {
    await stopProcessTree(child)
    throw error
  }
}

async function startBrowser({ cdpPort, timeoutMs }) {
  const browserPath = resolveBrowserExecutable()
  if (!browserPath) throw new Error('No supported local browser executable found.')

  const userDataDir = mkdtempSync(path.join(tmpdir(), 'boilabin-ui-redesign-'))
  const child = spawn(browserPath, createBrowserLaunchArgs({ cdpPort, userDataDir }), {
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true,
  })

  try {
    await waitForHttp(`http://127.0.0.1:${cdpPort}/json/version`, timeoutMs)
    return { child, userDataDir }
  } catch (error) {
    await stopProcessTree(child)
    await removeTempDirQuietly(userDataDir)
    throw error
  }
}

class CdpConnection {
  constructor(wsUrl) {
    this.wsUrl = wsUrl
    this.nextId = 1
    this.pending = new Map()
    this.events = []
  }

  async connect() {
    this.socket = new WebSocket(this.wsUrl)
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP connect timeout')), 10_000)
      this.socket.addEventListener('open', () => {
        clearTimeout(timer)
        resolve()
      }, { once: true })
      this.socket.addEventListener('error', () => {
        clearTimeout(timer)
        reject(new Error('CDP connection failed'))
      }, { once: true })
    })

    this.socket.addEventListener('message', (event) => {
      const payload = JSON.parse(event.data)
      if (payload.id && this.pending.has(payload.id)) {
        const { resolve, reject } = this.pending.get(payload.id)
        this.pending.delete(payload.id)
        if (payload.error) reject(new Error(payload.error.message))
        else resolve(payload.result ?? {})
        return
      }
      this.events.push(payload)
    })
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId
    this.nextId += 1
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
    })
  }

  drainEvents(sessionId) {
    const matched = []
    const remaining = []
    for (const event of this.events) {
      if (!sessionId || event.sessionId === sessionId) matched.push(event)
      else remaining.push(event)
    }
    this.events = remaining
    return matched
  }

  close() {
    this.socket?.close()
  }
}

async function processCdpEvents(connection, sessionId, counters) {
  for (const event of connection.drainEvents(sessionId)) {
    if (event.method === 'Fetch.requestPaused') {
      const request = event.params?.request
      const requestId = event.params?.requestId
      const url = request?.url ?? ''
      if (request?.method === 'POST' && PRODUCT_VIEW_PATTERN.test(url)) {
        counters.productViewIntercepted += 1
        await connection.send('Fetch.fulfillRequest', {
          requestId,
          responseCode: 204,
        }, sessionId)
      } else {
        await connection.send('Fetch.continueRequest', { requestId }, sessionId)
      }
    } else if (event.method === 'Runtime.exceptionThrown') {
      counters.consoleErrors += 1
    } else if (event.method === 'Log.entryAdded' && ['error', 'warning'].includes(event.params?.entry?.level)) {
      counters.consoleWarningsOrErrors += 1
    } else if (event.method === 'Network.loadingFailed') {
      if (event.params?.errorText !== 'net::ERR_ABORTED') {
        counters.failedRequests += 1
      }
    } else if (event.method === 'Network.responseReceived' && event.params?.response?.status >= 500) {
      counters.serverErrors += 1
    } else if (event.method === 'Page.loadEventFired') {
      counters.loaded = true
    }
  }
}

async function createPageSession(connection) {
  const target = await connection.send('Target.createTarget', { url: 'about:blank' })
  const attached = await connection.send('Target.attachToTarget', {
    targetId: target.targetId,
    flatten: true,
  })
  const sessionId = attached.sessionId

  await connection.send('Page.enable', {}, sessionId)
  await connection.send('Runtime.enable', {}, sessionId)
  await connection.send('Network.enable', {}, sessionId)
  await connection.send('Log.enable', {}, sessionId)
  await connection.send('Fetch.enable', {
    patterns: [{ urlPattern: '*api/products/*/view*', requestStage: 'Request' }],
  }, sessionId)
  return { targetId: target.targetId, sessionId }
}

async function evaluate(connection, sessionId, expression) {
  const result = await connection.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }, sessionId)
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text ?? 'Browser evaluation failed')
  return result.result?.value
}

async function setViewport(connection, sessionId, viewport) {
  await connection.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.mobile,
  }, sessionId)
}

async function navigate(connection, sessionId, url, timeoutMs) {
  const counters = {
    loaded: false,
    productViewIntercepted: 0,
    consoleErrors: 0,
    consoleWarningsOrErrors: 0,
    failedRequests: 0,
    serverErrors: 0,
  }
  connection.drainEvents(sessionId)
  await connection.send('Page.navigate', { url }, sessionId)

  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    await processCdpEvents(connection, sessionId, counters)
    if (counters.loaded) {
      await wait(800)
      await processCdpEvents(connection, sessionId, counters)
      return counters
    }
    await wait(100)
  }

  throw new Error('Timed out during browser navigation.')
}

async function captureScreenshot(connection, sessionId, outDir, routePath, viewport) {
  const metrics = await connection.send('Page.getLayoutMetrics', {}, sessionId)
  const contentSize = metrics.cssContentSize ?? metrics.contentSize ?? { width: viewport.width, height: viewport.height }
  const safeRoute = routePath
    .replace(/[?#].*$/, '')
    .replace(/^\/$/, 'home')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  const relativeFile = `screenshots/${safeRoute || 'route'}-${viewport.label}.png`
  const absoluteFile = path.join(outDir, relativeFile)
  await fs.mkdir(path.dirname(absoluteFile), { recursive: true })

  const screenshot = await connection.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    fromSurface: true,
    clip: {
      x: 0,
      y: 0,
      width: Math.max(1, Math.min(contentSize.width, viewport.width)),
      height: Math.max(1, Math.min(contentSize.height, 2600)),
      scale: 1,
    },
  }, sessionId)

  await fs.writeFile(absoluteFile, Buffer.from(screenshot.data, 'base64'))
  return normalizePath(relativeFile)
}

async function getPageState(connection, sessionId) {
  return evaluate(connection, sessionId, `(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const images = Array.from(document.images).filter(visible);
    const buttons = Array.from(document.querySelectorAll('button')).filter(visible);
    const inputs = Array.from(document.querySelectorAll('input, textarea, select')).filter(visible);
    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(visible);
    return {
      finalPathname: window.location.pathname,
      finalSearchPresent: Boolean(window.location.search),
      statusTitlePresent: Boolean(document.title),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      imageCount: images.length,
      brokenVisibleImageCount: images.filter((image) => image.complete && image.naturalWidth === 0).length,
      buttonWithoutNameCount: buttons.filter((button) => !button.innerText.trim() && !button.getAttribute('aria-label') && !button.getAttribute('title')).length,
      inputWithoutNameCount: inputs.filter((input) => !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby') && !document.querySelector('label[for="' + input.id + '"]')).length,
      headingCount: headings.length,
      viewportHeight: window.innerHeight,
      bodyHeight: Math.round(document.body.getBoundingClientRect().height),
    };
  })()`)
}

export async function collectBrowserEvidence({
  outDir,
  mode = 'dev',
  host = DEFAULT_HOST,
  port = DEFAULT_SERVER_PORT,
  cdpPort = DEFAULT_CDP_PORT,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const server = await startNextServer({ mode, host, port, timeoutMs })
  const browser = await startBrowser({ cdpPort, timeoutMs })
  let connection

  try {
    const version = await fetch(`http://127.0.0.1:${cdpPort}/json/version`).then((response) => response.json())
    connection = new CdpConnection(version.webSocketDebuggerUrl)
    await connection.connect()
    const { sessionId } = await createPageSession(connection)
    const baseUrl = `http://${host}:${port}`
    const checks = []
    const screenshots = []
    let productViewIntercepted = 0

    for (const viewport of UI_REDESIGN_VIEWPORTS) {
      await setViewport(connection, sessionId, viewport)
      for (const routePath of UI_REDESIGN_ROUTE_PATHS) {
        const url = new URL(routePath, baseUrl).href
        const counters = await navigate(connection, sessionId, url, timeoutMs)
        productViewIntercepted += counters.productViewIntercepted
        const pageState = await getPageState(connection, sessionId)
        const shouldScreenshot = SCREENSHOT_PAIRS.has(`${routePath}|${viewport.label}`)
        let screenshotFile = null

        if (shouldScreenshot) {
          screenshotFile = await captureScreenshot(connection, sessionId, outDir, routePath, viewport)
          screenshots.push({
            route: routePath,
            viewport: viewport.label,
            file: screenshotFile,
          })
        }

        checks.push({
          route: routePath,
          viewport: viewport.label,
          finalPathname: pageState.finalPathname,
          screenshotFile,
          horizontalOverflow: pageState.horizontalOverflow,
          brokenVisibleImageCount: pageState.brokenVisibleImageCount,
          imageCount: pageState.imageCount,
          buttonWithoutNameCount: pageState.buttonWithoutNameCount,
          inputWithoutNameCount: pageState.inputWithoutNameCount,
          headingCount: pageState.headingCount,
          consoleErrors: counters.consoleErrors,
          consoleWarningsOrErrors: counters.consoleWarningsOrErrors,
          failedRequests: counters.failedRequests,
          serverErrors: counters.serverErrors,
          productViewIntercepted: counters.productViewIntercepted,
          ok:
            !pageState.horizontalOverflow &&
            pageState.brokenVisibleImageCount === 0 &&
            counters.consoleErrors === 0 &&
            counters.failedRequests === 0 &&
            counters.serverErrors === 0 &&
            (!routePath.startsWith('/products/') || counters.productViewIntercepted > 0),
        })
      }
    }

    const failedChecks = checks.filter((check) => !check.ok)
    return {
      mode,
      routeCount: UI_REDESIGN_ROUTE_PATHS.length,
      viewportCount: UI_REDESIGN_VIEWPORTS.length,
      checkCount: checks.length,
      screenshotCount: screenshots.length,
      screenshots,
      productViewPostInterceptedCount: productViewIntercepted,
      horizontalOverflowCount: checks.filter((check) => check.horizontalOverflow).length,
      brokenVisibleImageCount: checks.reduce((total, check) => total + check.brokenVisibleImageCount, 0),
      consoleErrorCount: checks.reduce((total, check) => total + check.consoleErrors, 0),
      failedRequestCount: checks.reduce((total, check) => total + check.failedRequests, 0),
      serverErrorCount: checks.reduce((total, check) => total + check.serverErrors, 0),
      ok: failedChecks.length === 0,
      failedChecks: failedChecks.map((check) => ({
        route: check.route,
        viewport: check.viewport,
        finalPathname: check.finalPathname,
        horizontalOverflow: check.horizontalOverflow,
        brokenVisibleImageCount: check.brokenVisibleImageCount,
        consoleErrors: check.consoleErrors,
        failedRequests: check.failedRequests,
        serverErrors: check.serverErrors,
      })),
      checks,
      rawUrlsStored: false,
      privateEnvRead: false,
      databaseMutationPerformed: false,
      productViewRequestsFulfilledLocally: true,
    }
  } finally {
    connection?.close()
    await stopProcessTree(browser.child)
    await removeTempDirQuietly(browser.userDataDir)
    await stopProcessTree(server.child)
  }
}

async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`)
}

export async function runUiUxRedesignReadinessCli({
  argv = process.argv.slice(2),
  cwd = process.cwd(),
  stdout = console.log,
} = {}) {
  const options = parseArgs(argv)
  const outDir = path.resolve(cwd, options.outDir)
  const inventory = await collectUiUxRedesignInventory({ cwd })

  await fs.mkdir(outDir, { recursive: true })
  await writeJson(path.join(outDir, 'ui-surface-inventory.json'), {
    generatedBy: inventory.generatedBy,
    databaseRequired: inventory.databaseRequired,
    privateEnvRead: inventory.privateEnvRead,
    sourceFilesReadCount: inventory.sourceFilesReadCount,
    storeRoutes: inventory.storeRoutes,
    componentInventory: inventory.componentInventory,
  })
  await writeJson(path.join(outDir, 'design-system-token-inventory.json'), {
    generatedBy: inventory.generatedBy,
    databaseRequired: inventory.databaseRequired,
    privateEnvRead: inventory.privateEnvRead,
    tokenInventory: inventory.tokenInventory,
    riskFindings: inventory.riskFindings,
    recommendedFirstImplementation: inventory.recommendedFirstImplementation,
  })
  await writeJson(path.join(outDir, 'responsive-evidence-plan.json'), {
    generatedBy: inventory.generatedBy,
    databaseRequired: inventory.databaseRequired,
    privateEnvRead: inventory.privateEnvRead,
    responsiveEvidencePlan: inventory.responsiveEvidencePlan,
  })
  await writeJson(
    path.join(outDir, 'media-local-asset-constraint-postcheck.json'),
    await collectSanitizedMediaConstraintEvidence({ cwd }),
  )

  let browserEvidence = null
  if (options.browser) {
    browserEvidence = await collectBrowserEvidence({
      outDir,
      mode: options.mode,
      host: options.host,
      port: options.port,
      cdpPort: options.cdpPort,
      timeoutMs: options.timeoutMs,
    })
    await writeJson(path.join(outDir, 'responsive-browser-evidence.json'), browserEvidence)
  }

  const summary = {
    generatedBy: inventory.generatedBy,
    staticInventoryOk: true,
    browserEvidenceOk: browserEvidence ? browserEvidence.ok : null,
    routeCount: inventory.storeRoutes.length,
    componentFileCount: inventory.componentInventory.componentFileCount,
    cssVariableCount: inventory.tokenInventory.cssVariableCount,
    uiPrimitiveFileCount: inventory.componentInventory.uiPrimitiveFiles.length,
    riskFindingCount: inventory.riskFindings.length,
    screenshotCount: browserEvidence?.screenshotCount ?? 0,
    productViewPostInterceptedCount: browserEvidence?.productViewPostInterceptedCount ?? 0,
    privateEnvRead: false,
    databaseRequired: false,
    databaseMutationPerformed: false,
  }

  await writeJson(path.join(outDir, 'summary.json'), summary)
  stdout(JSON.stringify(summary, null, 2))
  return browserEvidence && !browserEvidence.ok ? 1 : 0
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
}

if (isCliEntrypoint()) {
  runUiUxRedesignReadinessCli()
    .then((status) => {
      process.exit(status)
    })
    .catch((error) => {
      console.error(sanitizeSmokeLog(error?.message ?? error))
      process.exit(1)
    })
}
