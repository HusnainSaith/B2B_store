import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center font-bold uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-surface text-text-secondary border border-border',
        sale: 'bg-danger text-white',
        new: 'bg-success text-white',
        hot: 'bg-primary text-white',
        info: 'bg-primary text-white',
        warning: 'bg-accent text-white',
        success: 'bg-success text-white',
        danger: 'bg-danger text-white',
      },
      size: {
        default: 'px-2 py-0.5 text-[11px] rounded-[3px]',
        sm: 'px-1.5 py-0.5 text-[10px] rounded-[2px]',
        lg: 'px-3 py-1 text-xs rounded-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
}

export { Badge, badgeVariants }
