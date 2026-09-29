import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { cartApi } from "@/services/api";
import { toast } from "sonner";
import { isUuid } from "@/lib/validation";

interface ProductGridProps {
  products: Product[];
  columns?: 3 | 4 | 5;
  className?: string;
}

export function ProductGrid({
  products,
  columns = 4,
  className,
}: ProductGridProps) {
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { setItemCount, itemCount } = useCartStore();

  const colClasses = {
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  const handleToggleWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error("Please login to use wishlist");
      return;
    }
    const variantId = product.variants?.[0]?.id;
    if (!variantId) return;
    try {
      await toggleWishlist(variantId);
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add products to your inquiry");
      return;
    }
    const variantId = product.variants?.[0]?.id;
    if (!variantId || !isUuid(variantId)) {
      toast.error("No variant available");
      return;
    }
    try {
      await cartApi.addItem({ variantId, quantity: 1 });
      setItemCount(itemCount + 1);
      toast.success("Added to inquiry basket!");
    } catch {
      toast.error("Failed to add to inquiry basket");
    }
  };

  return (
    <div className={cn("grid gap-5 md:gap-6", colClasses[columns], className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={
            isAuthenticated &&
            !!product.variants?.[0]?.id &&
            isWishlisted(product.variants[0].id)
          }
          onToggleWishlist={() => handleToggleWishlist(product)}
          onAddToCart={() => handleAddToCart(product)}
        />
      ))}
    </div>
  );
}
