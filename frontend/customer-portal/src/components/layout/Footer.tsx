import { Link } from 'react-router-dom'
import { ChevronUp, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Shield, Truck, RotateCcw, Headphones, CreditCard, Smartphone } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useState } from 'react'

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const [email, setEmail] = useState('')

  return (
    <footer className="bg-footer-bg text-footer-text">
      {/* Trust Bar */}
      <div className="border-b border-footer-divider">
        <div className="container-main py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'On orders over Rs. 2,000' },
              { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: Shield, title: 'Secure Payment', desc: '100% protected checkout' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated help center' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Icon className="h-5.5 w-5.5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-footer-text/60 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="w-full bg-white/[0.03] hover:bg-white/[0.06] py-3.5 text-sm text-footer-text/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer group border-b border-footer-divider"
      >
        <ChevronUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform duration-200" />
        Back to Top
      </button>

      {/* Main Footer Content */}
      <div className="container-main py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand & Newsletter — spans 4 cols */}
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-xl w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">Z</div>
              <span className="text-white font-bold text-2xl tracking-tight">Zaroox</span>
            </Link>
            <p className="text-footer-text/70 text-sm leading-relaxed mb-6 max-w-xs">
              Your one-stop destination for electronics, fashion, home essentials, and more. Shop with confidence.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-white font-semibold text-sm mb-3">Stay in the loop</p>
              <form
                onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
                className="flex gap-0"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-footer-text/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full h-11 pl-10 pr-3 bg-white/5 border border-footer-divider rounded-l-xl text-sm text-white placeholder:text-footer-text/40 focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-5 bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold rounded-r-xl hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-2.5 text-xs text-footer-text/50">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <span>+92 300 0000 000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <span>support@zaroox.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>Lahore, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Get to Know Us */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Company</h4>
            <ul className="space-y-0">
              <li><Link to="/" className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">About Us</Link></li>
              <li><Link to="/" className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Careers</Link></li>
              <li><Link to="/" className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Blog</Link></li>
              <li><Link to="/" className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Press Releases</Link></li>
              <li><Link to="/" className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Investor Relations</Link></li>
            </ul>
          </div>

          {/* For Sellers */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Sell on Zaroox</h4>
            <ul className="space-y-0">
              <li><Link to="/" className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Start Selling</Link></li>
              <li><Link to="/" className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Seller Center</Link></li>
              <li><Link to="/" className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Affiliate Program</Link></li>
              <li><Link to="/" className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Advertise</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Help</h4>
            <ul className="space-y-0">
              <li><Link to={ROUTES.ACCOUNT} className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Your Account</Link></li>
              <li><Link to={ROUTES.ACCOUNT_ORDERS} className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Track Orders</Link></li>
              <li><Link to={ROUTES.ACCOUNT_RETURNS} className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Returns & Refunds</Link></li>
              <li><Link to={ROUTES.ACCOUNT_CHAT} className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Help Center</Link></li>
              <li><Link to="/" className="block py-1.5 text-sm text-footer-text/70 hover:text-white hover:translate-x-0.5 transition-all duration-200">Shipping Info</Link></li>
            </ul>
          </div>

          {/* Payment & App */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Payment</h4>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {['Visa', 'Mastercard', 'JazzCash', 'EasyPaisa', 'COD', 'Bank'].map((method) => (
                <div key={method} className="bg-white/5 rounded-lg px-2 py-2 text-center">
                  <span className="text-[11px] text-footer-text/60 font-medium">{method}</span>
                </div>
              ))}
            </div>

            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Get the App</h4>
            <div className="space-y-2">
              <button className="flex items-center gap-2.5 w-full bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2.5 transition-colors cursor-pointer">
                <Smartphone className="h-5 w-5 text-footer-text/70" />
                <div className="text-left">
                  <p className="text-[10px] text-footer-text/50 leading-none">Download on the</p>
                  <p className="text-xs text-white font-semibold leading-tight">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-2.5 w-full bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2.5 transition-colors cursor-pointer">
                <Smartphone className="h-5 w-5 text-footer-text/70" />
                <div className="text-left">
                  <p className="text-[10px] text-footer-text/50 leading-none">Get it on</p>
                  <p className="text-xs text-white font-semibold leading-tight">Google Play</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-footer-divider">
        <div className="container-main py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
                  className="h-10 w-10 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center text-footer-text/60 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex items-center flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-footer-text/40">
              <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
              <span className="hidden md:inline">·</span>
              <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
              <span className="hidden md:inline">·</span>
              <Link to="/" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>

            <p className="text-xs text-footer-text/30">© {new Date().getFullYear()} Zaroox. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
