import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { formatPrice } from '@/lib/format'
import type { Product, Category } from '@/types'

interface CategoryShowcaseProps {
  category: Category
  products: Product[]
  layout?: 'bento' | 'grid'
}

export function CategoryShowcase({ category, products, layout = 'bento' }: CategoryShowcaseProps) {
  if (products.length === 0) return null

  const hero = products[0]
  const rest = products.slice(1, layout === 'bento' ? 5 : 6)
  const heroImage = hero?.images?.find((i) => i.isPrimary)?.url || hero?.images?.[0]?.url

  return (
    <section className="py-12 md:py-16" aria-label={category.name}>
      <div className="container-main">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {category.imageUrl && (
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-surface flex items-center justify-center">
                <img src={category.imageUrl} alt="" className="h-8 w-8 object-contain" />
              </div>
            )}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">{category.name}</h2>
              {category.description && (
                <p className="text-sm text-text-secondary hidden sm:block">{category.description}</p>
              )}
            </div>
          </div>
          <Link
            to={`/products?categoryId=${category.id}`}
            className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1 shrink-0"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {layout === 'bento' ? (
          /* Bento Layout: Hero card left, 4 smaller cards right */
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-5 md:gap-6">
            {/* Hero Card */}
            <Link
              to={`/products/${hero.slug}`}
              className="col-span-2 lg:col-span-4 bg-card rounded-2xl border border-border overflow-hidden group hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[4/3] overflow-hidden bg-surface">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={hero.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/10 to-secondary/10" />
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2.5">
                  {hero.name}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-4">{hero.shortDesc}</p>
                <p className="text-lg font-bold text-text-primary mt-auto">{formatPrice(hero.basePrice)}</p>
              </div>
            </Link>

            {/* Small Cards Grid */}
            <div className="col-span-2 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {rest.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          /* Standard Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 md:gap-6">
            {[hero, ...rest].map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
