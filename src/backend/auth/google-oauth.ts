type GoogleOAuthEnv = Record<string, string | undefined>

export type GoogleOAuthValueStatus = 'missing' | 'empty' | 'placeholder' | 'invalid-format' | 'present'

export type GoogleOAuthCredentialStatus = {
  isConfigured: boolean
  clientIdStatus: GoogleOAuthValueStatus
  clientSecretStatus: GoogleOAuthValueStatus
  requiredEnv: readonly ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
  expectedRedirectUri: string | null
}

const GOOGLE_CLIENT_ID_PATTERN = /^[a-z0-9-]+\.apps\.googleusercontent\.com$/i
const PLACEHOLDER_PATTERNS = [
  /^local-/i,
  /^replace-/i,
  /^placeholder/i,
  /^client-id$/i,
  /^client-secret$/i,
  /^changeme$/i,
  /^dummy/i,
  /^test$/i,
  /example/i,
  /google-client-id/i,
  /google-client-secret/i,
]

function normalizeEnvValue(value: string | undefined) {
  return value?.trim().replace(/^['"]|['"]$/g, '') ?? ''
}

function isPlaceholderValue(value: string) {
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value))
}

function parseOrigin(value: string | undefined) {
  const trimmed = normalizeEnvValue(value)
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.username || url.password) return null
    return url.origin
  } catch {
    return null
  }
}

export function getExpectedGoogleOAuthRedirectUri(env: GoogleOAuthEnv = process.env) {
  const origin = parseOrigin(env.AUTH_URL) ?? parseOrigin(env.NEXTAUTH_URL)
  return origin ? `${origin}/api/auth/callback/google` : null
}

export function classifyGoogleOAuthClientId(value: string | undefined): GoogleOAuthValueStatus {
  const normalized = normalizeEnvValue(value)
  if (value === undefined) return 'missing'
  if (!normalized) return 'empty'
  if (isPlaceholderValue(normalized)) return 'placeholder'
  if (!GOOGLE_CLIENT_ID_PATTERN.test(normalized)) return 'invalid-format'
  return 'present'
}

export function classifyGoogleOAuthClientSecret(value: string | undefined): GoogleOAuthValueStatus {
  const normalized = normalizeEnvValue(value)
  if (value === undefined) return 'missing'
  if (!normalized) return 'empty'
  if (isPlaceholderValue(normalized)) return 'placeholder'
  return 'present'
}

export function getGoogleOAuthCredentialStatus(env: GoogleOAuthEnv = process.env): GoogleOAuthCredentialStatus {
  const clientIdStatus = classifyGoogleOAuthClientId(env.GOOGLE_CLIENT_ID)
  const clientSecretStatus = classifyGoogleOAuthClientSecret(env.GOOGLE_CLIENT_SECRET)

  return {
    isConfigured: clientIdStatus === 'present' && clientSecretStatus === 'present',
    clientIdStatus,
    clientSecretStatus,
    requiredEnv: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    expectedRedirectUri: getExpectedGoogleOAuthRedirectUri(env),
  }
}

export function isGoogleOAuthConfigured(env: GoogleOAuthEnv = process.env) {
  return getGoogleOAuthCredentialStatus(env).isConfigured
}

export function getGoogleOAuthCredentials(env: GoogleOAuthEnv = process.env) {
  if (!isGoogleOAuthConfigured(env)) return null

  return {
    clientId: normalizeEnvValue(env.GOOGLE_CLIENT_ID),
    clientSecret: normalizeEnvValue(env.GOOGLE_CLIENT_SECRET),
  }
}
