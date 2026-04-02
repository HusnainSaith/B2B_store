import { Link } from 'react-router-dom'
import { MapPin, HelpCircle, Globe, Moon, Sun, Store } from 'lucide-react'
import { useThemeStore } from '@/store/theme.store'
import { SELLER_PORTAL_URL } from '@/constants/config'

export function TopBar() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="bg-gradient-to-r from-primary/5 via-surface/80 to-secondary/5 backdrop-blur-sm border-b border-border/50 text-xs text-text-secondary">
      <div className="container-main flex items-center justify-between h-9">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <MapPin className="h-3 w-3" />
            <span>Deliver to Pakistan</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/flash-sales" className="hover:text-primary transition-colors">Today&apos;s Deals</Link>
          <a href={`${SELLER_PORTAL_URL}/register`} className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
            <Store className="h-3 w-3" />
            <span>Become a Seller</span>
          </a>
          <Link to="/account/chat" className="hidden sm:flex items-center gap-1 hover:text-primary transition-colors">
            <HelpCircle className="h-3 w-3" />
            <span>Help</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
            <Globe className="h-3 w-3" />
            <span>EN</span>
          </button>
        </div>
      </div>
    </div>
  )
}
