import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Youtube, ChevronUp, Smartphone } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="bg-footer-bg text-footer-text">
      {/* ── Main Links ── 5 equal columns like Alibaba */}
      <div className="border-b border-footer-divider">
        <div className="container-main py-10 md:py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6">
            {/* Get Support */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Get support</h4>
              <ul className="space-y-2.5">
                <li><Link to={ROUTES.ACCOUNT_CHAT} className="text-sm text-footer-text/70 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to={ROUTES.ACCOUNT_CHAT} className="text-sm text-footer-text/70 hover:text-white transition-colors">Live chat</Link></li>
                <li><Link to={ROUTES.ACCOUNT_ORDERS} className="text-sm text-footer-text/70 hover:text-white transition-colors">Check order status</Link></li>
                <li><Link to={ROUTES.ACCOUNT_RETURNS} className="text-sm text-footer-text/70 hover:text-white transition-colors">Refunds</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Report abuse</Link></li>
              </ul>
            </div>

            {/* Payments and protections */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Payments and protections</h4>
              <ul className="space-y-2.5">
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Safe and easy payments</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Money-back policy</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">On-time shipping</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">After-sales protections</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Product monitoring services</Link></li>
              </ul>
            </div>

            {/* Source on Zaroox */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Source on Zaroox</h4>
              <ul className="space-y-2.5">
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Request for Quotation</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Membership program</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Zaroox Reads</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Sales tax and VAT</Link></li>
              </ul>
            </div>

            {/* Sell on Zaroox */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Sell on Zaroox</h4>
              <ul className="space-y-2.5">
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Start selling</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Seller Central</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Become a Verified Seller</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Partnerships</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Download the app for sellers</Link></li>
              </ul>
            </div>

            {/* Get to know us + Stay Connected */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Get to know us</h4>
              <ul className="space-y-2.5">
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">About Zaroox</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Corporate responsibility</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">News center</Link></li>
                <li><Link to="/" className="text-sm text-footer-text/70 hover:text-white transition-colors">Careers</Link></li>
              </ul>
              <h4 className="text-white font-bold text-sm mt-6 mb-3">Stay Connected</h4>
              <div className="flex items-center gap-2.5">
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
                    className="h-8 w-8 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center text-footer-text/60 transition-all duration-200"
                    aria-label={label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Methods Row ── */}
      <div className="border-b border-footer-divider">
        <div className="container-main py-6">
          <div className="flex flex-wrap items-center gap-3">
            {['Visa', 'Mastercard', 'JazzCash', 'EasyPaisa', 'PayPal', 'Apple Pay', 'Google Pay', 'COD', 'Bank Transfer', 'HBL', 'Meezan', 'UBL'].map((method) => (
              <div key={method} className="bg-white/[0.06] rounded-md px-3 py-1.5 text-center">
                <span className="text-xs text-footer-text/70 font-medium whitespace-nowrap">{method}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── App Download Row ── */}
      <div className="border-b border-footer-divider">
        <div className="container-main py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-footer-text/60">Trade on the go with the <span className="text-white font-semibold">Zaroox app</span></span>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/10 rounded-lg px-4 py-2 transition-colors cursor-pointer">
                <Smartphone className="h-5 w-5 text-footer-text/70" />
                <div className="text-left">
                  <p className="text-[10px] text-footer-text/50 leading-none">Download on the</p>
                  <p className="text-xs text-white font-semibold leading-tight">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/10 rounded-lg px-4 py-2 transition-colors cursor-pointer">
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

      {/* ── Bottom Section ── */}
      <div className="container-main py-6">
        {/* Related links */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-footer-text/50 mb-3">
          {['Zaroox Seller Portal', 'Zaroox Admin', 'Zaroox Deals', 'Zaroox Fashion', 'Zaroox Electronics', 'Zaroox Home'].map((link, i, arr) => (
            <span key={link}>
              <Link to="/" className="hover:text-white transition-colors">{link}</Link>
              {i < arr.length - 1 && <span className="ml-2">|</span>}
            </span>
          ))}
        </div>

        {/* Policy links */}
        <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-footer-text/40 mb-3">
          {['Policies and rules', 'Legal Notice', 'Product Listing Policy', 'Intellectual Property Protection', 'Privacy Policy', 'Terms of Use'].map((link, i, arr) => (
            <span key={link}>
              <Link to="/" className="hover:text-white transition-colors">{link}</Link>
              {i < arr.length - 1 && <span className="mx-0.5">·</span>}
            </span>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-footer-text/30">© 1999-{new Date().getFullYear()} Zaroox.com. All rights reserved.</p>
      </div>

      {/* ── Back to Top (floating) ── */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 h-10 w-10 rounded-full bg-footer-bg border border-footer-divider hover:bg-white/10 flex items-center justify-center text-footer-text/60 hover:text-white transition-all duration-200 shadow-lg z-50 cursor-pointer"
        aria-label="Back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </footer>
  )
}
