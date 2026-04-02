import { useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'

interface ProductCarouselProps {
  products: Product[]
  title?: string
  className?: string
}

export function ProductCarousel({ products, title, className }: ProductCarouselProps) {
  const { isAuthenticated } = useAuthStore()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', slidesToScroll: 2, containScroll: 'trimSnaps' })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  useEffect(() => {
    if (!emblaApi) return
    const onUpdate = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
    }
    onUpdate()
    emblaApi.on('select', onUpdate)
    emblaApi.on('reInit', onUpdate)
    return () => {
      emblaApi.off('select', onUpdate)
      emblaApi.off('reInit', onUpdate)
    }
  }, [emblaApi])

  if (products.length === 0) return null

  return (
    <div className={cn('relative', className)}>
      {title && <h3 className="text-lg font-bold text-text-primary mb-3">{title}</h3>}

      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4">
          {products.map((product) => (
            <div key={product.id} className="flex-[0_0_200px] md:flex-[0_0_220px] min-w-0">
              <ProductCard
                product={product}
                compact
                isWishlisted={isAuthenticated && !!product.variants?.[0]?.id && isWishlisted(product.variants[0].id)}
                onToggleWishlist={async () => {
                  if (!isAuthenticated) { toast.error('Please login to use wishlist'); return }
                  const vid = product.variants?.[0]?.id; if (vid) try { await toggleWishlist(vid) } catch { toast.error('Failed to update wishlist') }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {canPrev && (
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute -left-3 top-1/2 -translate-y-1/2 h-20 w-8 bg-card border border-border rounded shadow-sm flex items-center justify-center hover:bg-background transition-colors cursor-pointer z-10"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5 text-text-primary" />
        </button>
      )}
      {canNext && (
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-20 w-8 bg-card border border-border rounded shadow-sm flex items-center justify-center hover:bg-background transition-colors cursor-pointer z-10"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5 text-text-primary" />
        </button>
      )}
    </div>
  )
}
