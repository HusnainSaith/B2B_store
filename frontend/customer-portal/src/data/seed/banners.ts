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
    bgGradient: 'from-[#4F46E5] via-[#6366F1] to-[#818CF8]',
    imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&h=500&fit=crop',
  },
  {
    id: 'banner-002',
    title: 'New Arrivals in Tech',
    subtitle: 'Discover the latest smartphones, laptops, and gadgets',
    ctaText: 'Explore Tech',
    ctaLink: '/categories/electronics',
    bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#334155]',
    imageUrl: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&h=500&fit=crop',
  },
  {
    id: 'banner-003',
    title: 'Fitness Gear Clearance',
    subtitle: 'Premium sportswear and equipment at clearance prices',
    ctaText: 'Get Fit',
    ctaLink: '/categories/sports-outdoors',
    bgGradient: 'from-[#059669] via-[#10B981] to-[#34D399]',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop',
  },
  {
    id: 'banner-004',
    title: 'Beauty Box — Curated For You',
    subtitle: 'Skincare, makeup, and fragrance bundles starting at Rs. 2,999',
    ctaText: 'Shop Beauty',
    ctaLink: '/categories/beauty-health',
    bgGradient: 'from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop',
  },
]
