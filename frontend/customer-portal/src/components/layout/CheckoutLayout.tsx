import { Outlet, Link } from 'react-router-dom'

export function CheckoutLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border">
        <div className="container-main flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-lg w-8 h-8 rounded-xl flex items-center justify-center">Z</div>
            <span className="text-lg font-semibold text-text-primary">Zaroox</span>
          </Link>
          <h1 className="text-lg font-semibold text-text-primary">Checkout</h1>
          <div className="w-24" />
        </div>
      </header>
      <main className="flex-1 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card py-4 text-center text-xs text-text-secondary">
        <p>© {new Date().getFullYear()} Zaroox. All rights reserved.</p>
      </footer>
    </div>
  )
}
