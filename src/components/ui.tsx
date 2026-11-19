import { Children, useEffect, useRef, useState } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'
import { FORM_SUBMISSION_SUCCESS_EVENT } from '../lib/form-events'

export function Button({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ws-gold active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55'
  const variants = {
    primary:
      'bg-ws-gold text-ws-gold-ink shadow-[inset_0_1px_0_oklch(1_0_0/0.35),0_6px_20px_-8px_oklch(0.82_0.14_76/0.6)] hover:brightness-105',
    secondary: 'border border-ws-line-strong bg-ws-raised/60 text-ws-text hover:border-ws-gold/40 hover:bg-ws-raised',
    danger: 'bg-ws-danger text-ws-gold-ink hover:brightness-110',
    ghost: 'text-ws-muted hover:bg-ws-raised hover:text-ws-text',
  }
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  )
}

export function CollapsibleForm({ children, label = 'Show form' }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false)
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false)
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const submitted = useRef(false)

  useEffect(() => {
    function onSubmit(event: Event) {
      submitted.current = detailsRef.current?.contains(event.target as Node) ?? false
      if (submitted.current) setSubmittedSuccessfully(false)
    }

    function onSubmissionSuccess() {
      if (!submitted.current) return
      submitted.current = false
      if (detailsRef.current) detailsRef.current.open = false
      setSubmittedSuccessfully(true)
      setOpen(false)
    }

    document.addEventListener('submit', onSubmit, true)
    window.addEventListener(FORM_SUBMISSION_SUCCESS_EVENT, onSubmissionSuccess)

    return () => {
      document.removeEventListener('submit', onSubmit, true)
      window.removeEventListener(FORM_SUBMISSION_SUCCESS_EVENT, onSubmissionSuccess)
    }
  }, [])

  return (
    <details
      ref={detailsRef}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="rounded-2xl border border-ws-line bg-ws-surface p-3 shadow-ws-card open:p-5"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-1 text-sm font-medium text-ws-gold">
        <span>{submittedSuccessfully ? 'Submitted successfully · ' : ''}{open ? 'Hide form' : label}</span>
        <span aria-hidden className="flex h-6 w-6 items-center justify-center rounded-full bg-ws-gold-soft text-ws-gold">{open ? '−' : '+'}</span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-label="Loading">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

const controlClass =
  'block w-full rounded-xl border bg-ws-sunken px-3.5 py-2.5 text-sm text-ws-text shadow-[inset_0_1px_2px_oklch(0_0_0/0.35)] transition-colors placeholder:text-ws-faint hover:border-ws-line-strong focus:border-ws-gold/60 focus:outline-none focus:ring-2 focus:ring-ws-gold/25 disabled:opacity-60'

export function Field({
  label,
  error,
  hint,
  id,
  children,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
  children?: ReactNode
  'data-testid'?: string
}) {
  const inputId = id ?? props.name
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-[13px] font-medium text-ws-muted">
        {label}
      </label>
      {children ?? (
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`${controlClass} ${error ? 'border-ws-danger/70' : 'border-ws-line-strong'}`}
          {...props}
        />
      )}
      {hint && !error && <p id={`${inputId}-hint`} className="text-xs text-ws-faint">{hint}</p>}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-ws-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export function Select({
  label,
  error,
  hint,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: string
  'data-testid'?: string
}) {
  const selectId = id ?? props.name
  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-[13px] font-medium text-ws-muted">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={`${controlClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23a1a1aa' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat pr-9 ${
          error ? 'border-ws-danger/70' : 'border-ws-line-strong'
        }`}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="text-xs text-ws-faint">{hint}</p>}
      {error && (
        <p id={`${selectId}-error`} role="alert" className="text-xs text-ws-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string
  description?: string
  actions?: ReactNode
  eyebrow?: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ws-gold">{eyebrow}</p>}
        <h1 className="font-display text-[1.7rem] font-semibold leading-tight tracking-tight text-ws-text">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-ws-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function IconTile({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'gold' }) {
  return (
    <span
      aria-hidden
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
        tone === 'gold'
          ? 'border-ws-gold/30 bg-ws-gold-soft text-ws-gold'
          : 'border-ws-line-strong bg-ws-raised text-ws-muted'
      } [&_svg]:h-4 [&_svg]:w-4`}
    >
      {children}
    </span>
  )
}

/** KPI card. `hint` / `footer` must describe real values — never invented comparisons. */
export function StatCard({
  label,
  value,
  hint,
  icon,
  footer,
  accent = false,
  loading = false,
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  footer?: ReactNode
  accent?: boolean
  loading?: boolean
}) {
  return (
    <div
      className={`ws-card group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-ws-pop ${
        accent ? 'border-ws-gold/25' : ''
      }`}
    >
      {accent && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-ws-gold/20 blur-3xl"
        />
      )}
      <div className="relative px-5 pb-4 pt-4">
        <header className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-medium text-ws-muted">{label}</p>
          {icon && <IconTile tone={accent ? 'gold' : 'neutral'}>{icon}</IconTile>}
        </header>
        {loading ? (
          <div className="skeleton mt-3 h-8 w-28 rounded-lg" />
        ) : (
          <p
            className={`mt-2 font-display font-semibold leading-none tracking-tight text-ws-text tabular-nums ${
              typeof value === 'string' && value.length > 10 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-[1.9rem]'
            }`}
          >
            {value}
          </p>
        )}
      </div>
      {(hint || footer) && (
        <div className="relative flex items-center justify-between gap-2 border-t border-ws-line px-5 py-2.5 text-xs text-ws-muted">
          {hint && <span className="truncate">{hint}</span>}
          {footer}
        </div>
      )}
    </div>
  )
}

export function Skeleton({ className = 'h-4 w-full' }: { className?: string }) {
  return <div aria-hidden className={`skeleton rounded-md ${className}`} />
}

export function Table({
  headers,
  children,
  empty,
}: {
  headers: ReactNode[]
  children: ReactNode
  empty?: ReactNode
}) {
  const hasRows = Children.toArray(children).some(
    (child) => child !== null && child !== undefined && child !== '',
  )

  return (
    <div className="ws-card ws-scroll overflow-x-auto">
      <table className="min-w-full text-sm [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-ws-raised/50 [&_td]:text-ws-text/90">
        <thead>
          <tr className="border-b border-ws-line">
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-ws-muted"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ws-line">{children}</tbody>
      </table>
      {hasRows ? null : empty}
    </div>
  )
}

export function Alert({
  kind = 'error',
  children,
}: {
  kind?: 'error' | 'success' | 'info'
  children: ReactNode
}) {
  const styles = {
    error: 'border-ws-danger/30 bg-ws-danger-soft text-red-800',
    success: 'border-ws-success/30 bg-ws-success-soft text-green-800',
    info: 'border-ws-info/30 bg-ws-info-soft text-blue-800',
  }
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles[kind]}`}>
      {children}
    </div>
  )
}

export function Card({
  title,
  children,
  actions,
  description,
  icon,
}: {
  title?: string
  children: ReactNode
  actions?: ReactNode
  description?: string
  icon?: ReactNode
}) {
  return (
    <section className="ws-card">
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pb-1 pt-4">
          <div className="flex min-w-0 items-center gap-3">
            {icon && <IconTile>{icon}</IconTile>}
            <div className="min-w-0">
              {title && <h2 className="text-[15px] font-semibold text-ws-text">{title}</h2>}
              {description && <p className="mt-0.5 text-xs text-ws-muted">{description}</p>}
            </div>
          </div>
          {actions}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

export function Badge({
  tone = 'gray',
  children,
}: {
  tone?: 'gray' | 'green' | 'red' | 'amber' | 'blue'
  children: ReactNode
}) {
  const tones = {
    gray: 'border-ws-line-strong bg-ws-raised text-ws-muted',
    green: 'border-ws-success/25 bg-ws-success-soft text-ws-success',
    red: 'border-ws-danger/25 bg-ws-danger-soft text-ws-danger',
    amber: 'border-ws-warning/25 bg-ws-warning-soft text-ws-warning',
    blue: 'border-ws-info/25 bg-ws-info-soft text-ws-info',
  }
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ws-line-strong bg-ws-sunken/40 px-6 py-10 text-center">
      <p className="text-sm font-medium text-ws-text">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-ws-muted">{description}</p>}
    </div>
  )
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ws-muted" role="status">
      <Spinner className="h-5 w-5 text-ws-gold" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
