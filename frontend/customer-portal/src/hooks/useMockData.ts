import { categories, brands, products, flashSales, vendors, reviews, banners } from '@/data/seed'
import type { Banner } from '@/data/seed'
import type {
  Product,
  Category,
  Brand,
  Store,
  FlashSale,
  FlashSaleItem,
  Review,
  RatingSummary,
  PaginatedResponse,
} from '@/types'

/**
 * Returns mock seed data that mirrors the real API shapes.
 * Use these helpers when the backend is unavailable or during
 * offline development / demo mode.
 */

function paginate<T>(items: T[], page = 1, limit = 10): PaginatedResponse<T> {
  const start = (page - 1) * limit
  const data = items.slice(start, start + limit)
  return {
    data,
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
  }
}

// ─── Categories ───
export function getMockCategories(): Category[] {
  return categories.filter((c) => c.isActive && !c.parentId)
}

export function getMockCategoryBySlug(slug: string): Category | undefined {
  const flat = categories.flatMap((c) => [c, ...(c.children ?? [])])
  return flat.find((c) => c.slug === slug)
}

// ─── Brands ───
export function getMockBrands(): Brand[] {
  return brands.filter((b) => b.isActive)
}

// ─── Products ───
export function getMockProducts(params?: {
  page?: number
  limit?: number
  categoryId?: string
  brandId?: string
  storeId?: string
  search?: string
}): PaginatedResponse<Product> {
  let filtered = products.filter((p) => p.isActive)

  if (params?.categoryId) {
    filtered = filtered.filter((p) => p.categoryId === params.categoryId)
  }
  if (params?.brandId) {
    filtered = filtered.filter((p) => p.brandId === params.brandId)
  }
  if (params?.storeId) {
    filtered = filtered.filter((p) => p.storeId === params.storeId)
  }
  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDesc?.toLowerCase().includes(q) ||
        p.brand?.name.toLowerCase().includes(q),
    )
  }

  return paginate(filtered, params?.page, params?.limit)
}

export function getMockProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getMockProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

// ─── Stores / Vendors ───
export function getMockStores(): Store[] {
  return vendors.filter((s) => s.isActive)
}

export function getMockStoreBySlug(slug: string): Store | undefined {
  return vendors.find((s) => s.slug === slug)
}

// ─── Flash Sales ───
export function getMockActiveFlashSale(): FlashSale | undefined {
  return flashSales.find((s) => s.isActive && new Date(s.endsAt) > new Date())
}

export function getMockFlashSaleItems(saleId: string): FlashSaleItem[] {
  const sale = flashSales.find((s) => s.id === saleId)
  return sale?.items ?? []
}

// ─── Reviews ───
export function getMockReviewsByProduct(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId && r.status === 'approved')
}

export function getMockRatingSummary(productId: string): RatingSummary {
  const productReviews = getMockReviewsByProduct(productId)
  if (productReviews.length === 0) {
    return { avg: 0, count: 0, average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  }
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let sum = 0
  for (const r of productReviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)))
    distribution[star] = (distribution[star] ?? 0) + 1
    sum += r.rating
  }
  const avg = parseFloat((sum / productReviews.length).toFixed(1))
  return { avg, count: productReviews.length, average: avg, total: productReviews.length, distribution }
}

// ─── Banners ───
export function getMockBanners(): Banner[] {
  return banners
}
