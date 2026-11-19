import { Check, ScanBarcode } from 'lucide-react'

// Illustrative interface preview: shows the real stock-take workflow stages
// and supported payment methods only — no figures or records.
const stages = [
  { label: 'Request submitted', state: 'done' },
  { label: 'Quote accepted', state: 'done' },
  { label: 'Stock takers assigned', state: 'done' },
  { label: 'Counting in progress', state: 'active' },
  { label: 'QA review', state: 'next' },
  { label: 'Results & variances', state: 'next' },
] as const

export function ProductPreview() {
  return (
    <div aria-hidden="true" className="relative">
      {/* Stock-take job panel */}
      <div className="w-[19rem] rounded-2xl border border-border bg-card p-5 shadow-float sm:w-[21rem]">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Stock-take job
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-soft px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            Counting
          </span>
        </div>
        <p className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground">Full branch count</p>

        <ol className="mt-4 space-y-2.5">
          {stages.map((stage) => (
            <li key={stage.label} className="flex items-center gap-3 text-sm">
              <span
                className={
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ' +
                  (stage.state === 'done'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : stage.state === 'active'
                      ? 'border-signal bg-signal-soft'
                      : 'border-border bg-card')
                }
              >
                {stage.state === 'done' && <Check className="h-3 w-3" strokeWidth={3} />}
                {stage.state === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-signal" />}
              </span>
              <span
                className={
                  stage.state === 'next'
                    ? 'text-muted-foreground'
                    : stage.state === 'active'
                      ? 'font-medium text-foreground'
                      : 'text-foreground'
                }
              >
                {stage.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-muted px-3 py-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-night text-night-foreground">
            <ScanBarcode className="h-4 w-4" />
            <span className="scan absolute inset-x-1 top-0.5 h-px bg-signal" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Scan or search</p>
            <p className="text-xs text-muted-foreground">Barcode, SKU or product name</p>
          </div>
        </div>
      </div>

      {/* POS checkout chip */}
      <div className="absolute -bottom-6 -left-52 hidden w-56 lg:-right-52 lg:left-auto lg:bottom-10 rounded-2xl border border-night-line bg-night p-4 text-night-foreground shadow-float sm:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-night-muted">POS checkout</p>
        <p className="mt-1.5 text-sm font-medium">Payment method</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['Cash', 'M-Pesa', 'Card'].map((method, index) => (
            <span
              key={method}
              className={
                'rounded-full px-2.5 py-1 text-xs ' +
                (index === 1 ? 'bg-signal text-night' : 'border border-night-line text-night-muted')
              }
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
