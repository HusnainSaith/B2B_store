import { Link } from 'react-router-dom'

const BANNERS = [
  {
    id: 1,
    title: 'Electronics Fest',
    subtitle: 'Up to 50% OFF',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    id: 2,
    title: 'Fashion Week',
    subtitle: 'New Arrivals Daily',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1558171813-01eda332a7b4?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    id: 3,
    title: 'Home Essentials',
    subtitle: 'Starting Rs. 199',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop&auto=format&q=80',
  },
]

export function PromoBannerRow() {
  return (
    <section className="py-12 md:py-16" aria-label="Promotional banners">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {BANNERS.map((banner) => (
            <Link
              key={banner.id}
              to={banner.link}
              className="group relative rounded-2xl overflow-hidden aspect-[3/2] md:aspect-[4/3]"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-white mb-1">{banner.title}</h3>
                <p className="text-sm md:text-base text-white/80">{banner.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
