import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ProductGrid } from '@/components/product/ProductGrid'
import { FilterSidebar } from '@/components/product/FilterSidebar'
import { SortDropdown } from '@/components/product/SortDropdown'
import { ActiveFilters } from '@/components/product/ActiveFilters'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { productsApi } from '@/services/api'
import { getMockProducts } from '@/hooks/useMockData'
import type { Product, PaginatedResponse } from '@/types'
import { DEFAULT_PAGE_SIZE } from '@/constants/config'
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ProductListItem } from '@/components/product/ProductListItem'

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const page = parseInt(searchParams.get('page') ?? '1')
  const search = searchParams.get('search') ?? undefined
  const categoryId = searchParams.get('categoryId') ?? undefined
  const brandId = searchParams.get('brandId') ?? undefined
  const sort = searchParams.get('sort') ?? undefined

  useEffect(() => {
    let cancelled = false
    productsApi
      .list({ page, limit: DEFAULT_PAGE_SIZE, search, categoryId, brandId, sort })
      .then((res: PaginatedResponse<Product>) => {
        if (cancelled) return
        setProducts(res.data)
        setTotal(res.total)
      })
      .catch(() => {
        const mock = getMockProducts({ page, limit: DEFAULT_PAGE_SIZE, search, categoryId })
        if (!cancelled) { setProducts(mock.data); setTotal(mock.total) }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, search, categoryId, brandId, sort])

  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE)

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <SEOHead title={search ? `Search: ${search}` : 'All Products'} />
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: 'Products' }]} />

        {/* Page Header */}
        {search && (
          <div className="mt-4 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Search results for &ldquo;{search}&rdquo;
            </h1>
          </div>
        )}

        <div className="flex gap-8 mt-4">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-4 flex-wrap bg-card rounded-xl border border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <p className="text-sm text-text-secondary font-medium">
                  {loading ? 'Loading…' : <><span className="text-text-primary font-semibold">{total}</span> results</>}
                  {search && !loading && <span className="text-text-muted"> for &ldquo;{search}&rdquo;</span>}
                </p>

                {/* Mobile filter toggle */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden rounded-lg">
                      <SlidersHorizontal className="h-4 w-4 mr-1.5" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] pt-10">
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center gap-3">
                <SortDropdown />
                <div className="hidden md:flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 cursor-pointer transition-all duration-200 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 cursor-pointer transition-all duration-200 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <ActiveFilters />

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                    <div className="aspect-square bg-surface" />
                    <div className="p-3.5 space-y-3">
                      <div className="h-3 bg-surface rounded-full w-1/3" />
                      <div className="h-4 bg-surface rounded-full w-3/4" />
                      <div className="h-4 bg-surface rounded-full w-1/2" />
                      <div className="h-5 bg-surface rounded-full w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={<LayoutGrid className="h-16 w-16" />}
                title="No products found"
                description="Try adjusting your filters or search terms."
              />
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <ProductGrid products={products} />
                ) : (
                  <div className="space-y-4">
                    {products.map((p) => (
                      <ProductListItem key={p.id} product={p} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-10 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                      className="rounded-lg px-4"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 7) {
                        pageNum = i + 1
                      } else if (page <= 4) {
                        pageNum = i + 1
                      } else if (page >= totalPages - 3) {
                        pageNum = totalPages - 6 + i
                      } else {
                        pageNum = page - 3 + i
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className={`rounded-lg min-w-[36px] ${page === pageNum ? 'shadow-md shadow-primary/20' : ''}`}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => goToPage(page + 1)}
                      className="rounded-lg px-4"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
