'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import toast from '@/frontend/lib/toast'
import { BrandWordmark } from '@/frontend/components/layout/BrandWordmark'
import { GoogleSignInButton } from '@/frontend/components/auth/GoogleSignInButton'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { getSafeCallbackUrl } from '@/frontend/utils/safe-callback-url'

const MIN_PASSWORD_LENGTH = 8

type RegisterFormProps = {
  googleOAuthAvailable: boolean
}

export function RegisterForm({ googleOAuthAvailable }: RegisterFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = getSafeCallbackUrl(searchParams.get('callbackUrl'))
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Registration failed'); return }

      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (result?.ok) {
        toast.success('Account created successfully')
        router.push(callbackUrl)
        router.refresh()
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">B</span>
            </div>
            <BrandWordmark className="text-xl text-foreground">Boilabin</BrandWordmark>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-7">
          <h1 className="font-display text-lg font-bold mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Join <BrandWordmark className="text-sm text-foreground">Boilabin</BrandWordmark> to start shopping
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="text-sm font-medium mb-1.5 block">Full name</label>
              <input id="register-name" name="name" type="text" title="Full name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" required className="input-base" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="register-email" className="text-sm font-medium mb-1.5 block">Email</label>
              <input id="register-email" name="email" type="email" title="Email address" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required className="input-base" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="register-password" className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} title="Password" placeholder="Create a password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} required className="input-base pr-10" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground min-[1025px]:hover:text-foreground"
                >
                  <LocalIcon name={showPassword ? 'eye-off' : 'eye'} className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum {MIN_PASSWORD_LENGTH} characters</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full h-11 gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-card text-muted-foreground">or</span></div>
          </div>

          <GoogleSignInButton callbackUrl={callbackUrl} isAvailable={googleOAuthAvailable} />

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account?{' '}
            <Link href={`/auth/login${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-primary font-semibold min-[1025px]:hover:underline">Sign in</Link>
          </p>

          <p className="text-center text-[11px] text-muted-foreground mt-4 leading-relaxed">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="underline">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
