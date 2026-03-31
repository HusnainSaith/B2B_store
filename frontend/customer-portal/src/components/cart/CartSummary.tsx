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
    <div className="bg-card rounded-xl border border-border p-4 sticky top-24">
      <h2 className="text-lg font-bold text-text-primary mb-4">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-text-primary">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount {couponCode && `(${couponCode})`}</span>
            <span>−{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-text-primary">
          <span>Shipping</span>
          <span>{shippingCost === 0 ? <span className="text-success">FREE</span> : formatPrice(shippingCost)}</span>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="flex justify-between text-lg font-bold text-danger mb-4">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      {subtotal < 2000 && (
        <p className="text-xs text-success mb-3">
          <Truck className="h-3 w-3 inline mr-1" />
          Add {formatPrice(2000 - subtotal)} more for FREE shipping!
        </p>
      )}

      <Link to={ROUTES.CHECKOUT} state={{ couponId }}>
        <Button className="w-full font-bold" size="lg" disabled={itemCount === 0}>
          Proceed to Checkout
        </Button>
      </Link>

      <div className="flex items-center gap-1 justify-center mt-3 text-xs text-text-secondary">
        <ShieldCheck className="h-3.5 w-3.5 text-success" /> Secure checkout
      </div>
    </div>
  )
}
