import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SEOHead } from "@/components/common/SEOHead";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { ImageGallery } from "@/components/product/ImageGallery";
import { VariantSelector } from "@/components/product/VariantSelector";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { StarRating } from "@/components/common/StarRating";
import { QuantitySelector } from "@/components/common/QuantitySelector";
import { ReviewSummary } from "@/components/product/ReviewSummary";
import { ReviewCard } from "@/components/product/ReviewCard";
import { ReviewForm } from "@/components/product/ReviewForm";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { productsApi, reviewsApi, cartApi } from "@/services/api";
import {
  getMockProductBySlug,
  getMockProducts,
  getMockReviewsByProduct,
  getMockRatingSummary,
} from "@/hooks/useMockData";
import { sanitizeHtml } from "@/lib/sanitize";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import type {
  Product,
  ProductVariant,
  ProductImage,
  Review,
  RatingSummary,
} from "@/types";
import {
  ShoppingCart,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RefreshCw,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(
    null,
  );
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productsApi
      .getBySlug(slug)
      .then(async (p) => {
        setProduct(p);

        const [v, img] = await Promise.all([
          productsApi.getVariants(p.id),
          productsApi.getImages(p.id),
        ]);
        setVariants(v);
        setImages(img);
        if (v.length > 0) setSelectedVariant(v.find((x) => x.isActive) ?? v[0]);

        // Load reviews + summary
        reviewsApi
          .list({ productId: p.id, limit: 10 })
          .then((r) => setReviews(r.data))
          .catch(() => {
            setReviews(getMockReviewsByProduct(p.id));
          });
        reviewsApi
          .getSummary(p.id)
          .then(setRatingSummary)
          .catch(() => {
            setRatingSummary(getMockRatingSummary(p.id));
          });

        // Related products from same category
        if (p.categoryId) {
          productsApi
            .list({ categoryId: p.categoryId, limit: 6 })
            .then((r) => {
              setRelatedProducts(
                r.data.filter((x) => x.id !== p.id).slice(0, 5),
              );
            })
            .catch(() => {
              setRelatedProducts(
                getMockProducts({ categoryId: p.categoryId, limit: 6 })
                  .data.filter((x) => x.id !== p.id)
                  .slice(0, 5),
              );
            });
        }

        setLoading(false);
      })
      .catch(() => {
        // Fallback to mock data
        const mock = getMockProductBySlug(slug);
        if (mock) {
          setProduct(mock);
          setVariants(mock.variants ?? []);
          setImages(mock.images ?? []);
          if (mock.variants?.length)
            setSelectedVariant(
              mock.variants.find((x) => x.isActive) ?? mock.variants[0],
            );
          setReviews(getMockReviewsByProduct(mock.id));
          setRatingSummary(getMockRatingSummary(mock.id));
          if (mock.categoryId) {
            setRelatedProducts(
              getMockProducts({ categoryId: mock.categoryId, limit: 6 })
                .data.filter((x) => x.id !== mock.id)
                .slice(0, 5),
            );
          }
        }
        setLoading(false);
      });
  }, [slug]);

  const handleAddToCart = async () => {
    if (!selectedVariant || !isAuthenticated) {
      if (!isAuthenticated)
        toast.error("Please log in to add products to your inquiry");
      return;
    }
    setAddingToCart(true);
    try {
      const item = await cartApi.addItem({
        variantId: selectedVariant.id,
        quantity,
      });
      useCartStore.getState().addItemOptimistic(item);
      toast.success("Added to inquiry basket!");
      setQuantity(1);
    } catch {
      toast.error("Failed to add to inquiry basket");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="container-main py-8">
        <div className="h-4 bg-surface rounded-full w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-3">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-5 pt-2">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded-lg" />
            <Skeleton className="h-5 w-1/4 rounded-lg" />
            <Skeleton className="h-10 w-1/2 rounded-lg" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-6 w-2/3 rounded-lg" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-main py-20 text-center">
        <div className="max-w-sm mx-auto">
          <div className="h-20 w-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-10 w-10 text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            Product not found
          </h2>
          <p className="text-text-secondary mt-2 text-sm">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            to="/products"
            className="inline-block mt-4 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            ← Browse all products
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = selectedVariant?.price ?? product.basePrice;
  const originalPrice =
    product.basePrice !== displayPrice ? product.basePrice : undefined;

  return (
    <>
      <SEOHead
        title={product.name}
        description={product.shortDesc ?? `Buy ${product.name} at Zaroox`}
        image={images[0]?.url}
      />

      <div className="container-main py-6">
        <Breadcrumb
          items={[
            { label: "Products", to: "/products" },
            ...(product.category
              ? [
                  {
                    label: product.category.name,
                    to: `/products?categoryId=${product.category.id ?? ""}`,
                  },
                ]
              : []),
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
          {/* Images */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ImageGallery images={images} productName={product.name} />
          </div>

          {/* Details */}
          <div className="space-y-5">
            {/* Store badge */}
            {product.store && (
              <Link
                to={`/stores/${product.store.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-light px-3 py-1.5 rounded-full hover:bg-primary/15 transition-colors"
              >
                <Store className="h-3.5 w-3.5" /> {product.store.name}
              </Link>
            )}

            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {ratingSummary && (
              <div className="flex items-center gap-2">
                <StarRating
                  rating={ratingSummary.avg ?? ratingSummary.average ?? 0}
                  size="md"
                />
                <span className="text-sm font-medium text-text-secondary">
                  {(ratingSummary.avg ?? ratingSummary.average ?? 0).toFixed(1)}
                </span>
                <span className="text-sm text-text-muted">
                  ({ratingSummary.count ?? ratingSummary.total ?? 0} reviews)
                </span>
              </div>
            )}

            <Separator />

            {/* Price */}
            <PriceDisplay
              currentPrice={displayPrice}
              originalPrice={originalPrice}
              size="lg"
            />

            {product.shortDesc && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {product.shortDesc}
              </p>
            )}

            <Separator />

            {/* Variants */}
            <VariantSelector
              variants={variants}
              selectedVariantId={selectedVariant?.id}
              onSelect={setSelectedVariant}
            />

            {/* Quantity + inquiry basket */}
            <div className="flex items-center gap-3 pt-2">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={10}
              />
              <Button
                size="lg"
                className="flex-1 font-bold h-12 rounded-xl text-sm uppercase tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedVariant}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addingToCart ? "Adding…" : "Add to Inquiry"}
              </Button>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-6">
              <button className="text-sm text-text-secondary hover:text-primary flex items-center gap-1.5 cursor-pointer transition-colors">
                <Heart className="h-4 w-4" /> Wishlist
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }}
                className="text-sm text-text-secondary hover:text-primary flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>

            {/* Trust badges */}
            <div className="bg-surface rounded-xl p-4 mt-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-success" />
                  </div>
                  <span className="text-xs font-medium text-text-secondary">
                    Free Delivery
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-success" />
                  </div>
                  <span className="text-xs font-medium text-text-secondary">
                    Easy Returns
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-success" />
                  </div>
                  <span className="text-xs font-medium text-text-secondary">
                    Tailored Quotation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <Tabs defaultValue="description" className="mt-14">
          <TabsList className="bg-surface rounded-xl p-1">
            <TabsTrigger
              value="description"
              className="rounded-lg px-6 py-2.5 text-sm font-semibold"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-lg px-6 py-2.5 text-sm font-semibold"
            >
              Reviews ({ratingSummary?.count ?? ratingSummary?.total ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
              {product.fullDesc ? (
                <div
                  className="prose prose-sm max-w-none text-text-primary leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(product.fullDesc),
                  }}
                />
              ) : (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {product.shortDesc ?? "No description available."}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6">
              {ratingSummary && <ReviewSummary summary={ratingSummary} />}
              <Separator />
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-text-muted">
                    No reviews yet. Be the first to review!
                  </p>
                </div>
              )}
              {isAuthenticated && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-4">
                      Write a Review
                    </h3>
                    <ReviewForm
                      productId={product.id}
                      onSuccess={() => {
                        reviewsApi
                          .list({ productId: product.id, limit: 10 })
                          .then((r) => setReviews(r.data))
                          .catch(() => {});
                        reviewsApi
                          .getSummary(product.id)
                          .then(setRatingSummary)
                          .catch(() => {});
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-14 mb-4">
            <ProductCarousel
              products={relatedProducts}
              title="You May Also Like"
            />
          </div>
        )}
      </div>
    </>
  );
}
