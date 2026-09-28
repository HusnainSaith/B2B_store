import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, calculateDiscount } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface ProductListItemProps {
  product: Product;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
}

export function ProductListItem({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: ProductListItemProps) {
  const primaryImage =
    product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const displayPrice = product.variants?.[0]?.price ?? product.basePrice;
  const discountPercent =
    displayPrice < product.basePrice
      ? calculateDiscount(product.basePrice, displayPrice)
      : null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex gap-5 hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)] transition-all duration-300">
      {/* Image */}
      <Link
        to={`/products/${product.slug}`}
        className="shrink-0 w-[180px] h-[180px] bg-surface rounded-xl overflow-hidden"
      >
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-text-muted text-sm">
            No image
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-base font-semibold text-text-primary hover:text-primary line-clamp-2 mb-1.5 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.store && (
          <Link
            to={`/stores/${product.store.slug}`}
            className="text-xs text-primary hover:underline mb-1"
          >
            by {product.store.name}
          </Link>
        )}

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xl font-bold text-text-primary">
            {formatPrice(displayPrice)}
          </span>
          {discountPercent && discountPercent > 0 && (
            <>
              <span className="text-sm text-text-secondary line-through">
                {formatPrice(product.basePrice)}
              </span>
              <Badge variant="sale">-{discountPercent}%</Badge>
            </>
          )}
        </div>

        {product.shortDesc && (
          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {product.shortDesc}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2">
          <Button size="sm" onClick={onAddToCart} className="rounded-xl">
            <ShoppingCart className="h-4 w-4 mr-1.5" /> Add to Inquiry
          </Button>
          <button
            onClick={onToggleWishlist}
            className={cn(
              "h-9 w-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer",
              isWishlisted
                ? "bg-red-50 border-red-200"
                : "border-border hover:border-primary",
            )}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isWishlisted
                  ? "fill-danger text-danger"
                  : "text-text-secondary",
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
