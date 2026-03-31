import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'

interface TrendingCarouselProps {
  products: Product[]
  loading?: boolean
}

export function TrendingCarousel({ products, loading }: TrendingCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', slidesToScroll: 1, containScroll: 'trimSnaps' },
    [Autoplay({ delay: 4000, stopOnInteraction: true })],
  )
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  if (!loading && products.length === 0) return null

  return (
    <section className="py-10 md:py-14" aria-label="Trending now">
      <div className="container-main">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Trending Now</h2>
              <p className="text-sm text-text-secondary">Most popular picks this week</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className={cn(
                'h-10 w-10 rounded-full border border-border flex items-center justify-center transition-all cursor-pointer',
                canScrollPrev ? 'hover:bg-surface hover:border-border-hover text-text-primary' : 'opacity-30 cursor-default',
              )}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className={cn(
                'h-10 w-10 rounded-full border border-border flex items-center justify-center transition-all cursor-pointer',
                canScrollNext ? 'hover:bg-surface hover:border-border-hover text-text-primary' : 'opacity-30 cursor-default',
              )}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-surface mb-3" />
                <div className="h-4 bg-surface rounded w-3/4 mb-2" />
                <div className="h-4 bg-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div ref={emblaRef} className="overflow-hidden -mx-2">
            <div className="flex">
              {products.map((product) => (
                <div key={product.id} className="flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_20%] min-w-0 px-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
