import { Link } from 'react-router-dom'
import { Star, ShieldCheck, ChevronRight } from 'lucide-react'
import type { Store } from '@/types'

interface VendorShowcaseProps {
  vendors: Store[]
  loading?: boolean
}

export function VendorShowcase({ vendors, loading }: VendorShowcaseProps) {
  if (!loading && vendors.length === 0) return null

  return (
    <section className="py-10 md:py-14" aria-label="Top rated vendors">
      <div className="container-main">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight">Top Rated Vendors</h2>
            <p className="text-sm text-text-secondary mt-1">Trusted sellers with outstanding service</p>
          </div>
          <Link to="/products" className="text-sm font-medium text-primary hover:text-primary-hover flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Vendor Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-card rounded-2xl border border-border p-6">
                <div className="h-14 w-14 rounded-full bg-surface mb-4" />
                <div className="h-5 bg-surface rounded w-3/4 mb-2" />
                <div className="h-4 bg-surface rounded w-full mb-3" />
                <div className="h-3 bg-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                to={`/stores/${vendor.slug}`}
                className="group bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] transition-all duration-300"
              >
                {/* Avatar + Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    {vendor.logoUrl ? (
                      <img
                        src={vendor.logoUrl}
                        alt={vendor.name}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl">
                        {vendor.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-success flex items-center justify-center ring-2 ring-card">
                      <ShieldCheck className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-warning">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">4.8</span>
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors mb-1 line-clamp-1">
                  {vendor.name}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                  {vendor.description || 'Premium quality products and excellent customer service'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" /> Active
                  </span>
                  <span>Fast Delivery</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
