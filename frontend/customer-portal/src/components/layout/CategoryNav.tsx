import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Flame, ChevronDown } from 'lucide-react'
import { useUIStore } from '@/store/ui.store'
import { categoriesApi } from '@/services/api'
import type { Category } from '@/types'
import { MegaMenu } from './MegaMenu'

export function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([])
  const [visibleCount, setVisibleCount] = useState(10)
  const [moreOpen, setMoreOpen] = useState(false)
  const { isMegaMenuOpen, setMegaMenuOpen, setActiveMegaMenuCategory, activeMegaMenuCategory } = useUIStore()
  const location = useLocation()
  const navRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    categoriesApi.list().then((cats) => {
      setCategories(cats.filter((c) => c.isActive && !c.parentId))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setMegaMenuOpen(false)
    setMoreOpen(false)
  }, [location.pathname, setMegaMenuOpen])

  // Measure how many categories fit without overflow
  const measureFit = useCallback(() => {
    if (!navRef.current) return
    const container = navRef.current
    const maxWidth = container.clientWidth
    // Reserve ~200px for "All" button + Flash Sale + "More" dropdown
    const reserved = 260
    const available = maxWidth - reserved
    let totalWidth = 0
    let count = 0
    // Each category link is roughly 140px on average — measure from DOM if available
    const links = container.querySelectorAll<HTMLElement>('[data-cat-link]')
    links.forEach((link) => {
      totalWidth += link.offsetWidth + 6 // 6px gap
      if (totalWidth < available) count++
    })
    setVisibleCount(Math.max(count, 3))
  }, [])

  useEffect(() => {
    measureFit()
    window.addEventListener('resize', measureFit)
    return () => window.removeEventListener('resize', measureFit)
  }, [measureFit, categories])

  // Close "More" dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const visibleCats = categories.slice(0, visibleCount)
  const overflowCats = categories.slice(visibleCount)

  return (
    <nav className="bg-card border-b border-border text-sm hidden md:block relative" aria-label="Category navigation">
      <div ref={navRef} className="container-main flex items-center h-11 gap-0.5">
        <button
          className="flex items-center gap-1.5 px-3.5 h-full font-semibold text-text-primary hover:text-primary transition-colors shrink-0 cursor-pointer"
          onClick={() => {
            setMegaMenuOpen(!isMegaMenuOpen)
            setActiveMegaMenuCategory(null)
          }}
          aria-expanded={isMegaMenuOpen}
          aria-haspopup="true"
        >
          <Menu className="h-4 w-4" />
          <span>All</span>
        </button>

        {visibleCats.map((cat) => (
          <Link
            key={cat.id}
            data-cat-link
            to={`/products?categoryId=${cat.id}`}
            className="px-3 h-full flex items-center text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap shrink-0"
            onMouseEnter={() => {
              setActiveMegaMenuCategory(cat.id)
              setMegaMenuOpen(true)
            }}
          >
            {cat.name}
          </Link>
        ))}

        {/* More dropdown for overflow categories */}
        {overflowCats.length > 0 && (
          <div ref={moreRef} className="relative shrink-0">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1 px-3 h-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              <span>More</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreOpen && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-dropdown z-50 min-w-[200px] py-2 animate-slide-down">
                {overflowCats.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?categoryId=${cat.id}`}
                    className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    onClick={() => setMoreOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="ml-auto shrink-0">
          <Link
            to="/flash-sales"
            className="flex items-center gap-1.5 px-3.5 h-full hover:text-danger transition-colors"
          >
            <Flame className="h-4 w-4 text-danger flash-sale-badge" />
            <span className="text-danger font-semibold">Flash Sale</span>
          </Link>
        </div>
      </div>

      {/* Mega Menu */}
      {isMegaMenuOpen && (
        <MegaMenu
          categories={categories}
          activeCategoryId={activeMegaMenuCategory}
          onClose={() => setMegaMenuOpen(false)}
        />
      )}
    </nav>
  )
}
