import { useEffect, useState } from 'react'
import { SEOHead } from '@/components/common/SEOHead'
import { HeroBanner } from '@/components/home/HeroBanner'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { FlashSaleSection } from '@/components/home/FlashSaleSection'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { TrendingCarousel } from '@/components/home/TrendingCarousel'
import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { VendorShowcase } from '@/components/home/VendorShowcase'
import { PromoBannerRow } from '@/components/home/PromoBannerRow'
import { BrandStrip } from '@/components/home/BrandStrip'
import { AppDownloadBanner } from '@/components/home/AppDownloadBanner'
import { productsApi, categoriesApi, storesApi } from '@/services/api'
import type { Product, Category, Store } from '@/types'
import { Package } from 'lucide-react'

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [trending, setTrending] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Store[]>([])
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({})
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingTrending, setLoadingTrending] = useState(true)
  const [loadingVendors, setLoadingVendors] = useState(true)

  useEffect(() => {
    // Fetch all products once — split across sections to avoid empty pages
    productsApi.list({ limit: 50 })
      .then((res) => {
        const all = res.data
        setFeatured(all.slice(0, 10))
        setNewArrivals([...all].reverse().slice(0, 10))
        setTrending(all.slice(0, 15))
      })
      .catch(() => {
        setFeatured([])
        setNewArrivals([])
        setTrending([])
      })
      .finally(() => {
        setLoadingFeatured(false)
        setLoadingNew(false)
        setLoadingTrending(false)
      })

    // Categories
    categoriesApi.list()
      .then((cats) => {
        const top = cats.filter((c) => c.isActive && !c.parentId).slice(0, 4)
        setCategories(top)
        // Fetch products per category
        top.forEach((cat) => {
          productsApi.list({ categoryId: cat.id, limit: 5 })
            .then((res) => {
              setCategoryProducts((prev) => ({ ...prev, [cat.id]: res.data }))
            })
            .catch(() => {
              setCategoryProducts((prev) => ({ ...prev, [cat.id]: [] }))
            })
        })
      })
      .catch(() => {
        setCategories([])
      })

    // Vendors
    storesApi.list()
      .then((s) => setVendors(s.filter((v) => v.isActive).slice(0, 4)))
      .catch(() => setVendors([]))
      .finally(() => setLoadingVendors(false))
  }, [])

  return (
    <>
      <SEOHead
        title="Zaroox — Your One-Stop Shop"
        description="Discover amazing deals on electronics, fashion, home & living, and more. Shop with confidence at Zaroox."
      />

      {/* 1. Hero */}
      <HeroBanner />

      {/* Sections with separators */}
      <div className="divide-y divide-border/40">
        {/* 2. Category Strip */}
        <CategoryStrip />

        {/* 3. Flash Sale */}
        <FlashSaleSection />

        {/* 4. Featured Products */}
        <div className="bg-surface/30">
          <FeaturedSection
            title="Featured Products"
            subtitle="Handpicked for you"
            products={featured}
            viewAllLink="/products"
            loading={loadingFeatured}
          />
        </div>

        {/* 5. Promo Banners */}
        <PromoBannerRow />

        {/* 6. Category Showcases — Bento layout for top categories */}
        {categories.map((cat, i) => (
          <div key={cat.id} className={i % 2 !== 0 ? 'bg-surface/30' : ''}>
            <CategoryShowcase
              category={cat}
              products={categoryProducts[cat.id] ?? []}
              layout={i % 2 === 0 ? 'bento' : 'grid'}
            />
          </div>
        ))}

        {/* 7. Trending Carousel */}
        <TrendingCarousel products={trending} loading={loadingTrending} />

        {/* 8. Top Vendors */}
        <div className="bg-surface/30">
          <VendorShowcase vendors={vendors} loading={loadingVendors} />
        </div>

        {/* 9. New Arrivals */}
        <FeaturedSection
          title="New Arrivals"
          subtitle="Fresh drops you'll love"
          products={newArrivals}
          viewAllLink="/products?sort=newest"
          loading={loadingNew}
          icon={
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
          }
        />

        {/* 10. Brands */}
        <div className="bg-surface/30">
          <BrandStrip />
        </div>
      </div>

      {/* 11. App Download */}
      <div className="mt-6">
        <AppDownloadBanner />
      </div>
    </>
  )
}
