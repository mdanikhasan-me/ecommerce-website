'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import toast from '@/frontend/lib/toast'
import { GoogleSignInButton } from '@/frontend/components/auth/GoogleSignInButton'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'
import { LocalIcon } from '@/frontend/components/ui/LocalIcon'
import { refreshClientSession } from '@/frontend/hooks/useClientSession'

interface LoginFormProps {
  callbackUrl: string
  reason?: string | null
  googleOAuthAvailable: boolean
}

export function LoginForm({ callbackUrl, reason, googleOAuthAvailable }: LoginFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (result?.error) {
        toast.error('Invalid email or password')
        return
      }
      toast.success('Welcome back!')
      const session = await refreshClientSession()
      if (!session?.user) {
        window.location.replace(callbackUrl)
        return
      }

      router.replace(callbackUrl)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex">
            <BoilabinLogo variant="full" size={82} priority />
          </Link>
        </div>

        {/* Checkout gate message */}
        {reason === 'checkout' && (
          <div className="flex items-start gap-3 bg-accent/10 border border-accent/20 rounded-lg p-3.5 mb-5">
            <LocalIcon name="shopping-bag" className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Sign in to complete your order</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your cart items are saved and ready for checkout.</p>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6 sm:p-7">
          <h1 className="font-display text-lg font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your account to continue</p>

          <form action="/auth/login" method="post" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                title="Email address"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="input-base"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm font-medium">Password</label>
                <Link href="/contact" className="text-xs text-accent min-[1025px]:hover:underline">
                  Need help?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  title="Password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  className="input-base pr-10"
                  autoComplete="current-password"
                />
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
            </div>

            <button type="submit" disabled={!isHydrated || loading} className="btn-primary w-full h-11 gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-card text-muted-foreground">or</span></div>
          </div>

          <GoogleSignInButton callbackUrl={callbackUrl} isAvailable={googleOAuthAvailable} />

          <p className="text-center text-sm text-muted-foreground mt-5">
            New to <span className="font-semibold text-foreground">Boilabin</span>?{' '}
            <Link href={`/auth/register${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-primary font-semibold min-[1025px]:hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
