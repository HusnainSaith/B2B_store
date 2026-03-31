import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validation'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SEOHead } from '@/components/common/SEOHead'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

type LoginFormData = { email: string; password: string }

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string })?.from ?? ROUTES.HOME

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    try {
      const res = await authApi.login(data)
      setAuth(res.user, res.accessToken, res.refreshToken)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Sign In" />
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Welcome back</h1>
        <p className="text-sm text-text-muted mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="email" className="mb-1.5 block text-text-primary">Email address</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} autoFocus />
          {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" className="text-text-primary">Password</Label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-primary hover:text-primary-hover font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full h-11 font-semibold text-base" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center mt-6">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-primary hover:text-primary-hover font-medium">
          Create account
        </Link>
      </p>
    </>
  )
}
