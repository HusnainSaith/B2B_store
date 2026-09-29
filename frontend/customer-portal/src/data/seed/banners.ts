export interface Banner {
  id: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  bgGradient: string
  imageUrl?: string
}

export const banners: Banner[] = [
  {
    id: 'banner-001',
    title: 'Summer Sale — Up to 60% Off',
    subtitle: 'Shop thousands of deals on electronics, fashion, and home essentials',
    ctaText: 'Shop Now',
    ctaLink: '/products?sale=true',
    bgGradient: 'from-[#000000] via-[#14213D] to-[#FCA311]',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&h=500&fit=crop',
  },
  {
    id: 'banner-002',
    title: 'New Arrivals in Tech',
    subtitle: 'Discover the latest smartphones, laptops, and gadgets',
    ctaText: 'Explore Tech',
    ctaLink: '/categories/electronics',
    bgGradient: 'from-[#14213D] via-[#000000] to-[#14213D]',
    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&h=500&fit=crop',
  },
  {
    id: 'banner-003',
    title: 'Fitness Gear Clearance',
    subtitle: 'Premium sportswear and equipment at clearance prices',
    ctaText: 'Get Fit',
    ctaLink: '/categories/sports-outdoors',
    bgGradient: 'from-[#FCA311] via-[#14213D] to-[#000000]',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop',
  },
  {
    id: 'banner-004',
    title: 'Beauty Box — Curated For You',
    subtitle: 'Skincare, makeup, and fragrance bundles starting at Rs. 2,999',
    ctaText: 'Shop Beauty',
    ctaLink: '/categories/beauty-health',
    bgGradient: 'from-[#000000] via-[#14213D] to-[#FCA311]',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop',
  },
]
