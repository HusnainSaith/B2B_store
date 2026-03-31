import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { SEOHead } from '@/components/common/SEOHead'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ProductGrid } from '@/components/product/ProductGrid'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { storesApi, productsApi } from '@/services/api'
import { getMockStoreBySlug, getMockProducts } from '@/hooks/useMockData'
import type { Store, Product } from '@/types'
import { ShieldCheck, Package, Star } from 'lucide-react'

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>()
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    storesApi.getBySlug(slug).then(async (s) => {
      setStore(s)
      const res = await productsApi.list({ storeId: s.id, limit: 20 })
      setProducts(res.data)
      setLoading(false)
    }).catch(() => {
      const mock = getMockStoreBySlug(slug)
      if (mock) {
        setStore(mock)
        setProducts(getMockProducts({ storeId: mock.id, limit: 20 }).data)
      }
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="container-main py-6 space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
      </div>
    )
  }

  if (!store) {
    return <div className="container-main py-16 text-center"><h2 className="text-xl font-bold">Store not found</h2></div>
  }

  return (
    <>
      <SEOHead title={store.name} description={store.description} />
      <div className="container-main py-4">
        <Breadcrumb items={[{ label: 'Stores' }, { label: store.name }]} />

        {/* Banner */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-[#1E293B] to-[#334155] rounded-xl overflow-hidden mt-4">
          {store.bannerUrl && (
            <img src={store.bannerUrl} alt={store.name} className="absolute inset-0 h-full w-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 h-full flex items-end p-6">
            <div className="flex items-center gap-4">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-card border-2 border-white shadow-lg object-contain" />
              ) : (
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold border-2 border-white shadow-lg">
                  {store.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{store.name}</h1>
                  <Badge className="bg-success text-white text-xs gap-1"><ShieldCheck className="h-3 w-3" />Verified</Badge>
                </div>
                {store.description && <p className="text-white/80 text-sm mt-1 max-w-xl line-clamp-2">{store.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-white/70 text-xs">
                  <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{products.length} Products</span>
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" />4.8 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">All Products ({products.length})</h2>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-16 text-text-secondary">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>This store hasn&apos;t listed any products yet.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
  )
}
