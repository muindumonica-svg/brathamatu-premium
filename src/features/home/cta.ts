import { cva } from 'class-variance-authority'

// Call-to-action styles for the public homepage.
export const cta = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-soft hover:-translate-y-px hover:bg-primary/92 hover:shadow-card',
        signal: 'bg-signal text-night shadow-soft hover:-translate-y-px hover:bg-signal/90 hover:shadow-card',
        outline: 'border border-border bg-card text-foreground hover:border-foreground/25 hover:bg-muted',
        nightOutline: 'border border-night-line text-night-foreground hover:border-night-foreground/40 hover:bg-night-raised',
        quiet: 'text-foreground hover:text-primary',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-12 px-6 text-[0.95rem]',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)
