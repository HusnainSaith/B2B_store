import { useEffect, useState } from "react";
import { SEOHead } from "@/components/common/SEOHead";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { cartApi } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import type { CartItem } from "@/types";
import { toast } from "sonner";

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    cartApi
      .getItems()
      .then((cartItems) => {
        setItems(cartItems);
        useCartStore.getState().setItems(cartItems);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    setUpdating(true);
    try {
      await cartApi.updateItem(itemId, { quantity });
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
      );
      useCartStore.getState().updateItemOptimistic(itemId, quantity);
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(true);
    try {
      await cartApi.removeItem(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      useCartStore.getState().removeItemOptimistic(itemId);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <SEOHead title="Wholesale Inquiry Basket" />
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: "Inquiry Basket" }]} />

        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyCart />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                  Wholesale Inquiry Basket{" "}
                  <span className="text-text-muted font-normal text-base">
                    ({items.length} {items.length === 1 ? "item" : "items"})
                  </span>
                </h1>
                <p className="mb-5 text-sm text-text-secondary">
                  Adjust the quantities you need. Pricing, shipping, and
                  commercial terms will be confirmed in your quotation.
                </p>
                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                      loading={updating}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div>
              <CartSummary subtotal={subtotal} itemCount={items.length} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
