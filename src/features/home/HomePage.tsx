import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  ClipboardCheck,
  LifeBuoy,
  PackageSearch,
  Plug,
  ShieldCheck,
  WifiOff,
} from 'lucide-react'
import type { ReactNode } from 'react'

import heroImage from '../../assets/home/hero.webp'
import insightsImage from '../../assets/home/insights.webp'
import inventoryImage from '../../assets/home/inventory.webp'
import marketplaceImage from '../../assets/home/marketplace.webp'
import posImage from '../../assets/home/pos.webp'
import stocktakingImage from '../../assets/home/stocktaking.webp'
import { cta } from './cta'
import { ProductPreview } from './ProductPreview'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { useHasSession } from './useHasSession'

export function HomePage() {
  const hasSession = useHasSession()
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader hasSession={hasSession} />
      <main id="main">
        <Hero hasSession={hasSession} />
        <Features />
        <Capabilities />
        <HowItWorks />
        <Marketplace />
        <PosInventory />
        <Benefits />
        <FinalCta hasSession={hasSession} />
      </main>
      <SiteFooter />
    </div>
  )
}

/* ------------------------------------------------------------------ */

function SectionIntro({
  eyebrow,
  title,
  children,
  align = 'left',
  tone = 'light',
}: {
  eyebrow: string
  title: string
  children?: ReactNode
  align?: 'left' | 'center'
  tone?: 'light' | 'night'
}) {
  return (
    <div className={'reveal max-w-2xl ' + (align === 'center' ? 'mx-auto text-center' : '')}>
      <p className={tone === 'night' ? 'eyebrow text-signal' : 'eyebrow'}>{eyebrow}</p>
      <h2
        className={
          'headline mt-4 text-3xl sm:text-[2.6rem] ' +
          (tone === 'night' ? 'text-night-foreground' : 'text-foreground')
        }
      >
        {title}
      </h2>
      {children && (
        <p
          className={
            'mt-5 text-base leading-relaxed sm:text-lg ' +
            (tone === 'night' ? 'text-night-muted' : 'text-muted-foreground')
          }
        >
          {children}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Hero({ hasSession }: { hasSession: boolean }) {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="grain-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_left,black_20%,transparent_70%)]"
      />
      <div className="container-site relative grid items-center gap-16 pb-24 pt-12 sm:pt-16 lg:grid-cols-[1.02fr_1fr] lg:gap-12 lg:pb-32 lg:pt-20">
        <div className="max-w-xl">
          <p className="rise eyebrow inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Stock-taking · POS · Inventory
          </p>
          <h1
            id="hero-title"
            className="rise headline mt-6 text-[2.6rem] text-foreground [animation-delay:80ms] sm:text-6xl lg:text-[4.1rem]"
          >
            Accurate stock counts, without slowing your business
          </h1>
          <p className="rise mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground [animation-delay:160ms]">
            BrathaMatu brings professional stock-taking, point of sale and inventory control into one
            workspace — so every branch knows what it holds, what it sold and what needs attention.
          </p>
          <div className="rise mt-9 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row">
            {hasSession ? (
              <Link to="/app" className={cta({ size: 'lg' })}>
                Open your workspace <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/register" className={cta({ size: 'lg' })}>
                  Create your workspace <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className={cta({ variant: 'outline', size: 'lg' })}>
                  Sign in
                </Link>
              </>
            )}
          </div>
          <p className="rise mt-6 text-sm text-muted-foreground [animation-delay:320ms]">
            Are you a stock taker?{' '}
            <Link to="/workforce/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Apply to join the workforce
            </Link>
          </p>
        </div>

        <div className="rise relative mx-auto w-full max-w-xl [animation-delay:200ms] lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-float sm:aspect-[5/4] lg:aspect-[4/5]">
            <img
              src={heroImage}
              alt="A stock taker scanning product barcodes along a warehouse aisle"
              width={1800}
              height={1200}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/45 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-10 right-4 sm:right-6 lg:-left-16 lg:right-auto lg:bottom-10">
            <ProductPreview />
          </div>
        </div>
      </div>

      <div className="border-y border-border bg-paper">
        <div className="container-site flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-10">
          <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Built for inventory-heavy businesses
          </p>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-foreground/80">
            {['Retail shops', 'Supermarkets', 'Pharmacies', 'Wholesale', 'Hardware', 'Restaurants', 'Multi-branch groups'].map(
              (item) => (
                <li key={item}>{item}</li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

const features = [
  {
    title: 'Smart Stocktaking',
    body: 'Request a stock-take, approve the quote and follow every stage — counting, QA review and variance results — in one place.',
    image: stocktakingImage,
    alt: 'Close-up of a handheld barcode scanner reading a product on a supermarket shelf',
    to: '/business/stocktaking',
    link: 'Stock-taking jobs',
  },
  {
    title: 'Powerful POS',
    body: 'Sell from registered terminals with shift opening, closing and reconciliation, and take cash, M-Pesa, card or mixed payments.',
    image: posImage,
    alt: 'A retail checkout counter with a point-of-sale terminal and barcode scanner',
    to: '/pos',
    link: 'Point of sale',
  },
  {
    title: 'Inventory Control',
    body: 'Track stock per branch, move it between locations, record conversions and keep your catalogue and barcodes in order.',
    image: inventoryImage,
    alt: 'A store manager checking stock levels on a tablet in a well-organised storeroom',
    to: '/business/inventory',
    link: 'Inventory',
  },
  {
    title: 'Business Insights',
    body: 'Review stock-take results, variances and sales reports so decisions are based on what is actually on your shelves.',
    image: insightsImage,
    alt: 'A business owner reviewing reports on a laptop in a small office',
    to: '/business/reports',
    link: 'Reports & analytics',
  },
] as const

function Features() {
  return (
    <section id="platform" aria-labelledby="platform-title" className="scroll-mt-20 py-24 sm:py-32">
      <div className="container-site">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="reveal max-w-2xl">
            <p className="eyebrow">The platform</p>
            <h2 id="platform-title" className="headline mt-4 text-3xl text-foreground sm:text-[2.6rem]">
              Four tools, one record of your stock
            </h2>
          </div>
          <p className="reveal max-w-md text-base leading-relaxed text-muted-foreground">
            Counts, sales and stock movements feed the same workspace, so the numbers your team sees at the till
            match the numbers your stock takers verify.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <li key={feature.title} className="reveal">
              <Link
                to={feature.to}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={feature.image}
                    alt={feature.alt}
                    width={1200}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">{feature.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {feature.link}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

const capabilities = [
  { icon: Building2, title: 'Branches & locations', body: 'Model every branch, store room and counting area your business runs.' },
  { icon: PackageSearch, title: 'Catalogue & barcodes', body: 'Products, units, SKUs and barcodes kept in one shared catalogue.' },
  { icon: ShieldCheck, title: 'Roles & permissions', body: 'Invite your team and give each person access to exactly what they need.' },
  { icon: CalendarClock, title: 'Scheduled stock-takes', body: 'Set weekly, monthly, quarterly or custom schedules — or request one on demand.' },
  { icon: WifiOff, title: 'Offline-ready counting', body: 'Stock takers download job packages and keep counting when the network drops.' },
  { icon: ClipboardCheck, title: 'QA-reviewed results', body: 'Counts are reviewed before results reach you, with variances clearly shown.' },
  { icon: Plug, title: 'Integrations', body: 'Connect the systems you already use from your workspace settings.' },
  { icon: LifeBuoy, title: 'Built-in support', body: 'Raise and follow support requests without leaving the platform.' },
]

function Capabilities() {
  return (
    <section aria-labelledby="capabilities-title" className="relative overflow-hidden bg-night py-24 text-night-foreground sm:py-32">
      <div aria-hidden="true" className="night-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="container-site relative">
        <div className="reveal max-w-2xl">
          <p className="eyebrow text-signal">Platform capabilities</p>
          <h2 id="capabilities-title" className="headline mt-4 text-3xl text-night-foreground sm:text-[2.6rem]">
            Everything a serious stock operation needs
          </h2>
          <p className="mt-5 text-base leading-relaxed text-night-muted sm:text-lg">
            The same workspace your managers, cashiers and stock takers sign in to every day.
          </p>
        </div>
        <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-night-line bg-night-line sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ icon: Icon, title, body }) => (
            <li key={title} className="reveal bg-night p-7 transition-colors duration-300 hover:bg-night-raised">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-night-line text-signal">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-base font-semibold text-night-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-night-muted">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

const steps = [
  { title: 'Create your workspace', body: 'Register your business and get a dedicated workspace for your team.' },
  { title: 'Add branches and products', body: 'Set up locations, import your catalogue and invite the people who run them.' },
  { title: 'Request or schedule a count', body: 'Ask for a stock-take, accept the quote and BrathaMatu assigns the stock takers.' },
  { title: 'Review results and act', body: 'Approve QA-reviewed results, investigate variances and keep selling with confidence.' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20 py-24 sm:py-32">
      <div className="container-site">
        <SectionIntro eyebrow="How it works" title="From sign-up to verified stock in four steps" align="center">
          No hardware projects or long onboarding — start with what you have and add more as you grow.
        </SectionIntro>
        <span id="how-title" className="sr-only">How it works</span>
        <ol className="relative mt-16 grid gap-10 md:grid-cols-4 md:gap-6">
          <span aria-hidden="true" className="absolute left-0 right-0 top-5 hidden h-px bg-border md:block" />
          {steps.map((step, index) => (
            <li key={step.title} className="reveal relative">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background font-display text-sm font-semibold text-primary shadow-soft">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-6 font-display text-lg font-semibold tracking-tight text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
        <div className="reveal mt-14 flex justify-center">
          <Link to="/register" className={cta({ variant: 'outline' })}>
            Start with step one <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Marketplace() {
  return (
    <section id="marketplace" aria-labelledby="marketplace-title" className="scroll-mt-20 bg-paper py-24 sm:py-32">
      <div className="container-site grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="reveal relative">
          <div className="overflow-hidden rounded-3xl shadow-card">
            <img
              src={marketplaceImage}
              alt="A team of stock takers counting products together in a supermarket aisle"
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              className="aspect-[5/4] w-full object-cover"
            />
          </div>
          <div className="absolute -right-3 -top-5 hidden rounded-2xl border border-border bg-card px-5 py-4 shadow-card sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Every job follows</p>
            <p className="mt-1 font-display text-base font-semibold text-foreground">Standard operating procedures</p>
          </div>
        </div>

        <div>
          <div className="reveal">
            <p className="eyebrow">Stock-taking marketplace</p>
            <h2 id="marketplace-title" className="headline mt-4 text-3xl text-foreground sm:text-[2.6rem]">
              Trained stock takers, assigned to your job
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Businesses request counts; BrathaMatu operations quotes the work and assigns registered stock takers
              from its workforce. Two sides, one accountable process.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="reveal rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">For businesses</p>
              <ul className="mt-4 space-y-2.5 text-sm text-foreground">
                <li>Request and track stock-takes</li>
                <li>Approve quotes before work starts</li>
                <li>Review QA-checked results</li>
              </ul>
              <Link to="/business/stocktaking/new" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                Request a stock-take <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="reveal rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">For stock takers</p>
              <ul className="mt-4 space-y-2.5 text-sm text-foreground">
                <li>Receive job assignments</li>
                <li>Count with offline support</li>
                <li>Track your earnings</li>
              </ul>
              <Link to="/workforce/register" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                Join the workforce <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function ShowcaseRow({
  image,
  alt,
  eyebrow,
  title,
  body,
  points,
  to,
  link,
  reverse = false,
}: {
  image: string
  alt: string
  eyebrow: string
  title: string
  body: string
  points: string[]
  to: '/pos' | '/business/inventory'
  link: string
  reverse?: boolean
}) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
      <div className={'reveal ' + (reverse ? 'lg:order-2' : '')}>
        <div className="overflow-hidden rounded-3xl shadow-card">
          <img
            src={image}
            alt={alt}
            width={1200}
            height={800}
            loading="lazy"
            decoding="async"
            className="aspect-[3/2] w-full object-cover"
          />
        </div>
      </div>
      <div className="reveal">
        <p className="eyebrow">{eyebrow}</p>
        <h3 className="headline mt-4 text-2xl text-foreground sm:text-[2.1rem]">{title}</h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {points.map((point) => (
            <li key={point} className="flex items-center gap-3 py-3.5 text-sm text-foreground">
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
              {point}
            </li>
          ))}
        </ul>
        <Link to={to} className={cta({ variant: 'outline', className: 'mt-8' })}>
          {link} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

function PosInventory() {
  return (
    <section id="pos-inventory" aria-labelledby="pos-title" className="scroll-mt-20 py-24 sm:py-32">
      <div className="container-site">
        <SectionIntro eyebrow="POS & inventory" title="The till and the stock room, finally in agreement" />
        <span id="pos-title" className="sr-only">POS and inventory</span>
        <div className="mt-16 space-y-24">
          <ShowcaseRow
            image={posImage}
            alt="A retail checkout counter with a point-of-sale terminal"
            eyebrow="Point of sale"
            title="A checkout built for busy counters"
            body="Every sale is tied to a terminal and a shift, so each cashier's day opens, closes and reconciles cleanly."
            points={[
              'Terminals and cashier shifts with reconciliation',
              'Cash, M-Pesa, card and mixed payments',
              'Product search by barcode, SKU or name',
              'Back office for purchase orders, transfers and refunds',
            ]}
            to="/pos"
            link="Open point of sale"
          />
          <ShowcaseRow
            image={inventoryImage}
            alt="A store manager checking stock on a tablet in a storeroom"
            eyebrow="Inventory"
            title="Stock you can trust at every branch"
            body="Movements from sales, transfers and stock-takes land in one place, giving managers an honest view of what is on hand."
            points={[
              'Stock levels per branch and location',
              'Transfers between branches',
              'Conversions with waste recorded',
              'Quick POS stock counts between full stock-takes',
            ]}
            to="/business/inventory"
            link="View inventory"
            reverse
          />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

const benefits = [
  { title: 'Fewer surprises at month end', body: 'Regular, verified counts surface shrinkage and errors while they are still small.' },
  { title: 'One record across branches', body: 'Sales, transfers and counts share the same catalogue, so every location reads the same way.' },
  { title: 'Accountable teams', body: 'Roles, permissions, shifts and audit history make it clear who did what, and when.' },
  { title: 'Decisions on real data', body: 'Reorder, price and plan from verified stock rather than estimates.' },
]

function Benefits() {
  return (
    <section aria-labelledby="benefits-title" className="border-t border-border bg-paper py-24 sm:py-32">
      <div className="container-site grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="reveal lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Business benefits</p>
          <h2 id="benefits-title" className="headline mt-4 text-3xl text-foreground sm:text-[2.6rem]">
            Clarity that pays for itself in everyday decisions
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Accurate stock is the foundation for pricing, purchasing and trust between owners and their teams.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit, index) => (
            <li key={benefit.title} className="reveal rounded-2xl border border-border bg-card p-7 shadow-soft">
              <span className="font-display text-sm font-semibold text-primary">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{benefit.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function FinalCta({ hasSession }: { hasSession: boolean }) {
  return (
    <section aria-labelledby="cta-title" className="py-24 sm:py-28">
      <div className="container-site">
        <div className="reveal relative overflow-hidden rounded-3xl bg-night px-6 py-16 text-center shadow-float sm:px-12 sm:py-20">
          <div aria-hidden="true" className="night-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 id="cta-title" className="headline text-3xl text-night-foreground sm:text-5xl">
              Start with a clear picture of your stock
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-night-muted sm:text-lg">
              Create your workspace, add your branches and request your first stock-take when you are ready.
            </p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              {hasSession ? (
                <Link to="/app" className={cta({ variant: 'signal', size: 'lg' })}>
                  Open your workspace <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className={cta({ variant: 'signal', size: 'lg' })}>
                    Create your workspace <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/login" className={cta({ variant: 'nightOutline', size: 'lg' })}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
