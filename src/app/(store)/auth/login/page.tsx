import { LoginForm } from '@/frontend/components/auth/LoginForm'
import { getSafeCallbackUrl } from '@/frontend/utils/safe-callback-url'
import { isGoogleOAuthConfigured } from '@/backend/auth/google-oauth'

type LoginSearchParams = {
  callbackUrl?: string | string[]
  reason?: string | string[]
}

interface LoginPageProps {
  searchParams?: Promise<LoginSearchParams>
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const callbackUrl = getSafeCallbackUrl(firstParam(resolvedSearchParams.callbackUrl))
  const reason = firstParam(resolvedSearchParams.reason)

  return (
    <LoginForm
      callbackUrl={callbackUrl}
      reason={reason}
      googleOAuthAvailable={isGoogleOAuthConfigured()}
    />
  )
}
