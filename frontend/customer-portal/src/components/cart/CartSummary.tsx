import { formatPrice } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface CartSummaryProps {
  subtotal: number
  itemCount: number
  discount?: number
  shipping?: number
  couponCode?: string
  couponId?: string
}

export function CartSummary({ subtotal, itemCount, discount = 0, shipping, couponCode, couponId }: CartSummaryProps) {
  const shippingCost = shipping ?? (subtotal >= 2000 ? 0 : 150)
  const total = subtotal - discount + shippingCost

  return (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 sticky top-24">
      <h2 className="text-lg font-bold text-text-primary mb-5">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-text-secondary">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span className="text-text-primary font-medium">{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount {couponCode && `(${couponCode})`}</span>
            <span className="font-medium">−{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-text-secondary">
          <span>Shipping</span>
          <span className="font-medium">{shippingCost === 0 ? <span className="text-success">FREE</span> : formatPrice(shippingCost)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between text-xl font-bold text-text-primary mb-5">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      {subtotal < 2000 && (
        <div className="bg-success/5 border border-success/20 rounded-xl p-3 mb-4">
          <p className="text-xs text-success font-medium flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            Add {formatPrice(2000 - subtotal)} more for FREE shipping!
          </p>
        </div>
      )}

      <Link to={ROUTES.CHECKOUT} state={{ couponId }}>
        <Button className="w-full font-bold h-12 rounded-xl text-sm uppercase tracking-wide shadow-lg shadow-primary/20" size="lg" disabled={itemCount === 0}>
          Proceed to Checkout
        </Button>
      </Link>

      <div className="flex items-center gap-1.5 justify-center mt-4 text-xs text-text-muted">
        <ShieldCheck className="h-3.5 w-3.5 text-success" /> Secure checkout with SSL encryption
      </div>
    </div>
  )
}
