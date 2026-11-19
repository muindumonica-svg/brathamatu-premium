export function BrandMark({ tone = 'light' }: { tone?: 'light' | 'night' }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-night"
      >
        <span className="absolute inset-x-1.5 top-1.5 h-[3px] rounded-full bg-signal" />
        <span className="absolute inset-x-1.5 top-[13px] h-[3px] rounded-full bg-signal/70" />
        <span className="absolute inset-x-1.5 top-[20px] h-[3px] w-3 rounded-full bg-signal/45" />
      </span>
      <span
        className={
          'font-display text-[1.05rem] font-semibold tracking-tight ' +
          (tone === 'night' ? 'text-night-foreground' : 'text-foreground')
        }
      >
        BrathaMatu
      </span>
    </span>
  )
}
