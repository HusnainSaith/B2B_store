/**
 * Registration Page
 * Creates a new seller account with business info.
 * After registration, auto-logs in and creates seller profile.
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { authApi, sellerApi } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { getErrorMessage } from '@/lib/api-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2, 'Business name must be at least 2 characters').max(200),
  legalName: z.string().max(200).optional().or(z.literal('')),
  taxId: z.string().max(100).optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      // Step 1: Register user account with seller role
      await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })

      // Step 2: Login to get access token
      const loginRes = await authApi.login({ email: data.email, password: data.password })
      setAuth(loginRes.user, loginRes.accessToken, loginRes.refreshToken)

      // Step 3: Create seller profile (pending status)
      await sellerApi.register({
        displayName: data.displayName,
        legalName: data.legalName || undefined,
        taxId: data.taxId || undefined,
      })

      setSuccess(true)
      toast.success('Registration successful!')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="text-lg font-semibold">Registration Successful!</h3>
        <p className="text-sm text-muted-foreground">
          Your seller account has been created and is pending admin approval.
          You&apos;ll receive an email once your account is approved.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
          After approval, log in to set up your store and start selling!
        </div>
        <Link to="/login">
          <Button className="w-full">Go to Login</Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground text-center pb-1">
        Create your seller account to start selling on Zaroox
      </p>

      {/* Personal Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="John" {...register('firstName')} />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Doe" {...register('lastName')} />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="seller@example.com" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {/* Business Info */}
      <div className="border-t border-border pt-4 mt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Business Information</p>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="displayName">Business / Store Name <span className="text-destructive">*</span></Label>
            <Input id="displayName" placeholder="e.g. TechStore Pakistan" {...register('displayName')} />
            {errors.displayName && <p className="text-xs text-destructive">{errors.displayName.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="legalName">Legal Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="legalName" placeholder="e.g. Tech Store Pvt Ltd" {...register('legalName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / NTN <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="taxId" placeholder="e.g. NTN-1234567" {...register('taxId')} />
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </span>
        ) : (
          'Create Seller Account'
        )}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </form>
  )
}
