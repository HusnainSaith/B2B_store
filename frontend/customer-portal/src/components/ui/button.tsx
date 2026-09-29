import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-primary text-black rounded-xl hover:bg-primary-hover hover:text-white focus-visible:ring-primary shadow-sm shadow-primary/20 hover:shadow-lg hover:shadow-primary/20 active:translate-y-px',
        secondary: 'bg-secondary text-white rounded-lg hover:bg-secondary-hover focus-visible:ring-secondary shadow-sm',
        outline: 'border border-border bg-card text-text-primary rounded-xl hover:border-primary hover:bg-primary/5 focus-visible:ring-primary',
        danger: 'bg-danger text-white rounded-lg hover:bg-[#DC2626] focus-visible:ring-danger',
        ghost: 'text-text-primary hover:bg-surface rounded-lg',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary-hover p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? children : <>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{children}</>}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
