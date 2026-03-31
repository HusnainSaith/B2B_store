import { useEffect, useState } from 'react'
import { brandsApi } from '@/services/api'
import { getMockBrands } from '@/hooks/useMockData'
import type { Brand } from '@/types'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Link } from 'react-router-dom'
import { Award } from 'lucide-react'

export function BrandStrip() {
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    brandsApi.list().then((b) => setBrands(b.filter((br) => br.isActive).slice(0, 16))).catch(() => {
      setBrands(getMockBrands().slice(0, 16))
    })
  }, [])

  if (brands.length === 0) return null

  return (
    <section className="py-8 md:py-10" aria-label="Shop by brand">
      <div className="container-main">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Top Brands</h2>
            <p className="text-sm text-text-secondary">Shop from brands you trust</p>
          </div>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-4 items-center pb-2">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/products?brandId=${brand.id}`}
                className="shrink-0 group"
              >
                <div className="h-20 w-32 bg-card rounded-xl border border-border flex items-center justify-center px-4 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] transition-all duration-300">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="h-10 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary transition-colors text-center">
                      {brand.name}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  )
}
