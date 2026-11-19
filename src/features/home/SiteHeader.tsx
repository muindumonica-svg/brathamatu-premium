import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BrandMark } from './BrandMark'
import { cta } from './cta'

const sections = [
  { href: '#platform', label: 'Platform' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#marketplace', label: 'Stock-taking' },
  { href: '#pos-inventory', label: 'POS & inventory' },
]

export function SiteHeader({ hasSession }: { hasSession: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={
        'sticky top-0 z-40 border-b transition-colors duration-300 ' +
        (scrolled || open
          ? 'border-border bg-background/90 backdrop-blur-md'
          : 'border-transparent bg-background/0')
      }
    >
      <div className="container-site flex h-16 items-center justify-between gap-6">
        <Link to="/" aria-label="BrathaMatu home" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BrandMark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {sections.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {hasSession ? (
            <Link to="/app" className={cta({ size: 'sm' })}>
              Open workspace
            </Link>
          ) : (
            <>
              <Link to="/login" className={cta({ variant: 'quiet', size: 'sm' })}>
                Sign in
              </Link>
              <Link to="/register" className={cta({ size: 'sm' })}>
                Create workspace
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border bg-background lg:hidden">
          <div className="container-site flex flex-col gap-1 py-4">
            {sections.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[0.95rem] text-foreground hover:bg-muted"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid gap-2 border-t border-border pt-4">
              {hasSession ? (
                <Link to="/app" className={cta({ size: 'lg' })}>
                  Open workspace
                </Link>
              ) : (
                <>
                  <Link to="/register" className={cta({ size: 'lg' })}>
                    Create workspace
                  </Link>
                  <Link to="/login" className={cta({ variant: 'outline', size: 'lg' })}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
