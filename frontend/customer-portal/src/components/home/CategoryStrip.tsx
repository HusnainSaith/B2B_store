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
    <section className="py-10 md:py-12" aria-label="Shop by category">
      <div className="container-main">
        <ScrollArea className="w-full">
          <div className="flex gap-4 md:gap-5 pb-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="group shrink-0"
              >
                <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 min-w-[160px]">
                  <div className="h-12 w-12 rounded-xl bg-surface overflow-hidden flex items-center justify-center shrink-0">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="h-9 w-9 object-contain" loading="lazy" />
                    ) : (
                      <span className="text-primary font-bold text-lg">{cat.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-1 block">
                      {cat.name}
                    </span>
                    {cat.description && (
                      <span className="text-xs text-text-muted line-clamp-1 hidden sm:block">{cat.description}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  )
}
