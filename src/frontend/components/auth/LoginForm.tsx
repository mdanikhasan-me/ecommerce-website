'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { BoilabinLogo } from '@/frontend/components/layout/BoilabinLogo'

interface LoginFormProps {
  callbackUrl: string
  reason?: string | null
}

export function LoginForm({ callbackUrl, reason }: LoginFormProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

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
      router.push(callbackUrl)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    setGoogleLoading(true)
    signIn('google', { callbackUrl })
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
            <ShoppingBag className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Sign in to complete your order</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your cart items are saved and ready for checkout.</p>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6 sm:p-7">
          <h1 className="font-display text-lg font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Link href="/contact" className="text-xs text-accent hover:underline">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full h-11 gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-card text-muted-foreground">or</span></div>
          </div>

          <button type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="btn-outline w-full h-11 gap-2"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <p className="text-center text-sm text-muted-foreground mt-5">
            New to <span className="font-semibold text-foreground">Boilabin</span>?{' '}
            <Link href={`/auth/register${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-primary font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
