import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { QuantitySelector } from '@/components/common/QuantitySelector'
import { formatPrice } from '@/lib/format'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  loading?: boolean
}

export function CartItem({ item, onUpdateQuantity, onRemove, loading }: CartItemProps) {
  const product = item.variant?.product
  const primaryImage = product?.images?.find((i) => i.isPrimary) || product?.images?.[0]
  const variantAttrs = item.variant?.attributes?.map(
    (a) => a.attributeValue?.displayValue ?? a.attributeValue?.value,
  ).filter(Boolean).join(', ')

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0">
      {/* Image */}
      <Link to={product ? `/products/${product.slug}` : '#'} className="shrink-0 h-24 w-24 bg-background rounded overflow-hidden">
        {primaryImage ? (
          <img src={primaryImage.url} alt={product?.name} className="h-full w-full object-contain" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-text-secondary text-xs">No image</div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Link to={product ? `/products/${product.slug}` : '#'} className="text-sm font-medium text-text-primary hover:text-primary-hover line-clamp-2 mb-1">
          {product?.name ?? 'Product'}
        </Link>
        {variantAttrs && (
          <p className="text-xs text-text-secondary mb-1">{variantAttrs}</p>
        )}
        <p className="text-base font-bold text-danger mb-2">{formatPrice(item.unitPrice)}</p>

        <div className="mt-auto flex items-center gap-4">
          <QuantitySelector
            value={item.quantity}
            onChange={(qty) => onUpdateQuantity(item.id, qty)}
            min={1}
            max={10}
            disabled={loading}
          />
          <button
            onClick={() => onRemove(item.id)}
            disabled={loading}
            className="text-sm text-primary hover:text-primary-hover hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>

      {/* Line Total */}
      <div className="shrink-0 text-right">
        <p className="text-base font-bold text-text-primary">{formatPrice(item.unitPrice * item.quantity)}</p>
      </div>
    </div>
  )
}
