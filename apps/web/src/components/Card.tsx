import React from 'react'
import { cn } from '../utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  colorTheme?: 1 | 2 | 3 | 4 | 5
  asymmetric?: 'rotate-left' | 'rotate-right' | 'clip-corner' | 'none'
  pattern?: 'dots' | 'stripes' | 'checker' | 'mesh' | 'none'
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, colorTheme = 1, asymmetric = 'none', pattern = 'none', children, ...props }, ref) => {
    
    const borders: Record<number, string> = {
      1: "border-[var(--color-max-accent-1)]",
      2: "border-[var(--color-max-accent-2)]",
      3: "border-[var(--color-max-accent-3)]",
      4: "border-[var(--color-max-accent-4)]",
      5: "border-[var(--color-max-accent-5)]",
    }
    
    const shadows: Record<number, string> = {
      1: "shadow-[8px_8px_0_var(--color-max-accent-2),16px_16px_0_var(--color-max-accent-3)]",
      2: "shadow-[8px_8px_0_var(--color-max-accent-3),16px_16px_0_var(--color-max-accent-1)]",
      3: "shadow-[8px_8px_0_var(--color-max-accent-1),16px_16px_0_var(--color-max-accent-5)]",
      4: "shadow-[8px_8px_0_var(--color-max-accent-5),16px_16px_0_var(--color-max-accent-2)]",
      5: "shadow-[8px_8px_0_var(--color-max-accent-4),16px_16px_0_var(--color-max-accent-1)]",
    }

    const hoverShadows: Record<number, string> = {
      1: "hover:shadow-[12px_12px_0_var(--color-max-accent-2),24px_24px_0_var(--color-max-accent-3)]",
      2: "hover:shadow-[12px_12px_0_var(--color-max-accent-3),24px_24px_0_var(--color-max-accent-1)]",
      3: "hover:shadow-[12px_12px_0_var(--color-max-accent-1),24px_24px_0_var(--color-max-accent-5)]",
      4: "hover:shadow-[12px_12px_0_var(--color-max-accent-5),24px_24px_0_var(--color-max-accent-2)]",
      5: "hover:shadow-[12px_12px_0_var(--color-max-accent-4),24px_24px_0_var(--color-max-accent-1)]",
    }

    const asymmetryStyles = {
      'rotate-left': '-rotate-1 hover:-rotate-2',
      'rotate-right': 'rotate-1 hover:rotate-2',
      'clip-corner': '[clip-path:polygon(0_0,100%_0,100%_calc(100%-24px),calc(100%-24px)_100%,0_100%)]',
      'none': 'hover:rotate-1'
    }

    const patternStyles = {
      dots: 'relative before:absolute before:inset-0 before:pattern-dots before:opacity-20 before:pointer-events-none before:z-[-1]',
      stripes: 'relative before:absolute before:inset-0 before:pattern-stripes before:opacity-20 before:pointer-events-none before:z-[-1]',
      checker: 'relative before:absolute before:inset-0 before:pattern-checker before:opacity-20 before:pointer-events-none before:z-[-1]',
      mesh: 'relative before:absolute before:inset-0 before:pattern-mesh before:opacity-20 before:pointer-events-none before:z-[-1]',
      none: ''
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-[var(--color-max-muted)]/80 backdrop-blur-sm border-4 rounded-3xl p-8 transition-all duration-300 ease-out z-10",
          "hover:scale-[1.02] hover:-translate-y-1 hover:-translate-x-1",
          borders[colorTheme],
          shadows[colorTheme],
          hoverShadows[colorTheme],
          asymmetryStyles[asymmetric],
          patternStyles[pattern],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export const CardHeader = ({ className, colorTheme = 2, ...props }: React.HTMLAttributes<HTMLDivElement> & { colorTheme?: number }) => {
  const borders: Record<number, string> = {
    1: "border-[var(--color-max-accent-1)]",
    2: "border-[var(--color-max-accent-2)]",
    3: "border-[var(--color-max-accent-3)]",
    4: "border-[var(--color-max-accent-4)]",
    5: "border-[var(--color-max-accent-5)]",
  }
  return (
    <div className={cn("pb-4 mb-6 border-b-4 border-dashed", borders[colorTheme as keyof typeof borders], className)} {...props} />
  )
}

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-2xl font-black uppercase text-shadow-single tracking-wide", className)} {...props} />
)
