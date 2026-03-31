import type { FlashSale, FlashSaleItem } from '@/types'
import { products } from './products'

const now = new Date()
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3600000).toISOString()

const findVariant = (productId: string) => {
  const p = products.find((pr) => pr.id === productId)
  return p?.variants?.[0]
    ? { ...p.variants[0], product: p }
    : undefined
}

export const flashSales: FlashSale[] = [
  {
    id: 'fs-001',
    name: 'Mega Monday Deals',
    startsAt: hoursFromNow(-2),
    endsAt: hoursFromNow(22),
    isActive: true,
    items: [
      {
        id: 'fsi-001',
        flashSaleId: 'fs-001',
        variantId: 'var-001a',
        salePrice: 209999,
        quantityLimit: 50,
        quantitySold: 34,
        variant: findVariant('prod-001'),
      },
      {
        id: 'fsi-002',
        flashSaleId: 'fs-001',
        variantId: 'var-004a',
        salePrice: 54999,
        quantityLimit: 100,
        quantitySold: 72,
        variant: findVariant('prod-004'),
      },
      {
        id: 'fsi-003',
        flashSaleId: 'fs-001',
        variantId: 'var-007a',
        salePrice: 19999,
        quantityLimit: 80,
        quantitySold: 55,
        variant: findVariant('prod-007'),
      },
      {
        id: 'fsi-004',
        flashSaleId: 'fs-001',
        variantId: 'var-011a',
        salePrice: 109999,
        quantityLimit: 30,
        quantitySold: 18,
        variant: findVariant('prod-011'),
      },
      {
        id: 'fsi-005',
        flashSaleId: 'fs-001',
        variantId: 'var-015a',
        salePrice: 3499,
        quantityLimit: 200,
        quantitySold: 143,
        variant: findVariant('prod-015'),
      },
      {
        id: 'fsi-006',
        flashSaleId: 'fs-001',
        variantId: 'var-020a',
        salePrice: 36999,
        quantityLimit: 60,
        quantitySold: 41,
        variant: findVariant('prod-020'),
      },
    ] as FlashSaleItem[],
  },
  {
    id: 'fs-002',
    name: 'Tech Tuesday',
    startsAt: hoursFromNow(22),
    endsAt: hoursFromNow(46),
    isActive: false,
    items: [
      {
        id: 'fsi-007',
        flashSaleId: 'fs-002',
        variantId: 'var-002a',
        salePrice: 449999,
        quantityLimit: 25,
        quantitySold: 0,
        variant: findVariant('prod-002'),
      },
      {
        id: 'fsi-008',
        flashSaleId: 'fs-002',
        variantId: 'var-003a',
        salePrice: 289999,
        quantityLimit: 40,
        quantitySold: 0,
        variant: findVariant('prod-003'),
      },
    ] as FlashSaleItem[],
  },
]
