import React from 'react'
import { cn } from '../utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'default' | 'large' | 'icon'
  colorTheme?: 1 | 2 | 3 | 4 | 5
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', colorTheme = 1, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
    
    // Focus ring colors rotate based on theme
    const focusRings: Record<number, string> = {
      1: "focus:ring-[#FF3AF2] focus:ring-offset-[#00F5D4]",
      2: "focus:ring-[#00F5D4] focus:ring-offset-[#FFE600]",
      3: "focus:ring-[#FFE600] focus:ring-offset-[#FF6B35]",
      4: "focus:ring-[#FF6B35] focus:ring-offset-[#7B2FFF]",
      5: "focus:ring-[#7B2FFF] focus:ring-offset-[#FF3AF2]",
    }

    const sizes = {
      default: "h-14 px-10 text-lg",
      large: "h-16 px-12 text-xl",
      icon: "h-14 w-14",
    }

    const variants = {
      primary: cn(
        "rounded-full border-4 border-[var(--color-max-accent-3)] text-white shadow-glow-base",
        "bg-gradient-shift hover:scale-110 hover:shadow-glow-large active:scale-95 active:shadow-none",
        "bg-[#FF3AF2]" // fallback
      ),
      secondary: cn(
        "rounded-full border-4 border-dashed border-[var(--color-max-accent-2)] bg-transparent text-white",
        "hover:bg-[var(--color-max-accent-2)] hover:border-solid hover:text-black hover:scale-105 active:scale-95"
      ),
      outline: cn(
        "rounded-2xl border-4 border-[var(--color-max-accent-1)] bg-[var(--color-max-muted)]/50 text-white shadow-hard-double",
        "hover:-translate-y-2 hover:-translate-x-2 hover:shadow-hard-triple active:translate-y-0 active:translate-x-0 active:shadow-none"
      ),
      ghost: cn(
        "rounded-xl bg-transparent text-white underline decoration-[var(--color-max-accent-1)] decoration-4 underline-offset-4",
        "hover:bg-[var(--color-max-accent-5)]/20 hover:scale-105 active:scale-95 pattern-dots hover:bg-blend-overlay"
      )
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, focusRings[colorTheme], sizes[size], variants[variant], className)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
