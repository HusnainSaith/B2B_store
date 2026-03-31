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
              className="group relative rounded-2xl overflow-hidden aspect-[3/2] md:aspect-[4/3] shadow-card hover:shadow-card-hover transition-shadow duration-300"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary bg-white/90 px-3 py-1 rounded-full mb-3">{banner.subtitle}</span>
                <h3 className="text-lg md:text-xl font-bold text-white">{banner.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
