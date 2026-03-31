import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HERO_AUTOPLAY_INTERVAL } from '@/constants/config'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const BANNERS = [
  {
    id: 1,
    title: 'Mega Sale Season',
    subtitle: 'Up to 70% OFF on Electronics',
    cta: 'Shop Now',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1400&h=600&fit=crop&auto=format&q=80',
    gradient: 'from-black/70 via-black/40 to-transparent',
  },
  {
    id: 2,
    title: 'New Fashion Arrivals',
    subtitle: 'Trendy styles at unbeatable prices',
    cta: 'Explore Collection',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&h=600&fit=crop&auto=format&q=80',
    gradient: 'from-black/70 via-black/40 to-transparent',
  },
  {
    id: 3,
    title: 'Home & Living Sale',
    subtitle: 'Transform your space — Starting Rs. 499',
    cta: 'Discover',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&h=600&fit=crop&auto=format&q=80',
    gradient: 'from-black/70 via-black/40 to-transparent',
  },
  {
    id: 4,
    title: 'Flash Deals Live Now',
    subtitle: 'Limited time offers — Don\'t miss out',
    cta: 'View Deals',
    link: '/flash-sales',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=600&fit=crop&auto=format&q=80',
    gradient: 'from-black/70 via-black/40 to-transparent',
  },
]

export function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: HERO_AUTOPLAY_INTERVAL, stopOnInteraction: false }),
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  return (
    <section className="relative" aria-label="Hero banner">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {BANNERS.map((banner) => (
            <div key={banner.id} className="flex-[0_0_100%] min-w-0">
              <div className="relative h-[280px] sm:h-[380px] md:h-[440px] lg:h-[520px] overflow-hidden">
                {/* Background Image */}
                <img
                  src={banner.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={banner.id === 1 ? 'eager' : 'lazy'}
                />
                {/* Gradient Overlay */}
                <div className={cn('absolute inset-0 bg-gradient-to-r', banner.gradient)} />

                {/* Content */}
                <div className="container-main relative z-10 h-full flex items-center">
                  <div className="max-w-lg">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-[1.1] tracking-tight">
                      {banner.title}
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 md:mb-8 max-w-md">
                      {banner.subtitle}
                    </p>
                    <Link to={banner.link}>
                      <Button size="lg" className="text-sm md:text-base font-semibold px-8 h-12 rounded-xl bg-white text-gray-900 hover:bg-white/90 shadow-lg">
                        {banner.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            className={cn(
              'h-2 rounded-full transition-all duration-300 cursor-pointer',
              selectedIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60',
            )}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
