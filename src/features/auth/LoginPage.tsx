import { Link, useRouter } from '@tanstack/react-router'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import warehouseImage from '../../assets/auth/warehouse-dusk.webp'
import { Alert, Button, Field } from '../../components/ui'
import { ApiError } from '../../lib/api/client'
import { loginInputSchema } from '../../lib/api/schemas'
import { useLogin } from '../../lib/auth/hooks'
import { publicSiteUrl } from '../../lib/publicSite'

export function LoginPage() {
  const router = useRouter()
  const login = useLogin()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const parsed = loginInputSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form')
        fieldErrors[key] ??= issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    login.mutate(parsed.data, {
      onSuccess: (user) => {
        if (user.must_change_password) {
          router.navigate({ to: '/change-initial-password' })
          return
        }
        const redirect = new URLSearchParams(window.location.search).get('redirect')
        if (redirect && redirect.startsWith('/')) {
          window.location.assign(redirect)
          return
        }
        router.navigate({ to: '/app' })
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          const fieldErrors: Record<string, string> = {}
          for (const [field, messages] of Object.entries(error.details)) {
            fieldErrors[field] = messages[0]
          }
          setErrors({ ...fieldErrors, form: error.message })
        } else {
          setErrors({ form: 'Unexpected error. Please try again.' })
        }
      },
    })
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your BrathaMatu workspace">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {errors.form && !errors.email && !errors.password && (
          <Alert kind="error">{errors.form}</Alert>
        )}
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@business.co.ke"
          value={values.email}
          error={errors.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-[13px] font-medium text-ws-muted">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-ws-gold hover:underline">
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={values.password}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
              className={`block w-full rounded-xl border bg-ws-sunken py-2.5 pl-3.5 pr-11 text-sm text-ws-text shadow-[inset_0_1px_2px_oklch(0_0_0/0.35)] placeholder:text-ws-faint hover:border-ws-line-strong focus:border-ws-gold/60 focus:outline-none focus:ring-2 focus:ring-ws-gold/25 ${
                errors.password ? 'border-ws-danger/70' : 'border-ws-line-strong'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-ws-faint hover:text-ws-text"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" role="alert" className="text-xs text-ws-danger">
              {errors.password}
            </p>
          )}
        </div>
        <Button type="submit" loading={login.isPending} className="h-11 w-full">
          Sign in
        </Button>
      </form>
      <div className="mt-7 space-y-2.5 border-t border-ws-line pt-6 text-center text-sm text-ws-muted">
        <p>
          New business?{' '}
          <Link to="/register" className="font-medium text-ws-gold hover:underline">
            Create a business account
          </Link>
        </p>
        <p>
          Want to work as a stock taker?{' '}
          <Link to="/workforce/register" className="font-medium text-ws-gold hover:underline">
            Apply to join the workforce
          </Link>
        </p>
        <p className="pt-1">
          <a href={publicSiteUrl()} target="_blank" rel="noreferrer" className="text-xs text-ws-faint hover:text-ws-text">
            Visit the public BrathaMatu website →
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="ws grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden lg:block" aria-hidden="true">
        <img src={warehouseImage} alt="" width={1400} height={933} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ws-bg via-ws-bg/55 to-ws-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ws-bg/80" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-ws-bg/60 shadow-[inset_0_0_0_1px_oklch(0.82_0.14_76/0.4)] backdrop-blur">
              <span className="absolute inset-x-2.5 top-2.5 h-[3px] rounded-full bg-ws-gold" />
              <span className="absolute inset-x-2.5 top-[17px] h-[3px] rounded-full bg-ws-gold/70" />
              <span className="absolute left-2.5 top-[24px] h-[3px] w-3 rounded-full bg-ws-gold/45" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-ws-text">BrathaMatu</span>
          </div>
          <div className="rise max-w-lg">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ws-gold">Stock-taking · POS · Inventory</p>
            <p className="mt-4 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-ws-text">
              Every branch, every shelf, counted with confidence.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ws-muted">
              Professional stock-taking, point of sale and inventory control in one workspace for your whole team.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-ws-line-strong bg-ws-bg/50 px-4 py-3 backdrop-blur-md">
              <ShieldCheck className="h-5 w-5 shrink-0 text-ws-gold" />
              <p className="text-sm text-ws-muted">Access is limited to the roles and permissions your organisation assigns.</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative flex items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
        <span aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-ws-gold/10 blur-3xl" />
        <div className="relative w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-ws-gold-soft shadow-[inset_0_0_0_1px_oklch(0.82_0.14_76/0.35)]">
              <span className="absolute inset-x-2 top-2 h-[3px] rounded-full bg-ws-gold" />
              <span className="absolute inset-x-2 top-[15px] h-[3px] rounded-full bg-ws-gold/70" />
              <span className="absolute left-2 top-[22px] h-[3px] w-3 rounded-full bg-ws-gold/45" />
            </span>
            <span className="font-display text-lg font-semibold text-ws-text">BrathaMatu</span>
          </div>
          <h1 className="font-display text-[1.9rem] font-semibold tracking-tight text-ws-text">{title}</h1>
          <p className="mt-1.5 text-sm text-ws-muted">{subtitle}</p>
          <div className="ws-card mt-8 p-6 sm:p-7">{children}</div>
          <p className="mt-6 text-center text-xs text-ws-faint">BrathaMatu · Nairobi, Kenya · All amounts in KES</p>
        </div>
      </main>
    </div>
  )
}
