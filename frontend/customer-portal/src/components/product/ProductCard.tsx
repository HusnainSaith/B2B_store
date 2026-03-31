import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice, calculateDiscount } from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'

interface ProductCardProps {
  product?: Product
  flashPrice?: number
  compact?: boolean
  className?: string
  onAddToCart?: () => void
  onToggleWishlist?: () => void
  isWishlisted?: boolean
}

export function ProductCard({
  product,
  flashPrice,
  compact,
  className,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: ProductCardProps) {
  if (!product) return null

  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0]
  const secondaryImage = product.images?.find((i) => !i.isPrimary && i.id !== primaryImage?.id)
  const displayPrice = flashPrice ?? (product.variants?.[0]?.price ?? product.basePrice)
  const originalPrice = flashPrice ? product.basePrice : undefined
  const discountPercent = originalPrice ? calculateDiscount(originalPrice, displayPrice) : null

  const productLink = `/products/${product.slug}`

  return (
    <div className={cn('group bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)] transition-all duration-300', className)}>
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={productLink} className="block aspect-square overflow-hidden bg-surface">
          {primaryImage ? (
            <>
              <img
                src={primaryImage.url}
                alt={primaryImage.altText ?? product.name}
                className={cn(
                  'h-full w-full object-cover transition-all duration-500',
                  secondaryImage && 'group-hover:opacity-0',
                )}
                loading="lazy"
              />
              {secondaryImage && (
                <img
                  src={secondaryImage.url}
                  alt={secondaryImage.altText ?? product.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:opacity-100"
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-text-muted bg-surface">
              <Eye className="h-10 w-10" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {flashPrice && (
            <Badge className="bg-danger text-white border-0 font-semibold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
              Flash Sale
            </Badge>
          )}
          {discountPercent && discountPercent > 0 && (
            <Badge className="bg-danger text-white border-0 font-semibold text-[10px] px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); onToggleWishlist?.() }}
          className={cn(
            'absolute top-2.5 right-2.5 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:bg-card hover:scale-110',
            isWishlisted && 'opacity-100',
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', isWishlisted ? 'fill-danger text-danger' : 'text-text-secondary')} />
        </button>

        {/* Quick Add */}
        {!compact && (
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart?.() }}
            className="absolute bottom-0 inset-x-0 bg-primary/95 backdrop-blur-sm text-white text-sm font-semibold py-2.5 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingCart className="h-4 w-4" /> Add to Cart
          </button>
        )}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col flex-1 p-3.5', compact && 'p-2.5')}>
        {/* Store */}
        {product.store && !compact && (
          <Link
            to={`/stores/${product.store.slug}`}
            className="text-[11px] text-text-muted hover:text-primary transition-colors mb-1.5 line-clamp-1 uppercase tracking-wider font-medium"
          >
            {product.store.name}
          </Link>
        )}

        {/* Title */}
        <Link to={productLink} className="block mb-2">
          <h3 className={cn(
            'text-sm text-text-primary hover:text-primary line-clamp-2 font-medium leading-snug transition-colors',
            compact && 'text-xs',
          )}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {!compact && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3.5 w-3.5 fill-star text-star" />
            <span className="text-xs font-medium text-text-secondary">4.5</span>
            <span className="text-xs text-text-muted">(128)</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={cn('font-bold text-text-primary', compact ? 'text-sm' : 'text-base')}>
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && originalPrice > displayPrice && (
              <span className="text-xs text-text-muted line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
