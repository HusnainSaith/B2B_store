import { useEffect, useState } from 'react'
import { shippingApi } from '@/services/api'
import type { ShippingMethod } from '@/types'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Truck, Banknote, CheckCircle } from 'lucide-react'

interface ShippingStepProps {
  onNext: (method: ShippingMethod, codSelected?: boolean) => void
  onBack: () => void
  selectedMethodId?: string
}

export function ShippingStep({ onNext, onBack, selectedMethodId }: ShippingStepProps) {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [selected, setSelected] = useState<string | undefined>(selectedMethodId)
  const [codSelected, setCodSelected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    shippingApi.listMethods().then((m) => {
      if (cancelled) return
      const active = m.filter((s) => s.isActive)
      setMethods(active)
      if (active.length > 0 && !selectedMethodId) setSelected(active[0].id)
      setLoading(false)
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selectedMethodId])

  const handleContinue = () => {
    const method = methods.find((m) => m.id === selected)
    if (method) onNext(method, codSelected)
  }

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-20 bg-surface rounded" /><div className="h-20 bg-surface rounded" /></div>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-text-primary mb-2">Shipping Method</h2>

      {methods.length === 0 ? (
        <p className="text-sm text-text-secondary">No shipping methods available for your location.</p>
      ) : (
        methods.map((method) => (
          <label
            key={method.id}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
              selected === method.id ? 'border-primary bg-primary-light' : 'border-border hover:border-text-muted',
            )}
          >
            <input
              type="radio"
              name="shipping"
              checked={selected === method.id}
              onChange={() => setSelected(method.id)}
              className="accent-primary"
            />
            <Truck className="h-5 w-5 text-text-secondary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{method.name}</p>
              {method.estimatedDaysMin != null && (
                <p className="text-xs text-text-secondary">
                  {method.estimatedDaysMin}–{method.estimatedDaysMax ?? method.estimatedDaysMin} business days
                  {method.carrier && ` via ${method.carrier}`}
                </p>
              )}
            </div>
            <div className="text-sm font-bold text-text-primary shrink-0">
              {method.baseRate === 0 ? <span className="text-success">FREE</span> : formatPrice(method.baseRate)}
            </div>
          </label>
        ))
      )}

      {/* Cash on Delivery Option */}
      <div className="mt-6 pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-text-primary mb-3">Payment Option</h3>
        <label
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
            codSelected ? 'border-success bg-success/10' : 'border-border hover:border-text-muted',
          )}
        >
          <input
            type="checkbox"
            checked={codSelected}
            onChange={() => setCodSelected(!codSelected)}
            className="accent-success h-4 w-4"
          />
          <Banknote className="h-5 w-5 text-success shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">Cash on Delivery</p>
            <p className="text-xs text-text-secondary">Pay with cash when your order is delivered</p>
          </div>
          {codSelected && <CheckCircle className="h-5 w-5 text-success shrink-0" />}
        </label>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={handleContinue} disabled={!selected} className="flex-1 font-bold">Continue to Payment</Button>
      </div>
    </div>
  )
}
