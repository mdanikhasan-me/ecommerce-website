import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import {
  classifyGoogleOAuthClientId,
  classifyGoogleOAuthClientSecret,
  getExpectedGoogleOAuthRedirectUri,
  getGoogleOAuthCredentials,
  getGoogleOAuthCredentialStatus,
  isGoogleOAuthConfigured,
} from '@/backend/auth/google-oauth'

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('google oauth configuration guardrails', () => {
  it('disables Google OAuth for placeholder, missing, and invalid local values', () => {
    assert.equal(classifyGoogleOAuthClientId(undefined), 'missing')
    assert.equal(classifyGoogleOAuthClientId(''), 'empty')
    assert.equal(classifyGoogleOAuthClientId('local-google-client-id'), 'placeholder')
    assert.equal(classifyGoogleOAuthClientId('not-a-google-client'), 'invalid-format')

    assert.equal(classifyGoogleOAuthClientSecret(undefined), 'missing')
    assert.equal(classifyGoogleOAuthClientSecret(''), 'empty')
    assert.equal(classifyGoogleOAuthClientSecret('local-google-client-secret'), 'placeholder')

    assert.equal(
      isGoogleOAuthConfigured({
        GOOGLE_CLIENT_ID: 'local-google-client-id',
        GOOGLE_CLIENT_SECRET: 'local-google-client-secret',
        AUTH_URL: 'http://localhost:3000',
      }),
      false,
    )
    assert.equal(
      isGoogleOAuthConfigured({
        GOOGLE_CLIENT_ID: '1234567890-abc.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: 'real-looking-secret-value',
        AUTH_URL: 'http://localhost:3000',
      }),
      true,
    )
  })

  it('returns the local Google callback URI from the configured auth origin', () => {
    assert.equal(
      getExpectedGoogleOAuthRedirectUri({
        AUTH_URL: 'http://localhost:3000',
      }),
      'http://localhost:3000/api/auth/callback/google',
    )
    assert.equal(
      getExpectedGoogleOAuthRedirectUri({
        NEXTAUTH_URL: 'http://127.0.0.1:3100',
      }),
      'http://127.0.0.1:3100/api/auth/callback/google',
    )
  })

  it('returns Google credentials only when both values are real enough to use', () => {
    assert.equal(getGoogleOAuthCredentials({}), null)
    assert.equal(
      getGoogleOAuthCredentials({
        GOOGLE_CLIENT_ID: 'local-google-client-id',
        GOOGLE_CLIENT_SECRET: 'local-google-client-secret',
      }),
      null,
    )

    assert.deepEqual(
      getGoogleOAuthCredentials({
        GOOGLE_CLIENT_ID: '1234567890-abc.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: 'real-looking-secret-value',
      }),
      {
        clientId: '1234567890-abc.apps.googleusercontent.com',
        clientSecret: 'real-looking-secret-value',
      },
    )

    assert.deepEqual(
      getGoogleOAuthCredentialStatus({
        GOOGLE_CLIENT_ID: '1234567890-abc.apps.googleusercontent.com',
        GOOGLE_CLIENT_SECRET: 'real-looking-secret-value',
        AUTH_URL: 'http://localhost:3000',
      }),
      {
        isConfigured: true,
        clientIdStatus: 'present',
        clientSecretStatus: 'present',
        requiredEnv: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
        expectedRedirectUri: 'http://localhost:3000/api/auth/callback/google',
      },
    )
  })

  it('documents safe placeholder-free local OAuth setup in examples and README', () => {
    const envExample = readRepoFile('.env.example')
    const localEnvExample = readRepoFile('.env.local.example')
    const readme = readRepoFile('README.md')

    for (const source of [envExample, localEnvExample]) {
      assert.match(source, /GOOGLE_CLIENT_ID=""$/m)
      assert.match(source, /GOOGLE_CLIENT_SECRET=""$/m)
      assert.doesNotMatch(source, /local-google-client-id/i)
      assert.doesNotMatch(source, /local-google-client-secret/i)
    }

    assert.match(readme, /Google sign-in setup/)
    assert.match(readme, /api\/auth\/callback\/google/)
    assert.match(readme, /GOOGLE_CLIENT_ID/)
    assert.match(readme, /GOOGLE_CLIENT_SECRET/)
  })

  it('wires login and register pages to the safe Google availability gate', () => {
    const authIndex = readRepoFile('src/backend/auth/index.ts')
    const loginPage = readRepoFile('src/app/(store)/auth/login/page.tsx')
    const loginForm = readRepoFile('src/frontend/components/auth/LoginForm.tsx')
    const registerPage = readRepoFile('src/app/(store)/auth/register/page.tsx')
    const registerForm = readRepoFile('src/frontend/components/auth/RegisterForm.tsx')
    const header = readRepoFile('src/frontend/components/layout/Header.tsx')

    assert.match(authIndex, /getGoogleOAuthCredentials\(\)/)
    assert.match(authIndex, /\.\.\.\(googleOAuthCredentials \? \[GoogleProvider\(googleOAuthCredentials\)\] : \[\]\)/)
    assert.doesNotMatch(authIndex, /process\.env\.GOOGLE_CLIENT_ID!/)
    assert.doesNotMatch(authIndex, /process\.env\.GOOGLE_CLIENT_SECRET!/)

    assert.match(loginPage, /isGoogleOAuthConfigured\(\)/)
    assert.match(loginForm, /<GoogleSignInButton callbackUrl=\{callbackUrl\} isAvailable=\{googleOAuthAvailable\} \/>/)

    assert.match(registerPage, /isGoogleOAuthConfigured\(\)/)
    assert.match(registerForm, /<GoogleSignInButton callbackUrl=\{callbackUrl\} isAvailable=\{googleOAuthAvailable\} \/>/)

    assert.match(header, /function HeaderAvatar\(/)
    assert.match(header, /if \(!normalizedImageUrl \|\| hasImageError\)/)
    assert.match(header, /onError=\{\(\) => setHasImageError\(true\)\}/)
    assert.match(header, /<LocalIcon name="user" className=\{iconClassName\} \/>/)
  })
})
