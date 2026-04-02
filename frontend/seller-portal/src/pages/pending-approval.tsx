import { Button } from '@/components/ui/button'
import { Clock, ArrowLeft, Mail } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/services/api'

const CUSTOMER_PORTAL_URL = import.meta.env.VITE_CUSTOMER_PORTAL_URL || 'http://localhost:5173'

export default function PendingApprovalPage() {
  const { user, refreshToken, logout } = useAuthStore()

  const handleLogout = async () => {
    if (refreshToken) {
      try { await authApi.logout(refreshToken) } catch { /* ignore */ }
    }
    logout()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 bg-background">
      <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center space-y-6 shadow-sm">
        <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
          <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Pending Approval</h1>
          <p className="text-muted-foreground">
            Hi {user?.firstName ?? 'there'}, your seller account is currently pending admin approval.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 space-y-2">
          <div className="flex items-center gap-2 justify-center">
            <Mail className="h-4 w-4" />
            <span className="font-medium">You&apos;ll receive an email once approved</span>
          </div>
          <p>This usually takes 1-2 business days. Thank you for your patience!</p>
        </div>

        <div className="space-y-3 pt-2">
          <a href={CUSTOMER_PORTAL_URL} className="block">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Shopping
            </Button>
          </a>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
