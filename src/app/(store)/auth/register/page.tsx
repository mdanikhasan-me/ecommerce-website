import { Suspense } from 'react'
import { RegisterForm } from '@/frontend/components/auth/RegisterForm'
import { isGoogleOAuthConfigured } from '@/backend/auth/google-oauth'

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm googleOAuthAvailable={isGoogleOAuthConfigured()} />
    </Suspense>
  )
}
