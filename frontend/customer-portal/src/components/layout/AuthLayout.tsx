import { Outlet } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light to-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="bg-card rounded-2xl shadow-[var(--shadow-modal)] border border-border/60 p-8 md:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 gap-3">
            <div className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-2xl w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
              Z
            </div>
            <span className="text-lg font-bold text-text-primary tracking-tight">Zaroox</span>
          </div>

          <Outlet />
        </div>

        {/* Security footer */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-text-muted">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Secured by enterprise-grade encryption</span>
        </div>
      </div>
    </div>
  )
}
