import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categoriesApi } from '@/services/api'
import { getMockCategories } from '@/hooks/useMockData'
import type { Category } from '@/types'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function CategoryStrip() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    categoriesApi.list().then((cats) => {
      setCategories(cats.filter((c) => c.isActive && !c.parentId).slice(0, 12))
    }).catch(() => {
      setCategories(getMockCategories().slice(0, 12))
    })
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="bg-card py-4 border-b border-border" aria-label="Shop by category">
      <div className="container-main">
        <ScrollArea className="w-full">
          <div className="flex gap-6 px-2 pb-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.slug}`}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className="h-16 w-16 rounded-full bg-primary-light border-2 border-transparent group-hover:border-primary flex items-center justify-center transition-colors overflow-hidden">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="h-10 w-10 object-contain" loading="lazy" />
                  ) : (
                    <span className="text-primary font-bold text-xl">{cat.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-xs text-text-primary text-center font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  )
}
