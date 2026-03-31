import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/types'

interface FeaturedSectionProps {
  title: string
  products: Product[]
  viewAllLink?: string
  loading?: boolean
  icon?: React.ReactNode
  subtitle?: string
}

export function FeaturedSection({ title, products, viewAllLink, loading, icon, subtitle }: FeaturedSectionProps) {
  if (!loading && products.length === 0) return null

  return (
    <section className="py-12 md:py-16" aria-label={title}>
      <div className="container-main">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {icon || (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">{title}</h2>
              {subtitle && <p className="text-sm text-text-secondary">{subtitle}</p>}
            </div>
          </div>
          {viewAllLink && (
            <Link to={viewAllLink} className="group text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors">
              View All <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-surface mb-3" />
                <div className="h-4 bg-surface rounded w-3/4 mb-2" />
                <div className="h-4 bg-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
