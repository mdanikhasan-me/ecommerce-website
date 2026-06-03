import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'

import {
  createNextSmokeCommand,
  sanitizeSmokeLog,
  stopProcessTree,
} from './local-runtime-smoke.mjs'

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_SERVER_PORT = 3120
const DEFAULT_CDP_PORT = 9320
const DEFAULT_STARTUP_TIMEOUT_MS = 90_000
const DEFAULT_REQUEST_TIMEOUT_MS = 20_000
const REMOVED_STOREFRONT_PATH = `/${'deals'}`
const REMOVED_ADMIN_API_PATH = `/api/admin/${'flash'}-${'sales'}`

export const BROWSER_RUNTIME_ROUTES = [
  '/',
  '/category/electronics',
  '/category/toys-collectibles',
  '/search?q=phone',
  '/new-arrivals',
  '/products/xiaomi-redmi-note-13-pro-256gb',
  '/cart',
  '/track-order',
  REMOVED_STOREFRONT_PATH,
  REMOVED_ADMIN_API_PATH,
]

export const BROWSER_RUNTIME_VIEWPORTS = [
  { label: 'mobile-390', width: 390, height: 844, mobile: true, deviceScaleFactor: 2 },
  { label: 'mobile-430', width: 430, height: 932, mobile: true, deviceScaleFactor: 2 },
  { label: 'tablet-768', width: 768, height: 1024, mobile: false, deviceScaleFactor: 1 },
  { label: 'desktop-1366', width: 1366, height: 768, mobile: false, deviceScaleFactor: 1 },
]

export function parseBrowserCheckArgs(argv = []) {
  const args = {
    mode: 'dev',
    host: DEFAULT_HOST,
    port: DEFAULT_SERVER_PORT,
    cdpPort: DEFAULT_CDP_PORT,
    browser: process.env.BOILABIN_BROWSER_PATH || '',
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
    } else if (arg === '--cdp-port') {
      args.cdpPort = Number(next)
      index += 1
    } else if (arg === '--browser') {
      args.browser = next
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
    throw new Error('Unsupported browser check mode. Use dev or start.')
  }
  if (!Number.isSafeInteger(args.port) || args.port < 1 || args.port > 65535) {
    throw new Error('Server port must be an integer between 1 and 65535.')
  }
  if (!Number.isSafeInteger(args.cdpPort) || args.cdpPort < 1 || args.cdpPort > 65535) {
    throw new Error('CDP port must be an integer between 1 and 65535.')
  }
  if (args.port === args.cdpPort) {
    throw new Error('Server port and CDP port must be different.')
  }
  if (!args.host || /[\s/\\]/.test(args.host)) {
    throw new Error('Host must be a simple hostname or IP address.')
  }
  if (!Number.isFinite(args.startupTimeoutMs) || args.startupTimeoutMs < 5_000) {
    throw new Error('Startup timeout must be at least 5000ms.')
  }
  if (!Number.isFinite(args.requestTimeoutMs) || args.requestTimeoutMs < 1_000) {
    throw new Error('Request timeout must be at least 1000ms.')
  }

  return args
}

export function getBrowserCandidates() {
  if (process.platform === 'win32') {
    return [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ]
  }

  if (process.platform === 'darwin') {
    return [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ]
  }

  return [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ]
}

export function resolveBrowserExecutable(explicitPath = '') {
  if (explicitPath) return explicitPath

  for (const candidate of getBrowserCandidates()) {
    const result = spawnSync(process.platform === 'win32' ? 'cmd.exe' : 'test', process.platform === 'win32'
      ? ['/d', '/s', '/c', `if exist "${candidate}" exit 0 else exit 1`]
      : ['-x', candidate], {
      stdio: 'ignore',
      windowsHide: true,
    })
    if (result.status === 0) return candidate
  }

  return null
}

export function createBrowserLaunchArgs({ cdpPort, userDataDir, headless = true }) {
  return [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-sync',
    '--disable-extensions',
    '--disable-component-update',
    '--disable-features=Translate,MediaRouter',
    '--mute-audio',
    '--window-size=1366,768',
    ...(headless ? ['--headless=new', '--disable-gpu'] : []),
    'about:blank',
  ]
}

function wait(ms) {
  return new Promise((resolveWait) => setTimeout(resolveWait, ms))
}

async function waitForHttp(url, timeoutMs) {
  const startedAt = Date.now()
  let lastError = null

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.status < 500) return response
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await wait(500)
  }

  throw new Error(`Timed out waiting for ${url}: ${lastError?.message ?? 'unknown error'}`)
}

async function startNextServer({ mode, host, port, startupTimeoutMs }) {
  const command = createNextSmokeCommand({ mode, host, port })
  const child = spawn(command.command, command.args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      PORT: String(port),
    },
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true,
  })

  child.once('error', () => {})
  await waitForHttp(`http://${host}:${port}`, startupTimeoutMs)
  return child
}

async function startBrowser({ browserPath, cdpPort, startupTimeoutMs }) {
  const userDataDir = mkdtempSync(join(tmpdir(), 'boilabin-browser-smoke-'))
  const child = spawn(browserPath, createBrowserLaunchArgs({ cdpPort, userDataDir }), {
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true,
  })

  child.once('error', () => {})
  await waitForHttp(`http://127.0.0.1:${cdpPort}/json/version`, startupTimeoutMs)

  return {
    child,
    userDataDir,
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
    await new Promise((resolveConnect, rejectConnect) => {
      const timer = setTimeout(() => rejectConnect(new Error('CDP WebSocket connect timeout')), 10_000)
      this.socket.addEventListener('open', () => {
        clearTimeout(timer)
        resolveConnect()
      }, { once: true })
      this.socket.addEventListener('error', () => {
        clearTimeout(timer)
        rejectConnect(new Error('CDP WebSocket connection failed'))
      }, { once: true })
    })

    this.socket.addEventListener('message', (event) => {
      const payload = JSON.parse(event.data)
      if (payload.id && this.pending.has(payload.id)) {
        const { resolveCommand, rejectCommand } = this.pending.get(payload.id)
        this.pending.delete(payload.id)
        if (payload.error) rejectCommand(new Error(payload.error.message))
        else resolveCommand(payload.result ?? {})
        return
      }
      this.events.push(payload)
    })
  }

  send(method, params = {}, sessionId = undefined) {
    const id = this.nextId
    this.nextId += 1

    return new Promise((resolveCommand, rejectCommand) => {
      this.pending.set(id, { resolveCommand, rejectCommand })
      this.socket.send(JSON.stringify({
        id,
        method,
        params,
        ...(sessionId ? { sessionId } : {}),
      }))
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
  return { targetId: target.targetId, sessionId }
}

async function navigateAndWait(connection, sessionId, url, timeoutMs) {
  connection.drainEvents(sessionId)
  await connection.send('Page.navigate', { url }, sessionId)

  const startedAt = Date.now()
  let loaded = false
  while (Date.now() - startedAt < timeoutMs) {
    for (const event of connection.drainEvents(sessionId)) {
      if (event.method === 'Page.loadEventFired') loaded = true
      connection.events.push(event)
    }
    if (loaded) {
      await wait(500)
      await waitForExpression(connection, sessionId, 'document.readyState === "complete"', 2_500)
      return
    }
    await wait(100)
  }

  throw new Error(`Timed out loading ${url}`)
}

async function evaluate(connection, sessionId, expression) {
  const result = await connection.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }, sessionId)

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text ?? 'Browser evaluation failed')
  }

  return result.result?.value
}

async function waitForExpression(connection, sessionId, expression, timeoutMs, intervalMs = 100) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      if (await evaluate(connection, sessionId, expression)) return true
    } catch {
      // Keep polling while hydration/navigation settles.
    }
    await wait(intervalMs)
  }
  return false
}

async function setViewport(connection, sessionId, viewport) {
  await connection.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile: viewport.mobile,
  }, sessionId)
}

function summarizePageEvents(events) {
  const consoleErrors = []
  const warningMessages = []
  const failedRequests = []
  const serverErrors = []
  const imageFailures = []

  for (const event of events) {
    if (event.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(sanitizeSmokeLog(event.params?.exceptionDetails?.text ?? 'runtime exception'))
    } else if (event.method === 'Runtime.consoleAPICalled') {
      const args = event.params?.args ?? []
      const message = sanitizeSmokeLog(args.map((arg) => arg.value ?? arg.description ?? '').join(' '))
      if (event.params?.type === 'error') consoleErrors.push(message)
      if (event.params?.type === 'warning' || event.params?.type === 'warn') warningMessages.push(message)
    } else if (event.method === 'Log.entryAdded') {
      const entry = event.params?.entry
      const message = sanitizeSmokeLog(entry?.text ?? '')
      if (entry?.level === 'error') consoleErrors.push(message)
      if (entry?.level === 'warning') warningMessages.push(message)
    } else if (event.method === 'Network.loadingFailed') {
      const errorText = event.params?.errorText ?? 'request failed'
      if (errorText !== 'net::ERR_ABORTED') {
        failedRequests.push(sanitizeSmokeLog(errorText))
      }
    } else if (event.method === 'Network.responseReceived') {
      const response = event.params?.response
      const status = response?.status ?? 0
      const url = response?.url ?? ''
      if (status >= 500) serverErrors.push(`${status} ${sanitizeSmokeLog(url)}`)
      if (event.params?.type === 'Image' && status >= 400) imageFailures.push(`${status} ${sanitizeSmokeLog(url)}`)
    }
  }

  const relevantWarnings = warningMessages.filter((message) =>
    /next\/image|image|lcp|largest contentful paint|priority|preload|quality/i.test(message)
  )

  return {
    consoleErrors,
    relevantWarnings,
    failedRequests,
    serverErrors,
    imageFailures,
  }
}

function normalizePageEventsForPath(events, path) {
  const removedRoute = path === REMOVED_STOREFRONT_PATH || path === REMOVED_ADMIN_API_PATH

  if (!removedRoute) return events

  return {
    ...events,
    consoleErrors: events.consoleErrors.filter((message) => !/404\s*\(not found\)/i.test(message)),
  }
}

const pageCheckExpression = `(() => {
  const allImagePreloads = Array.from(document.querySelectorAll('link[rel="preload"][as="image"]'))
    .map((link) => link.href);
  const productImagePreloads = allImagePreloads.filter((href) => {
    const decoded = decodeURIComponent(href);
    return decoded.includes('/_next/image') &&
      !decoded.includes('/assets/branding/') &&
      !decoded.includes('/assets/banners/');
  });
  const brokenImages = Array.from(document.images)
    .filter((image) => {
      const rect = image.getBoundingClientRect();
      const style = window.getComputedStyle(image);
      const visible = rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      return visible && image.complete && image.naturalWidth === 0;
    })
    .map((image) => image.currentSrc || image.src)
    .slice(0, 5);
  return {
    title: document.title,
    url: location.href,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    imageCount: document.images.length,
    brokenImages,
    allImagePreloadCount: allImagePreloads.length,
    productImagePreloadCount: productImagePreloads.length,
    productImagePreloads: productImagePreloads.slice(0, 3).map((href) => decodeURIComponent(href).slice(0, 180)),
    robots: document.querySelector('meta[name="robots"]')?.content || '',
    namedInputs: Array.from(document.querySelectorAll('input, textarea, select'))
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        type: element.getAttribute('type') || '',
        ariaLabel: element.getAttribute('aria-label') || '',
        placeholder: element.getAttribute('placeholder') || '',
        title: element.getAttribute('title') || '',
        id: element.id || '',
      }))
      .filter((entry) => entry.ariaLabel || entry.placeholder || entry.title || entry.id)
      .length,
    unnamedButtons: Array.from(document.querySelectorAll('button'))
      .filter((button) => {
        const label = (button.getAttribute('aria-label') || button.getAttribute('title') || button.textContent || '').trim();
        return !label;
      }).length,
  };
})()`

async function runPageChecks({ connection, sessionId, baseUrl, requestTimeoutMs }) {
  const results = []

  for (const viewport of BROWSER_RUNTIME_VIEWPORTS) {
    for (const path of BROWSER_RUNTIME_ROUTES) {
      await setViewport(connection, sessionId, viewport)
      await navigateAndWait(connection, sessionId, new URL(path, baseUrl).href, requestTimeoutMs)
      const pageState = await evaluate(connection, sessionId, pageCheckExpression)
      const events = normalizePageEventsForPath(summarizePageEvents(connection.drainEvents(sessionId)), path)
      const listingPage = ['/category/electronics', '/category/toys-collectibles', '/search?q=phone', '/new-arrivals'].includes(path)
      const prioritySpam = listingPage && pageState.productImagePreloadCount > 1
      const ok = !pageState.horizontalOverflow &&
        pageState.brokenImages.length === 0 &&
        !prioritySpam &&
        events.consoleErrors.length === 0 &&
        events.failedRequests.length === 0 &&
        events.serverErrors.length === 0 &&
        events.imageFailures.length === 0 &&
        events.relevantWarnings.length === 0

      results.push({
        path,
        viewport: viewport.label,
        ok,
        status: path === REMOVED_STOREFRONT_PATH || path === REMOVED_ADMIN_API_PATH ? 'removed-route-checked' : 'rendered',
        horizontalOverflow: pageState.horizontalOverflow,
        brokenImages: pageState.brokenImages,
        imageCount: pageState.imageCount,
        allImagePreloadCount: pageState.allImagePreloadCount,
        productImagePreloadCount: pageState.productImagePreloadCount,
        prioritySpam,
        robots: pageState.robots,
        unnamedButtons: pageState.unnamedButtons,
        namedInputs: pageState.namedInputs,
        ...events,
      })
    }
  }

  return results
}

async function pressKey(connection, sessionId, key) {
  await connection.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key,
    code: key === 'Escape' ? 'Escape' : key,
    windowsVirtualKeyCode: key === 'Escape' ? 27 : 0,
  }, sessionId)
  await connection.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key,
    code: key === 'Escape' ? 'Escape' : key,
    windowsVirtualKeyCode: key === 'Escape' ? 27 : 0,
  }, sessionId)
}

async function clickFirstVisibleSelector(connection, sessionId, selector) {
  const center = await evaluate(connection, sessionId, `(() => {
    const elements = Array.from(document.querySelectorAll(${JSON.stringify(selector)}));
    const element = elements.find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      const style = window.getComputedStyle(candidate);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    });
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  })()`)

  if (!center) return false

  await connection.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: center.x,
    y: center.y,
  }, sessionId)
  await connection.send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x: center.x,
    y: center.y,
    button: 'left',
    clickCount: 1,
  }, sessionId)
  await connection.send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x: center.x,
    y: center.y,
    button: 'left',
    clickCount: 1,
  }, sessionId)
  return true
}

async function insertText(connection, sessionId, text) {
  await connection.send('Input.insertText', { text }, sessionId)
}

async function runAccessibilityChecks({ connection, sessionId, baseUrl, requestTimeoutMs }) {
  const checks = []

  await setViewport(connection, sessionId, BROWSER_RUNTIME_VIEWPORTS[0])
  await navigateAndWait(connection, sessionId, new URL('/', baseUrl).href, requestTimeoutMs)
  await wait(800)
  await clickFirstVisibleSelector(connection, sessionId, 'input[type="search"]')
  await insertText(connection, sessionId, 'phone')
  await wait(900)
  const searchOpen = await evaluate(connection, sessionId, `(() => {
    const roots = Array.from(document.querySelectorAll('[data-search-root="true"]'));
    const root = roots.find((candidate) => candidate.getBoundingClientRect().width > 0) || roots[0];
    return {
      focused: document.activeElement?.matches('input[type="search"]') || false,
      query: document.activeElement?.value || '',
      suggestionLinks: root ? root.querySelectorAll('a[href^="/products/"], a[href^="/search"]').length : 0,
    };
  })()`)
  await pressKey(connection, sessionId, 'Escape')
  await wait(250)
  const searchClosed = await evaluate(connection, sessionId, `(() => {
    const roots = Array.from(document.querySelectorAll('[data-search-root="true"]'));
    const root = roots.find((candidate) => candidate.getBoundingClientRect().width > 0) || roots[0];
    return {
      suggestionLinks: root ? root.querySelectorAll('a[href^="/products/"], a[href^="/search"]').length : 0,
      focused: document.activeElement?.matches('input[type="search"]') || false,
    };
  })()`)
  checks.push({
    label: 'mobile search focus and Escape',
    ok: searchOpen.focused && searchOpen.query.includes('phone') && searchClosed.suggestionLinks === 0,
    details: { searchOpen, searchClosed },
  })

  const menuButtonClicked = await clickFirstVisibleSelector(connection, sessionId, 'button[aria-label="Open menu"]')
  await wait(600)
  const menuOpen = await evaluate(connection, sessionId, `(() => ({
    beforeFound: ${JSON.stringify(menuButtonClicked)},
    activeLabel: document.activeElement?.getAttribute('aria-label') || '',
    hasCloseButton: Boolean(document.querySelector('button[aria-label="Close menu"]')),
  }))()`)
  await pressKey(connection, sessionId, 'Escape')
  await wait(600)
  const menuClosed = await evaluate(connection, sessionId, `(() => {
    const button = document.querySelector('button[aria-label="Open menu"]');
    return {
      openButtonFound: Boolean(button),
      activeLabel: document.activeElement?.getAttribute('aria-label') || '',
      hasCloseButton: Boolean(document.querySelector('button[aria-label="Close menu"]')),
    };
  })()`)
  checks.push({
    label: 'mobile menu Escape close',
    ok: menuOpen.beforeFound && menuOpen.hasCloseButton && menuClosed.openButtonFound && !menuClosed.hasCloseButton,
    details: { menuOpen, menuClosed },
  })

  await setViewport(connection, sessionId, BROWSER_RUNTIME_VIEWPORTS[3])
  await navigateAndWait(connection, sessionId, new URL('/', baseUrl).href, requestTimeoutMs)
  await wait(800)
  const cartButtonClicked = await clickFirstVisibleSelector(connection, sessionId, 'button[aria-label="Cart"]')
  await wait(600)
  const cartOpen = await evaluate(connection, sessionId, `(() => ({
    buttonFound: ${JSON.stringify(cartButtonClicked)},
    closeFound: Boolean(document.querySelector('button[aria-label="Close cart"]')),
    overflow: document.body.style.overflow || '',
  }))()`)
  await pressKey(connection, sessionId, 'Escape')
  await wait(600)
  const cartClosed = await evaluate(connection, sessionId, `(() => ({
    closeFound: Boolean(document.querySelector('button[aria-label="Close cart"]')),
    overflow: document.body.style.overflow || '',
  }))()`)
  checks.push({
    label: 'cart drawer Escape and scroll lock cleanup',
    ok: cartOpen.buttonFound && cartOpen.closeFound && cartOpen.overflow === 'hidden' && cartClosed.overflow !== 'hidden',
    details: { cartOpen, cartClosed },
  })

  for (const path of ['/auth/login', '/auth/register', '/track-order']) {
    await navigateAndWait(connection, sessionId, new URL(path, baseUrl).href, requestTimeoutMs)
    const formState = await evaluate(connection, sessionId, `(() => {
      const controls = Array.from(document.querySelectorAll('input, textarea, select, button'));
      const unnamed = controls.filter((element) => {
        const label = (element.getAttribute('aria-label') || element.getAttribute('title') || element.getAttribute('placeholder') || element.textContent || '').trim();
        return !label;
      }).length;
      return {
        controls: controls.length,
        unnamed,
        robots: document.querySelector('meta[name="robots"]')?.content || '',
        bodyHasDeliveryPhrase: /delivery address|phone number|customer email/i.test(document.body.textContent || ''),
      };
    })()`)
    checks.push({
      label: `${path} public form/accessibility sanity`,
      ok: formState.controls > 0 && formState.unnamed === 0 && (path !== '/track-order' || formState.robots.includes('noindex')),
      details: formState,
    })
  }

  await navigateAndWait(connection, sessionId, new URL('/checkout', baseUrl).href, requestTimeoutMs)
  const checkoutState = await evaluate(connection, sessionId, `(() => ({
    path: location.pathname,
    search: location.search,
    hasPasswordInput: Boolean(document.querySelector('input[type="password"]')),
  }))()`)
  checks.push({
    label: 'checkout unauthenticated redirect',
    ok: checkoutState.path === '/auth/login' &&
      (checkoutState.search.includes('callbackUrl=%2Fcheckout') || checkoutState.search.includes('callbackUrl=/checkout')),
    details: checkoutState,
  })

  return checks
}

async function runBrowserRuntimeCheck(options) {
  const browserPath = resolveBrowserExecutable(options.browser)
  if (!browserPath) throw new Error('No supported local browser executable found.')

  const baseUrl = `http://${options.host}:${options.port}`
  let serverProcess = null
  let browserProcess = null
  let userDataDir = null
  let connection = null

  try {
    serverProcess = await startNextServer(options)
    const browser = await startBrowser({
      browserPath,
      cdpPort: options.cdpPort,
      startupTimeoutMs: options.startupTimeoutMs,
    })
    browserProcess = browser.child
    userDataDir = browser.userDataDir

    const versionResponse = await fetch(`http://127.0.0.1:${options.cdpPort}/json/version`)
    const version = await versionResponse.json()
    connection = new CdpConnection(version.webSocketDebuggerUrl)
    await connection.connect()

    const { targetId, sessionId } = await createPageSession(connection)
    const pageResults = await runPageChecks({
      connection,
      sessionId,
      baseUrl,
      requestTimeoutMs: options.requestTimeoutMs,
    })
    const accessibilityResults = await runAccessibilityChecks({
      connection,
      sessionId,
      baseUrl,
      requestTimeoutMs: options.requestTimeoutMs,
    })

    await connection.send('Target.closeTarget', { targetId })

    return {
      mode: options.mode,
      baseUrl,
      browser: browserPath.replace(/^.*[\\/]/, ''),
      ok: pageResults.every((result) => result.ok) && accessibilityResults.every((result) => result.ok),
      pageResults,
      accessibilityResults,
    }
  } finally {
    connection?.close()
    if (browserProcess) await stopProcessTree(browserProcess)
    if (serverProcess) await stopProcessTree(serverProcess)
    if (userDataDir) rmSync(userDataDir, { recursive: true, force: true })
  }
}

function isCliEntrypoint() {
  return Boolean(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
}

if (isCliEntrypoint()) {
  runBrowserRuntimeCheck(parseBrowserCheckArgs(process.argv.slice(2))).then((result) => {
    console.log(JSON.stringify(result, null, 2))
    if (!result.ok) process.exitCode = 1
  }).catch((error) => {
    console.error(sanitizeSmokeLog(error?.message ?? error))
    process.exitCode = 1
  })
}

export { runBrowserRuntimeCheck }
