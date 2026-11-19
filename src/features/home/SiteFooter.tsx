import { Link } from '@tanstack/react-router'
import { BrandMark } from './BrandMark'

// Public marketing pages (privacy, terms, contact) live on the Laravel site; they are only
// linked when its address is configured, so no footer link can lead to a missing page.
const publicSite = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined

function publicUrl(path: string) {
  if (!publicSite) return null
  return new URL(path.replace(/^\//, ''), publicSite.endsWith('/') ? publicSite : `${publicSite}/`).toString()
}

const companyLinks = [
  { label: 'Contact', path: '/contact' },
  { label: 'Privacy notice', path: '/privacy' },
  { label: 'Terms of service', path: '/terms' },
]

export function SiteFooter() {
  const linkClass = 'text-sm text-night-muted transition-colors hover:text-night-foreground'
  return (
    <footer className="bg-night text-night-foreground">
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <BrandMark tone="night" />
          <p className="mt-4 text-sm leading-relaxed text-night-muted">
            Professional stock-taking, point of sale and inventory control for inventory-heavy businesses.
          </p>
        </div>

        <nav aria-label="Platform">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-night-foreground">Platform</p>
          <ul className="mt-4 space-y-3">
            <li><a href="#platform" className={linkClass}>Capabilities</a></li>
            <li><a href="#how-it-works" className={linkClass}>How it works</a></li>
            <li><a href="#marketplace" className={linkClass}>Stock-taking services</a></li>
            <li><a href="#pos-inventory" className={linkClass}>POS &amp; inventory</a></li>
          </ul>
        </nav>

        <nav aria-label="Get started">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-night-foreground">Get started</p>
          <ul className="mt-4 space-y-3">
            <li><Link to="/register" className={linkClass}>Create a workspace</Link></li>
            <li><Link to="/login" className={linkClass}>Sign in</Link></li>
            <li><Link to="/workforce/register" className={linkClass}>Join the workforce</Link></li>
            <li><Link to="/forgot-password" className={linkClass}>Reset password</Link></li>
          </ul>
        </nav>

        <nav aria-label="Workspace">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-night-foreground">Workspace</p>
          <ul className="mt-4 space-y-3">
            <li><Link to="/app" className={linkClass}>Dashboard</Link></li>
            <li><Link to="/business/stocktaking" className={linkClass}>Stock-taking jobs</Link></li>
            <li><Link to="/pos" className={linkClass}>Point of sale</Link></li>
            <li><Link to="/support" className={linkClass}>Support</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-night-line">
        <div className="container-site flex flex-col gap-4 py-6 text-xs text-night-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BrathaMatu. All rights reserved.</p>
          {publicSite && (
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {companyLinks.map((item) => (
                <li key={item.path}>
                  <a href={publicUrl(item.path) ?? undefined} className="hover:text-night-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
