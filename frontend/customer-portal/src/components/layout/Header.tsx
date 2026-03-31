import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { useUIStore } from '@/store/ui.store'
import { ROUTES } from '@/constants/routes'
import { SEARCH_DEBOUNCE_MS } from '@/constants/config'
import { searchApi } from '@/services/api'
import { sanitizeText } from '@/lib/sanitize'

export function Header() {
  const { isAuthenticated, user } = useAuthStore()
  const { itemCount } = useCartStore()
  const { setMobileMenuOpen, isMobileMenuOpen } = useUIStore()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{ query: string; count: number }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const q = sanitizeText(searchQuery.trim())
    if (q) {
      navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(q)}`)
      setShowSuggestions(false)
    }
  }, [searchQuery, navigate])

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const popular = await searchApi.popular(6)
          setSuggestions(popular.filter((p) => p.query.toLowerCase().includes(value.toLowerCase())))
          setShowSuggestions(true)
        } catch {
          // Silently fail on suggestion fetch
        }
      }, SEARCH_DEBOUNCE_MS)
    } else {
      setShowSuggestions(false)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40 shadow-header">
      {/* Desktop Header */}
      <div className="container-main hidden md:flex items-center h-[72px] gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-2 group">
          <div className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-lg w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow duration-300">Z</div>
          <span className="text-lg font-bold text-text-primary tracking-tight">Zaroox</span>
        </Link>

        {/* Search Bar */}
        <div ref={searchRef} className="flex-1 relative max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search products, brands, categories..."
              className="w-full h-11 pl-11 pr-4 rounded-full bg-surface border border-transparent text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-card transition-all duration-300"
              aria-label="Search"
            />
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-xl shadow-dropdown z-50 mt-2 overflow-hidden animate-slide-down">
              {suggestions.map((s) => (
                <button
                  key={s.query}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-text-primary hover:bg-surface text-left cursor-pointer transition-colors"
                  onClick={() => {
                    setSearchQuery(s.query)
                    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(s.query)}`)
                    setShowSuggestions(false)
                  }}
                >
                  <Search className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <span>{s.query}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Account */}
          <Link
            to={isAuthenticated ? ROUTES.ACCOUNT : ROUTES.LOGIN}
            className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl transition-all duration-200 shrink-0"
          >
            <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden lg:block font-medium">
              {isAuthenticated ? user?.firstName : 'Sign In'}
            </span>
          </Link>

          {/* Orders */}
          <Link
            to={ROUTES.ACCOUNT_ORDERS}
            className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl font-medium transition-all duration-200 shrink-0 hidden lg:flex"
          >
            Orders
          </Link>

          {/* Cart */}
          <Link
            to={ROUTES.CART}
            className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl transition-all duration-200 relative shrink-0"
            aria-label={`Cart with ${itemCount} items`}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-lg shadow-primary/30 animate-bounce-subtle">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </div>
            <span className="text-sm font-medium hidden lg:block">Cart</span>
          </Link>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="container-main flex items-center justify-between h-16">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <div className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm w-8 h-8 rounded-xl flex items-center justify-center shadow-md shadow-primary/20">Z</div>
            <span className="text-base font-bold text-text-primary tracking-tight">Zaroox</span>
          </Link>

          <div className="flex items-center gap-0.5">
            <Link to={isAuthenticated ? ROUTES.ACCOUNT : ROUTES.LOGIN} className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
            <Link to={ROUTES.CART} className="p-2 relative text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors" aria-label={`Cart with ${itemCount} items`}>
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0 bg-gradient-to-r from-primary to-secondary text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full h-10 pl-10 pr-4 rounded-full bg-surface text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all duration-300"
              aria-label="Search"
            />
          </form>
        </div>
      </div>
    </header>
  )
}
