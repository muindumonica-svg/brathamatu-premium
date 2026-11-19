import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import {
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Coins,
  CreditCard,
  ExternalLink,
  FileSearch,
  FileText,
  Gauge,
  Globe,
  Image,
  LayoutDashboard,
  LifeBuoy,
  ListTree,
  LogOut,
  Megaphone,
  Menu,
  MonitorSmartphone,
  Package,
  Plug,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Tags,
  Timer,
  User,
  UserCheck,
  Users,
  Wallet,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useCurrentUser, useLogout, useSwitchTenant } from '../lib/auth/hooks'
import { formatOperatingMode } from '../lib/formatting'
import { publicSiteUrl } from '../lib/publicSite'
import { useNotifications } from '../lib/reporting/hooks'
import { Badge, PageLoader } from './ui'

/* ------------------------------------------------------------------ */
/* Navigation model — visibility rules mirror the original shell.       */
/* ------------------------------------------------------------------ */

type NavLink = { to: string; label: string; icon: LucideIcon; external?: boolean }
type NavSection = { id: string; label: string; items: NavLink[] }

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function useNavigation() {
  const { data: user } = useCurrentUser()
  return useMemo(() => {
    const isPlatform = Boolean(user?.roles.some((role) => role.scope === 'platform' && !role.tenant_id))
    const isWorker = Boolean(user?.roles.some((role) => role.scope === 'workforce'))
    const permissions = new Set(user?.permissions ?? [])
    const can = (permission: string) => permissions.has(permission)
    const currentTenant = user?.current_tenant ?? null
    const sections: NavSection[] = []
    const add = (items: Array<NavLink | false>) => items.filter((item): item is NavLink => Boolean(item))

    if (isPlatform) {
      sections.push({
        id: 'platform',
        label: 'Platform',
        items: add([
          { to: '/platform', label: 'Operations overview', icon: Gauge },
          can('tenant.view') && { to: '/platform/tenants', label: 'Tenants', icon: Building2 },
          (can('stocktake.job.review') || can('finance.payment.record') || can('stocktake.quote.view')) && {
            to: '/platform/stocktaking-jobs',
            label: 'Stock-taking jobs',
            icon: ClipboardList,
          },
          (can('stocktake.job.monitor') || can('stocktake.job.assign') || can('sop.manage')) && {
            to: '/platform/operations',
            label: 'Field operations',
            icon: Workflow,
          },
          can('sop.manage') && { to: '/platform/sops', label: 'SOP templates', icon: BookOpen },
          can('pricing.manage') && { to: '/platform/catalogue-pricing', label: 'Catalogue pricing', icon: Tags },
          can('pricing.manage') && { to: '/platform/stocktake-policy', label: 'Stocktake policy', icon: SlidersHorizontal },
          (can('finance.ledger.view') || can('finance.payment.record')) && {
            to: '/platform/finance',
            label: 'Finance',
            icon: Wallet,
          },
          can('report.view') && { to: '/platform/reports', label: 'Reports & analytics', icon: BarChart3 },
          can('support.view') && { to: '/platform/support', label: 'Support queue', icon: LifeBuoy },
          can('workforce.view') && { to: '/platform/workforce', label: 'Workforce', icon: UserCheck },
          can('audit.view') && { to: '/platform/audit', label: 'Audit trail', icon: FileSearch },
        ]),
      })

      if (can('cms.view')) {
        sections.push({
          id: 'website',
          label: 'Website',
          items: add([
            { to: '/platform/marketing', label: 'Marketing overview', icon: Megaphone },
            { to: '/platform/marketing/pages', label: 'Marketing pages', icon: FileText },
            can('media.manage') && { to: '/platform/marketing/media', label: 'Media library', icon: Image },
            { to: '/platform/marketing/navigation', label: 'Navigation', icon: ListTree },
            { to: '/platform/marketing/content', label: 'Content library', icon: Boxes },
            { to: '/platform/marketing/seo', label: 'Technical SEO', icon: Search },
            can('blog.manage') && { to: '/platform/marketing/blog', label: 'Blog & resources', icon: BookOpen },
            can('social.publish') && { to: '/platform/marketing/social', label: 'Social publishing', icon: Share2 },
            can('campaigns.view') && { to: '/platform/marketing/campaigns', label: 'Campaigns', icon: Megaphone },
            can('analytics.view') && { to: '/platform/marketing/analytics', label: 'Analytics', icon: BarChart3 },
            can('automation.view') && { to: '/platform/marketing/automation', label: 'Automation', icon: Workflow },
            can('integrations.google.manage') && {
              to: '/platform/marketing/integrations/google',
              label: 'Google integrations',
              icon: Plug,
            },
            can('integrations.meta.manage') && {
              to: '/platform/marketing/integrations/meta',
              label: 'Meta integrations',
              icon: Plug,
            },
            can('leads.view') && { to: '/platform/marketing/leads', label: 'Leads', icon: Users },
            { to: publicSiteUrl(), label: 'View public website', icon: Globe, external: true },
          ]),
        })
      }
    }

    if (currentTenant) {
      sections.push({
        id: 'business',
        label: 'Business',
        items: add([
          { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/business/locations', label: 'Branches & locations', icon: Store },
          { to: '/business/catalogue', label: 'Catalogue', icon: Tags },
          { to: '/business/inventory', label: 'Inventory', icon: Package },
          can('integration.manage') && { to: '/business/integrations', label: 'Integrations', icon: Plug },
          { to: '/business/stocktaking', label: 'Stock-taking jobs', icon: ClipboardCheck },
          { to: '/business/team', label: 'Team members', icon: Users },
          { to: '/business/schedules', label: 'Schedules', icon: CalendarClock },
          can('report.view') && { to: '/business/reports', label: 'Reports & analytics', icon: BarChart3 },
          { to: '/settings', label: 'Settings', icon: Settings },
        ]),
      })
    }

    if (isWorker) {
      sections.push({
        id: 'workforce',
        label: 'Workforce',
        items: add([
          { to: '/app', label: 'My dashboard', icon: LayoutDashboard },
          { to: '/workforce/profile', label: 'My profile', icon: User },
          can('assignment.view') && { to: '/workforce/assignments', label: 'Assignments', icon: Briefcase },
          can('earnings.view') && { to: '/workforce/earnings', label: 'Earnings', icon: Coins },
        ]),
      })
    }

    if (currentTenant && currentTenant.operating_mode === 'brathamatu_pos') {
      sections.push({
        id: 'pos',
        label: 'BrathaMatu POS',
        items: add([
          { to: '/pos', label: 'POS Terminal', icon: ShoppingCart },
          { to: '/pos/back-office', label: 'Back office', icon: CreditCard },
          can('pos.shift.open') && { to: '/pos/shifts', label: 'Shifts', icon: Timer },
          can('pos.manage') && { to: '/pos/terminals', label: 'Terminals', icon: MonitorSmartphone },
          can('pos.manage') && { to: '/pos/stocktake', label: 'Stock-taking', icon: ClipboardCheck },
        ]),
      })
    }

    sections.push({
      id: 'account',
      label: 'Account',
      items: [
        { to: '/notifications', label: 'Notifications', icon: Bell },
        { to: '/profile', label: 'Profile', icon: User },
        { to: '/support', label: 'Support', icon: LifeBuoy },
      ],
    })

    return { user, sections, isPlatform, isWorker, currentTenant }
  }, [user])
}

function isActivePath(pathname: string, to: string) {
  if (to === '/app' || to === '/platform' || to === '/pos' || to === '/platform/marketing') return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

function findActive(sections: NavSection[], pathname: string) {
  let best: { section: NavSection; item: NavLink } | null = null
  for (const section of sections) {
    for (const item of section.items) {
      if (item.external) continue
      const match = pathname === item.to || pathname.startsWith(`${item.to}/`)
      if (match && (!best || item.to.length > best.item.to.length)) best = { section, item }
    }
  }
  return best
}

/* ------------------------------------------------------------------ */

function NavItem({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavLink
  pathname: string
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon
  const active = !item.external && isActivePath(pathname, item.to)
  const className = `group/nav relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-all duration-150 ${
    active
      ? 'bg-ws-gold-soft text-ws-gold shadow-[inset_0_0_0_1px_oklch(0.82_0.14_76/0.28)]'
      : 'text-ws-muted hover:bg-ws-raised hover:text-ws-text'
  } ${collapsed ? 'justify-center px-0' : ''}`

  const content = (
    <>
      {active && !collapsed && (
        <span aria-hidden className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-ws-gold shadow-ws-glow" />
      )}
      <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-ws-gold' : 'text-ws-faint group-hover/nav:text-ws-text'}`} strokeWidth={1.75} />
      {collapsed ? (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-ws-line-strong bg-ws-raised px-2.5 py-1.5 text-xs text-ws-text opacity-0 shadow-ws-pop transition-opacity group-hover/nav:opacity-100 group-focus-visible/nav:opacity-100">
          {item.label}
        </span>
      ) : (
        <span className="truncate">{item.label}</span>
      )}
      {item.external && !collapsed && <ExternalLink className="ml-auto h-3.5 w-3.5 text-ws-faint" />}
    </>
  )

  if (item.external) {
    return (
      <a href={item.to} target="_blank" rel="noreferrer" className={className} aria-label={collapsed ? item.label : undefined}>
        {content}
      </a>
    )
  }
  return (
    <Link to={item.to} className={className} onClick={onNavigate} aria-label={collapsed ? item.label : undefined} aria-current={active ? 'page' : undefined}>
      {content}
    </Link>
  )
}

function BrandLockup({ collapsed }: { collapsed: boolean }) {
  return (
    <Link to="/app" className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-ws-gold">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ws-gold-soft shadow-[inset_0_0_0_1px_oklch(0.82_0.14_76/0.35)]">
        <span className="absolute inset-x-2 top-2 h-[3px] rounded-full bg-ws-gold" />
        <span className="absolute inset-x-2 top-[15px] h-[3px] rounded-full bg-ws-gold/70" />
        <span className="absolute left-2 top-[22px] h-[3px] w-3 rounded-full bg-ws-gold/45" />
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block font-display text-[1.05rem] font-semibold leading-tight tracking-tight text-ws-text">BrathaMatu</span>
          <span className="block text-[11px] text-ws-faint">Stocktake platform</span>
        </span>
      )}
    </Link>
  )
}

function Sidebar({
  sections,
  pathname,
  collapsed,
  onToggle,
  onNavigate,
  mobile = false,
}: {
  sections: NavSection[]
  pathname: string
  collapsed: boolean
  onToggle?: () => void
  onNavigate?: () => void
  mobile?: boolean
}) {
  const [query, setQuery] = useState('')
  const [closed, setClosed] = useState<Record<string, boolean>>({})
  const q = query.trim().toLowerCase()
  const filtered = sections
    .map((section) => ({ ...section, items: q ? section.items.filter((item) => item.label.toLowerCase().includes(q)) : section.items }))
    .filter((section) => section.items.length > 0)

  return (
    <div className="flex h-full flex-col">
      <div className={`flex h-16 items-center gap-2 px-4 ${collapsed ? 'justify-center px-2' : 'justify-between'}`}>
        <BrandLockup collapsed={collapsed} />
        {!mobile && onToggle && !collapsed && (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ws-faint hover:bg-ws-raised hover:text-ws-text"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 pb-2">
          <label className="flex items-center gap-2 rounded-xl border border-ws-line bg-ws-sunken px-3 py-2 text-sm text-ws-muted focus-within:border-ws-gold/50">
            <Search className="h-4 w-4 shrink-0 text-ws-faint" />
            <span className="sr-only">Filter menu</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a page…"
              className="w-full !bg-transparent text-sm text-ws-text outline-none placeholder:text-ws-faint"
            />
          </label>
        </div>
      )}

      <nav aria-label="Main" className="ws-scroll flex-1 overflow-y-auto overflow-x-visible px-3 pb-4">
        {filtered.map((section) => {
          const isClosed = !q && closed[section.id]
          return (
            <div key={section.id} className="pt-3">
              {collapsed ? (
                <div className="mx-auto mb-2 h-px w-6 bg-ws-line" aria-hidden />
              ) : (
                <button
                  type="button"
                  onClick={() => setClosed((value) => ({ ...value, [section.id]: !value[section.id] }))}
                  aria-expanded={!isClosed}
                  className="flex w-full items-center justify-between px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ws-faint hover:text-ws-muted"
                >
                  {section.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isClosed ? '-rotate-90' : ''}`} />
                </button>
              )}
              {!isClosed && (
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => (
                    <NavItem key={`${section.id}-${item.to}`} item={item} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && <p className="px-3 pt-4 text-sm text-ws-faint">No pages match “{query}”.</p>}
      </nav>

      {!mobile && collapsed && onToggle && (
        <div className="border-t border-ws-line p-3">
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand menu"
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-ws-faint hover:bg-ws-raised hover:text-ws-text"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function CommandSearch({ sections, onClose }: { sections: NavSection[]; onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const seen = new Set<string>()
    return sections.flatMap((section) =>
      section.items
        .filter((item) => !item.external && (!q || `${item.label} ${section.label}`.toLowerCase().includes(q)))
        .filter((item) => (seen.has(item.to) ? false : (seen.add(item.to), true)))
        .map((item) => ({ ...item, section: section.label })),
    )
  }, [sections, query])

  useEffect(() => inputRef.current?.focus(), [])
  useEffect(() => setIndex(0), [query])

  function go(to: string) {
    onClose()
    router.navigate({ to })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ws-bg/70 px-4 pt-[12vh] backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search pages"
        className="ws-card w-full max-w-lg overflow-hidden shadow-ws-pop"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-ws-line px-4">
          <Search className="h-4 w-4 text-ws-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') onClose()
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setIndex((value) => Math.min(value + 1, items.length - 1))
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                setIndex((value) => Math.max(value - 1, 0))
              }
              if (event.key === 'Enter' && items[index]) go(items[index].to)
            }}
            placeholder="Search pages…"
            aria-label="Search pages"
            className="h-12 w-full !bg-transparent text-sm text-ws-text outline-none placeholder:text-ws-faint"
          />
          <kbd className="rounded-md border border-ws-line-strong px-1.5 py-0.5 text-[10px] text-ws-faint">Esc</kbd>
        </div>
        <ul className="ws-scroll max-h-80 overflow-y-auto p-2" role="listbox" aria-label="Pages">
          {items.map((item, itemIndex) => {
            const Icon = item.icon
            return (
              <li key={item.to} role="option" aria-selected={itemIndex === index}>
                <button
                  type="button"
                  onMouseEnter={() => setIndex(itemIndex)}
                  onClick={() => go(item.to)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${
                    itemIndex === index ? 'bg-ws-gold-soft text-ws-gold' : 'text-ws-text'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="text-[11px] text-ws-faint">{item.section}</span>
                </button>
              </li>
            )
          })}
          {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-ws-faint">No pages match.</li>}
        </ul>
      </div>
    </div>
  )
}

function ProfileMenu({ name, email, roles, onSignOut, signingOut, hasTenant }: {
  name: string
  email: string
  roles: string[]
  onSignOut: () => void
  signingOut: boolean
  hasTenant: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-full border border-ws-line-strong bg-ws-surface py-1 pl-1 pr-3 transition-colors hover:border-ws-gold/40"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ws-gold text-xs font-semibold text-ws-gold-ink" aria-hidden>
          {initials(name)}
        </span>
        <span className="hidden min-w-0 text-left md:block">
          <span className="block max-w-40 truncate text-[13px] font-medium leading-tight text-ws-text" data-testid="current-user">
            {name}
          </span>
          <span className="block max-w-40 truncate text-[11px] leading-tight text-ws-faint">{email}</span>
        </span>
        <ChevronDown className="hidden h-4 w-4 text-ws-faint md:block" />
      </button>
      {open && (
        <div role="menu" className="ws-card absolute right-0 top-full z-50 mt-2 w-64 p-2 shadow-ws-pop">
          <div className="border-b border-ws-line px-3 pb-3 pt-2">
            <p className="truncate text-sm font-medium text-ws-text">{name}</p>
            <p className="truncate text-xs text-ws-faint">{email}</p>
            {roles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {roles.map((role) => (
                  <span key={role} className="rounded-full border border-ws-line-strong px-2 py-0.5 text-[10px] text-ws-muted">
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="py-1">
            <Link to="/profile" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ws-muted hover:bg-ws-raised hover:text-ws-text">
              <User className="h-4 w-4" /> Profile
            </Link>
            {hasTenant && (
              <Link to="/settings" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ws-muted hover:bg-ws-raised hover:text-ws-text">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            )}
            <Link to="/support" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ws-muted hover:bg-ws-raised hover:text-ws-text">
              <LifeBuoy className="h-4 w-4" /> Help &amp; support
            </Link>
          </div>
          <div className="border-t border-ws-line pt-1">
            <button
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={onSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ws-danger hover:bg-ws-danger-soft disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" /> {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PosUpgradeBanner({ tenantId }: { tenantId: string }) {
  const storageKey = `brathamatu.pos-upgrade-banner.dismissed:${tenantId}`
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(storageKey) === 'true')

  if (dismissed) return null

  return (
    <aside
      className="relative mx-4 mt-4 flex flex-col gap-3 overflow-hidden rounded-2xl border border-ws-gold/25 bg-ws-gold-soft px-5 py-4 sm:mx-6 sm:flex-row sm:items-center sm:justify-between lg:mx-8"
      aria-label="BrathaMatu POS upgrade"
    >
      <span aria-hidden className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full bg-ws-gold/20 blur-3xl" />
      <div className="relative">
        <p className="font-semibold text-ws-text">Bring sales, inventory and stock-taking together with BrathaMatu POS.</p>
        <p className="mt-1 text-sm text-ws-muted">
          Get real-time sales and stock visibility, connected records and a smoother path to professional stock-taking.
        </p>
      </div>
      <div className="relative flex shrink-0 flex-wrap items-center gap-3">
        <Link to="/settings" className="rounded-full bg-ws-gold px-4 py-2 text-sm font-medium text-ws-gold-ink hover:brightness-105">
          Upgrade to BrathaMatu POS
        </Link>
        <a
          href={publicSiteUrl('/brathamatu-pos')}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-ws-gold underline-offset-4 hover:underline"
        >
          See POS and stock-taking benefits
        </a>
        <button
          type="button"
          aria-label="Dismiss upgrade recommendation"
          className="rounded-full px-3 py-1.5 text-sm text-ws-muted hover:bg-ws-raised hover:text-ws-text"
          onClick={() => {
            localStorage.setItem(storageKey, 'true')
            setDismissed(true)
          }}
        >
          Dismiss
        </button>
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */

const COLLAPSE_KEY = 'brathamatu.sidebar.collapsed'

export function AppShell({ children }: { children: ReactNode }) {
  const { isLoading } = useCurrentUser()
  const { user, sections, isPlatform, isWorker, currentTenant } = useNavigation()
  const logout = useLogout()
  const switchTenant = useSwitchTenant()
  const router = useRouter()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const notifications = useNotifications()
  const unread = notifications.data?.unread_count ?? 0

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === 'true')
  }, [])
  useEffect(() => setMobileOpen(false), [pathname])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (isLoading) {
    return (
      <div className="ws min-h-screen">
        <PageLoader label="Loading your workspace…" />
      </div>
    )
  }

  const roleNames = Array.from(
    new Set(
      (user?.roles ?? [])
        .filter((role) => role.scope !== 'workforce' || isWorker)
        .map((role) => role.name),
    ),
  ).slice(0, 3)
  const active = findActive(sections, pathname)
  const pageTitle = active?.item.label ?? (pathname === '/app' ? 'Dashboard' : 'Workspace')

  function toggleCollapsed() {
    setCollapsed((value) => {
      localStorage.setItem(COLLAPSE_KEY, String(!value))
      return !value
    })
  }

  function signOut() {
    logout.mutate(undefined, {
      onSettled: () => router.navigate({ to: '/login' }),
    })
  }

  return (
    <div className="ws flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-ws-line bg-ws-sunken/80 transition-[width] duration-300 lg:block ${
          collapsed ? 'w-[76px]' : 'w-[264px]'
        }`}
      >
        <Sidebar sections={sections} pathname={pathname} collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ws-bg/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[284px] max-w-[85vw] border-r border-ws-line bg-ws-sunken shadow-ws-pop">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-ws-muted hover:bg-ws-raised"
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar sections={sections} pathname={pathname} collapsed={false} mobile onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-ws-line bg-ws-bg/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ws-line-strong text-ws-muted hover:text-ws-text lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0 flex-1">
              <nav aria-label="Breadcrumb" className="hidden items-center gap-1.5 text-[11px] text-ws-faint sm:flex">
                <span>{isPlatform ? 'BrathaMatu operations' : currentTenant ? currentTenant.name : 'Workspace'}</span>
                {active && (
                  <>
                    <span aria-hidden>/</span>
                    <span>{active.section.label}</span>
                  </>
                )}
              </nav>
              <p className="truncate text-[15px] font-semibold text-ws-text">{pageTitle}</p>
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 w-64 items-center gap-2.5 rounded-full border border-ws-line-strong bg-ws-surface px-4 text-sm text-ws-faint transition-colors hover:border-ws-gold/40 hover:text-ws-muted md:flex"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search here…</span>
              <kbd className="rounded-md border border-ws-line-strong px-1.5 text-[10px]">Ctrl K</kbd>
            </button>

            {(user?.tenants.length ?? 0) > 1 && (
              <label className="hidden items-center xl:flex">
                <span className="sr-only">Active business</span>
                <select
                  aria-label="Active business"
                  className="h-10 max-w-52 truncate rounded-full border border-ws-line-strong !bg-ws-surface px-4 text-sm text-ws-text outline-none hover:border-ws-gold/40 focus:border-ws-gold/60"
                  value={currentTenant?.id ?? ''}
                  onChange={(event) => {
                    switchTenant.mutate(event.target.value)
                    router.navigate({ to: '/app' })
                  }}
                >
                  {user?.tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {currentTenant && (
              <span className="hidden 2xl:inline-flex">
                <Badge tone={currentTenant.operating_mode === 'brathamatu_pos' ? 'green' : 'gray'}>
                  {formatOperatingMode(currentTenant.operating_mode)}
                </Badge>
              </span>
            )}

            <div className="flex items-center gap-1.5 rounded-full border border-ws-line-strong bg-ws-surface p-1">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search pages"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ws-muted hover:bg-ws-raised hover:text-ws-text md:hidden"
              >
                <Search className="h-4 w-4" />
              </button>
              <Link
                to="/notifications"
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-ws-muted hover:bg-ws-raised hover:text-ws-text"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ws-gold px-1 text-[9px] font-bold text-ws-gold-ink shadow-ws-glow">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
              <Link
                to="/support"
                aria-label="Help and support"
                className="flex h-8 w-8 items-center justify-center rounded-full text-ws-muted hover:bg-ws-raised hover:text-ws-text"
              >
                <CircleHelp className="h-4 w-4" />
              </Link>
            </div>

            {user && (
              <ProfileMenu
                name={user.name}
                email={user.email}
                roles={roleNames}
                hasTenant={Boolean(currentTenant)}
                onSignOut={signOut}
                signingOut={logout.isPending}
              />
            )}
          </div>
        </header>

        {currentTenant && currentTenant.operating_mode !== 'brathamatu_pos' && (
          <PosUpgradeBanner key={currentTenant.id} tenantId={currentTenant.id} />
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      {searchOpen && <CommandSearch sections={sections} onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
