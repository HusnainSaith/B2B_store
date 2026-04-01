import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Youtube, ChevronUp, Smartphone, Linkedin } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="bg-footer-bg text-footer-text text-[14px] leading-relaxed">
      {/* ═══════════ MAIN LINKS — 5 Columns ═══════════ */}
      <div className="border-b border-footer-divider">
        <div className="container-main py-12 md:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 md:gap-8 lg:gap-12">

            {/* Get Support */}
            <div>
              <h4 className="text-white font-bold text-[15px] mb-5">Get support</h4>
              <ul className="space-y-3">
                <li><Link to={ROUTES.ACCOUNT_CHAT} className="text-footer-text/70 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to={ROUTES.ACCOUNT_CHAT} className="text-footer-text/70 hover:text-white transition-colors">Live chat</Link></li>
                <li><Link to={ROUTES.ACCOUNT_ORDERS} className="text-footer-text/70 hover:text-white transition-colors">Check order status</Link></li>
                <li><Link to={ROUTES.ACCOUNT_RETURNS} className="text-footer-text/70 hover:text-white transition-colors">Refunds</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Report abuse</Link></li>
              </ul>
            </div>

            {/* Payments and protections */}
            <div>
              <h4 className="text-white font-bold text-[15px] mb-5">Payments and protections</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Safe and easy payments</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Money-back policy</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">On-time shipping</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">After-sales protections</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Product monitoring services</Link></li>
              </ul>
            </div>

            {/* Source on Zaroox */}
            <div>
              <h4 className="text-white font-bold text-[15px] mb-5">Source on Zaroox</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Request for Quotation</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Membership program</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Zaroox Reads</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Sales tax and VAT</Link></li>
              </ul>
            </div>

            {/* Sell on Zaroox */}
            <div>
              <h4 className="text-white font-bold text-[15px] mb-5">Sell on Zaroox</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Start selling</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Seller Central</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Become a Verified Seller</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Partnerships</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Download the app for sellers</Link></li>
              </ul>
            </div>

            {/* Get to know us + Stay Connected */}
            <div>
              <h4 className="text-white font-bold text-[15px] mb-5">Get to know us</h4>
              <ul className="space-y-3">
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">About Zaroox</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Corporate responsibility</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">News center</Link></li>
                <li><Link to="/" className="text-footer-text/70 hover:text-white transition-colors">Careers</Link></li>
              </ul>
              <h4 className="text-white font-bold text-[15px] mt-8 mb-4">Stay Connected</h4>
              <div className="flex items-center gap-3">
                {[
                  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
                  { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
                  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
                  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
                  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-footer-text/50 hover:text-white transition-colors"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ PAYMENT METHODS ROW ═══════════ */}
      <div className="border-b border-footer-divider">
        <div className="container-main py-6">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {['Visa', 'Mastercard', 'JazzCash', 'EasyPaisa', 'PayPal', 'Apple Pay', 'Google Pay', 'COD', 'Bank Transfer', 'HBL', 'Meezan', 'UBL'].map((method) => (
              <span key={method} className="text-[13px] text-footer-text/60 font-medium">{method}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ APP DOWNLOAD ROW ═══════════ */}
      <div className="border-b border-footer-divider">
        <div className="container-main py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-footer-text/60">
              Trade on the go with the{' '}
              <Link to="/" className="text-white font-semibold underline underline-offset-2">Zaroox app</Link>
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 border border-footer-divider rounded-lg px-4 py-2 hover:bg-white/5 transition-colors"
              >
                <Smartphone className="h-5 w-5 text-footer-text/70" />
                <div className="text-left">
                  <p className="text-[10px] text-footer-text/50 leading-none">Download on the</p>
                  <p className="text-[13px] text-white font-semibold leading-tight">App Store</p>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 border border-footer-divider rounded-lg px-4 py-2 hover:bg-white/5 transition-colors"
              >
                <Smartphone className="h-5 w-5 text-footer-text/70" />
                <div className="text-left">
                  <p className="text-[10px] text-footer-text/50 leading-none">Get it on</p>
                  <p className="text-[13px] text-white font-semibold leading-tight">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ BOTTOM SECTION ═══════════ */}
      <div className="container-main py-8">
        {/* Related site links */}
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-[13px] text-footer-text/50 mb-3">
          {['Zaroox Seller Portal', 'Zaroox Admin', 'Zaroox Deals', 'Zaroox Fashion', 'Zaroox Electronics', 'Zaroox Home'].map((link, i, arr) => (
            <span key={link}>
              <Link to="/" className="hover:text-white transition-colors px-1">{link}</Link>
              {i < arr.length - 1 && <span className="text-footer-text/30">|</span>}
            </span>
          ))}
        </div>

        {/* Policy links */}
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-[12px] text-footer-text/40 mb-3">
          {['Policies and rules', 'Legal Notice', 'Product Listing Policy', 'Intellectual Property Protection', 'Privacy Policy', 'Terms of Use'].map((link, i, arr) => (
            <span key={link}>
              <Link to="/" className="hover:text-white transition-colors px-0.5">{link}</Link>
              {i < arr.length - 1 && <span className="text-footer-text/20">·</span>}
            </span>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-center text-[12px] text-footer-text/30">
          © 1999-{new Date().getFullYear()} Zaroox.com. All rights reserved.
        </p>
      </div>

      {/* ═══════════ BACK TO TOP — floating ═══════════ */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 h-11 w-11 rounded-full bg-footer-bg border border-footer-divider hover:bg-white/10 flex items-center justify-center text-footer-text/60 hover:text-white transition-all shadow-lg z-50 cursor-pointer"
        aria-label="Back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </button>
    </footer>
  )
}
