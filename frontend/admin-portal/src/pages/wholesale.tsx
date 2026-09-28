import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, CalendarDays, Eye, FilePlus2, Mail, MapPin, Package } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getErrorMessage } from '@/lib/api-error'
import { formatCurrency, formatDate } from '@/lib/utils'
import { wholesaleApi } from '@/services/api'
import type { CreateWholesaleQuotationPayload, WholesaleInquiry } from '@/types'

const FILTERS = ['all', 'submitted', 'under_review', 'quoted', 'accepted', 'declined', 'cancelled', 'closed']

export default function WholesalePage() {
  const qc = useQueryClient()
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['wholesale-inquiries', status],
    queryFn: () => wholesaleApi.list({ limit: 100, status: status === 'all' ? undefined : status }),
  })
  const detail = useQuery({
    queryKey: ['wholesale-inquiry', selectedId],
    queryFn: () => {
      if (!selectedId) throw new Error('Inquiry id is required')
      return wholesaleApi.get(selectedId)
    },
    enabled: !!selectedId,
  })
  const reviewMutation = useMutation({
    mutationFn: (id: string) => wholesaleApi.update(id, { status: 'under_review' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wholesale-inquiries'] })
      qc.invalidateQueries({ queryKey: ['wholesale-inquiry'] })
      toast.success('Inquiry moved to review.')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Unable to update inquiry')),
  })

  const inquiries = data?.items ?? []
  return (
    <div className="space-y-6">
      <PageHeader
        title="Wholesale inquiries"
        description="Review customer quantity requests and issue tailored quotations. No payment is collected in this workflow."
      />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={status === item ? 'default' : 'outline'}
            className="capitalize"
            onClick={() => setStatus(item)}
          >
            {item.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>
      {isLoading ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">Loading inquiries…</CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-destructive">Unable to load wholesale inquiries.</p>
            <Button className="mt-4" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : inquiries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">No inquiries found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {inquiries.map((inquiry) => (
            <InquirySummary
              key={inquiry.id}
              inquiry={inquiry}
              onView={() => setSelectedId(inquiry.id)}
              onReview={() => reviewMutation.mutate(inquiry.id)}
            />
          ))}
        </div>
      )}

      <Dialog
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null)
            setQuoteOpen(false)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Wholesale inquiry {detail.data?.reference}</DialogTitle>
            <DialogDescription>Review quantities, customer details, and quotation history.</DialogDescription>
          </DialogHeader>
          {detail.isLoading ? (
            <div className="py-12 text-center">Loading…</div>
          ) : (
            detail.data && <InquiryDetail inquiry={detail.data} onCreateQuote={() => setQuoteOpen(true)} />
          )}
        </DialogContent>
      </Dialog>

      {detail.data && (
        <QuotationDialog key={detail.data.id} open={quoteOpen} onOpenChange={setQuoteOpen} inquiry={detail.data} />
      )}
    </div>
  )
}

function InquirySummary({
  inquiry,
  onView,
  onReview,
}: {
  inquiry: WholesaleInquiry
  onView: () => void
  onReview: () => void
}) {
  const totalPieces = inquiry.items?.reduce((sum, item) => sum + item.requestedQuantity, 0) ?? 0
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{inquiry.reference}</span>
              <StatusBadge status={inquiry.status} />
            </div>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              {inquiry.companyName}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(inquiry.createdAt)}</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3 text-sm">
          <div>
            <span className="text-muted-foreground">Products</span>
            <p className="font-semibold">{inquiry.items?.length ?? 0}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Total pieces</span>
            <p className="font-semibold">{totalPieces}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            View inquiry
          </Button>
          {inquiry.status === 'submitted' && (
            <Button size="sm" variant="outline" onClick={onReview}>
              Start review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function InquiryDetail({ inquiry, onCreateQuote }: { inquiry: WholesaleInquiry; onCreateQuote: () => void }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-xl border p-4 text-sm sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>
            <strong>{inquiry.companyName}</strong>
            <br />
            {inquiry.contactName}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {inquiry.contactEmail}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {[inquiry.deliveryCity, inquiry.deliveryCountry].filter(Boolean).join(', ')}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {formatDate(inquiry.createdAt)}
        </p>
      </div>
      {inquiry.notes && (
        <div>
          <Label>Customer requirements</Label>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-muted/40 p-4 text-sm">{inquiry.notes}</p>
        </div>
      )}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Requested products</h3>
          {!['accepted', 'cancelled', 'closed'].includes(inquiry.status) && (
            <Button onClick={onCreateQuote}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              Create quotation
            </Button>
          )}
        </div>
        <div className="overflow-hidden rounded-xl border">
          <div className="divide-y">
            {inquiry.items.map((item) => (
              <div key={item.id} className="grid gap-2 p-4 text-sm sm:grid-cols-[1fr_140px_140px]">
                <div>
                  <p className="font-semibold">{item.productNameSnapshot}</p>
                  <p className="text-muted-foreground">SKU {item.skuSnapshot}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Requested</span>
                  <p className="font-semibold">{item.requestedQuantity} pcs</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Target price</span>
                  <p className="font-semibold">
                    {item.targetUnitPrice != null ? formatCurrency(item.targetUnitPrice) : 'Not provided'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {inquiry.quotations?.length ? (
        <div>
          <h3 className="mb-3 font-semibold">Quotation history</h3>
          <div className="space-y-3">
            {inquiry.quotations.map((quote) => (
              <div key={quote.id} className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-semibold">{quote.reference}</p>
                  <p className="text-sm text-muted-foreground">Expires {formatDate(quote.expiresAt)}</p>
                  {quote.order && (
                    <p className="mt-1 text-sm font-medium text-emerald-700">
                      Order {quote.order.orderNumber ?? quote.order.id} ·{' '}
                      {quote.order.status.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="capitalize">
                    {quote.status}
                  </Badge>
                  <p className="mt-1 font-bold">
                    {quote.currency} {Number(quote.totalAmount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function QuotationDialog({
  open,
  onOpenChange,
  inquiry,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  inquiry: WholesaleInquiry
}) {
  const qc = useQueryClient()
  const [currency, setCurrency] = useState('PKR')
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [tax, setTax] = useState(0)
  const [terms, setTerms] = useState(
    'Prices and stock are valid until the expiry date. Delivery schedule will be confirmed after acceptance.',
  )
  const [internalNotes, setInternalNotes] = useState('')
  const [expiresAt, setExpiresAt] = useState(() => {
    const date = new Date(Date.now() + 7 * 86400000)
    return date.toISOString().slice(0, 16)
  })
  const [lines, setLines] = useState(() =>
    inquiry.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.requestedQuantity,
      unitPrice: Number(item.targetUnitPrice ?? item.variant?.price ?? 0),
    })),
  )

  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0), [lines])
  const total = Math.max(0, subtotal - discount + shipping + tax)
  const mutation = useMutation({
    mutationFn: (payload: CreateWholesaleQuotationPayload) => wholesaleApi.createQuotation(inquiry.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wholesale-inquiries'] })
      qc.invalidateQueries({ queryKey: ['wholesale-inquiry'] })
      toast.success('Quotation sent to the customer.')
      onOpenChange(false)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Unable to create quotation')),
  })
  const submit = () =>
    mutation.mutate({
      currency,
      discountAmount: discount,
      shippingAmount: shipping,
      taxAmount: tax,
      terms,
      internalNotes: internalNotes || undefined,
      expiresAt: new Date(expiresAt).toISOString(),
      items: lines,
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create quotation</DialogTitle>
          <DialogDescription>
            Set wholesale unit prices and commercial terms. This sends a quotation only; no payment request is created.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Currency</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 3))}
                maxLength={3}
              />
            </div>
            <div>
              <Label>Valid until</Label>
              <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-3">
            {inquiry.items.map((item, index) => (
              <div key={item.id} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_120px_150px]">
                <div>
                  <p className="font-semibold">{item.productNameSnapshot}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.skuSnapshot} · requested {item.requestedQuantity}
                  </p>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    max={item.requestedQuantity}
                    value={lines[index]?.quantity ?? 1}
                    onChange={(e) =>
                      setLines((current) =>
                        current.map((line, i) => (i === index ? { ...line, quantity: Number(e.target.value) } : line)),
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Unit price</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.0001"
                    value={lines[index]?.unitPrice ?? 0}
                    onChange={(e) =>
                      setLines((current) =>
                        current.map((line, i) => (i === index ? { ...line, unitPrice: Number(e.target.value) } : line)),
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Discount</Label>
              <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
            </div>
            <div>
              <Label>Shipping</Label>
              <Input type="number" min={0} value={shipping} onChange={(e) => setShipping(Number(e.target.value))} />
            </div>
            <div>
              <Label>Tax</Label>
              <Input type="number" min={0} value={tax} onChange={(e) => setTax(Number(e.target.value))} />
            </div>
          </div>
          <div className="rounded-xl bg-muted/50 p-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                {currency} {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 flex justify-between text-lg font-bold">
              <span>Quotation total</span>
              <span>
                {currency} {total.toLocaleString()}
              </span>
            </div>
          </div>
          <div>
            <Label>Customer terms</Label>
            <Textarea rows={4} value={terms} onChange={(e) => setTerms(e.target.value)} />
          </div>
          <div>
            <Label>Internal notes</Label>
            <Textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Visible to admins only"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={
              mutation.isPending ||
              lines.some((line) => line.quantity < 1 || line.unitPrice < 0) ||
              currency.length !== 3
            }
          >
            {mutation.isPending ? 'Sending…' : 'Send quotation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
