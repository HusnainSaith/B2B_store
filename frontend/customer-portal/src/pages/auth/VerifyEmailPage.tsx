import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authApi } from '@/services/api'
import { ROUTES } from '@/constants/routes'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error')

  useEffect(() => {
    if (!token) return
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="text-center">
      {status === 'loading' && <p className="text-base text-text-muted">Verifying your email...</p>}
      {status === 'success' && (
        <>
          <div className="w-12 h-12 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">Email verified!</h1>
          <p className="text-sm text-text-muted mb-6">Your email has been verified. You can now log in.</p>
          <Link to={ROUTES.LOGIN} className="text-sm text-primary hover:text-primary-hover font-medium">Go to login</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">Verification failed</h1>
          <p className="text-sm text-text-muted mb-6">The verification link is invalid or expired.</p>
          <Link to={ROUTES.HOME} className="text-sm text-primary hover:text-primary-hover font-medium">Go home</Link>
        </>
      )}
    </div>
  )
}
