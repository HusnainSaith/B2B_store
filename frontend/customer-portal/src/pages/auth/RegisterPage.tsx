import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@/lib/validation'
import { authApi } from '@/services/api'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SEOHead } from '@/components/common/SEOHead'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

type RegisterFormData = { firstName: string; lastName: string; email: string; password: string; confirmPassword: string }

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      toast.success('Account created! Please sign in.')
      navigate(ROUTES.LOGIN)
    } catch {
      toast.error('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead title="Create Account" />
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Create your account</h1>
        <p className="text-sm text-text-muted mt-2">Join Zaroox and start shopping</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName" className="mb-2 block text-text-primary text-sm font-medium">First Name</Label>
            <Input id="firstName" placeholder="John" {...register('firstName')} autoFocus className="h-11 rounded-xl" />
            {errors.firstName && <p className="text-xs text-danger mt-1.5">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="lastName" className="mb-2 block text-text-primary text-sm font-medium">Last Name</Label>
            <Input id="lastName" placeholder="Doe" {...register('lastName')} className="h-11 rounded-xl" />
            {errors.lastName && <p className="text-xs text-danger mt-1.5">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="mb-2 block text-text-primary text-sm font-medium">Email address</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className="h-11 rounded-xl" />
          {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password" className="mb-2 block text-text-primary text-sm font-medium">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              {...register('password')}
              className="h-11 rounded-xl"
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
          {errors.password && <p className="text-xs text-danger mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="mb-2 block text-text-primary text-sm font-medium">Confirm Password</Label>
          <Input id="confirmPassword" type="password" placeholder="Re-enter your password" {...register('confirmPassword')} className="h-11 rounded-xl" />
          {errors.confirmPassword && <p className="text-xs text-danger mt-1.5">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full h-12 font-bold text-sm rounded-xl uppercase tracking-wide shadow-lg shadow-primary/20" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center mt-8">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-primary hover:text-primary-hover font-semibold">
          Sign in
        </Link>
      </p>
    </>
  )
}
