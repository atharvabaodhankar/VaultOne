import React from 'react'
import { cn } from '../utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  colorTheme?: 1 | 2 | 3 | 4 | 5
  label?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, colorTheme = 1, label, id, ...props }, ref) => {
    
    const borders: Record<number, string> = {
      1: "border-[var(--color-max-accent-1)]",
      2: "border-[var(--color-max-accent-2)]",
      3: "border-[var(--color-max-accent-3)]",
      4: "border-[var(--color-max-accent-4)]",
      5: "border-[var(--color-max-accent-5)]",
    }

    const focusStyles: Record<number, string> = {
      1: "focus:border-[var(--color-max-accent-2)] focus:ring-[#FF3AF2]/30 focus:ring-offset-[#00F5D4]",
      2: "focus:border-[var(--color-max-accent-3)] focus:ring-[#00F5D4]/30 focus:ring-offset-[#FFE600]",
      3: "focus:border-[var(--color-max-accent-4)] focus:ring-[#FFE600]/30 focus:ring-offset-[#FF6B35]",
      4: "focus:border-[var(--color-max-accent-5)] focus:ring-[#FF6B35]/30 focus:ring-offset-[#7B2FFF]",
      5: "focus:border-[var(--color-max-accent-1)] focus:ring-[#7B2FFF]/30 focus:ring-offset-[#FF3AF2]",
    }

    const labelColors: Record<number, string> = {
      1: "text-[var(--color-max-accent-1)]",
      2: "text-[var(--color-max-accent-2)]",
      3: "text-[var(--color-max-accent-3)]",
      4: "text-[var(--color-max-accent-4)]",
      5: "text-[var(--color-max-accent-5)]",
    }

    const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined)

    return (
      <div className="flex flex-col gap-2 relative">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "font-display text-xl uppercase tracking-wider rotate-1 origin-left ml-2",
              labelColors[colorTheme]
            )}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full bg-[var(--color-max-muted)]/50 backdrop-blur-sm border-4 rounded-full px-6 py-4 text-lg font-bold text-white placeholder:text-white/40 transition-all duration-300",
            "focus:outline-none focus:bg-[var(--color-max-muted)] focus:ring-4 focus:ring-offset-2",
            borders[colorTheme],
            focusStyles[colorTheme],
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = 'Input'
