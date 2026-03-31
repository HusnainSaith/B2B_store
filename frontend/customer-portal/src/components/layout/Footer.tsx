import { Link } from 'react-router-dom'
import { ChevronUp, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="bg-footer-bg text-footer-text">
      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="w-full bg-surface/10 hover:bg-surface/20 py-3 text-sm text-footer-text/70 flex items-center justify-center gap-1.5 transition-colors cursor-pointer group"
      >
        <ChevronUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform duration-200" />
        Back to Top
      </button>

      {/* Main Footer Links */}
      <div className="container-main py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          <div>
            <h4 className="text-white font-semibold text-sm mb-6 tracking-wide">Get to Know Us</h4>
            <ul className="space-y-3.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors duration-200">About Zaroox</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors duration-200">Careers</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors duration-200">Blog</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors duration-200">Press Releases</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-6 tracking-wide">Make Money with Us</h4>
            <ul className="space-y-3.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors duration-200">Sell on Zaroox</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors duration-200">Affiliate Program</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors duration-200">Advertise Your Products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-6 tracking-wide">Payment</h4>
            <ul className="space-y-3.5 text-sm">
              <li><span>Credit/Debit Cards</span></li>
              <li><span>Cash on Delivery</span></li>
              <li><span>Bank Transfer</span></li>
              <li><span>JazzCash / EasyPaisa</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-6 tracking-wide">Let Us Help You</h4>
            <ul className="space-y-3.5 text-sm">
              <li><Link to={ROUTES.ACCOUNT} className="hover:text-white transition-colors duration-200">Your Account</Link></li>
              <li><Link to={ROUTES.ACCOUNT_ORDERS} className="hover:text-white transition-colors duration-200">Your Orders</Link></li>
              <li><Link to={ROUTES.ACCOUNT_RETURNS} className="hover:text-white transition-colors duration-200">Returns & Refunds</Link></li>
              <li><Link to={ROUTES.ACCOUNT_CHAT} className="hover:text-white transition-colors duration-200">Help & Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-footer-divider" />

      {/* Bottom Footer */}
      <div className="container-main py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-base w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">Z</div>
            <span className="text-white font-bold tracking-tight">Zaroox</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {[
              { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
              { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
              { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
              { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-footer-text hover:text-white transition-all duration-200"
                aria-label={label}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <p className="text-xs text-footer-text/50">© {new Date().getFullYear()} Zaroox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
