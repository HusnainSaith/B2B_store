import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  FileText,
  Printer,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { wholesaleApi } from "@/services/api";
import { formatPrice } from "@/lib/format";
import type { WholesaleInquiry, WholesaleQuotation } from "@/types";

const statusClass: Record<string, string> = {
  submitted: "bg-primary/20 text-secondary",
  under_review: "bg-amber-100 text-amber-700",
  quoted: "bg-secondary/10 text-secondary dark:bg-primary/20 dark:text-primary",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-700",
  closed: "bg-gray-100 text-gray-700",
  sent: "bg-secondary/10 text-secondary dark:bg-primary/20 dark:text-primary",
  expired: "bg-gray-100 text-gray-700",
  superseded: "bg-gray-100 text-gray-700",
};

export default function WholesaleInquiriesPage() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["wholesale-inquiries"],
    queryFn: () => wholesaleApi.listInquiries({ limit: 50 }),
  });
  const detail = useQuery({
    queryKey: ["wholesale-inquiry", expanded],
    queryFn: () => {
      if (!expanded) throw new Error("Inquiry id is required");
      return wholesaleApi.getInquiry(expanded);
    },
    enabled: !!expanded,
  });
  const respond = useMutation({
    mutationFn: ({
      quote,
      accept,
    }: {
      quote: WholesaleQuotation;
      accept: boolean;
    }) =>
      accept
        ? wholesaleApi.acceptQuotation(quote.id)
        : wholesaleApi.declineQuotation(quote.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wholesale-inquiries"] });
      qc.invalidateQueries({ queryKey: ["wholesale-inquiry"] });
      toast.success("Your response has been recorded.");
    },
    onError: () => toast.error("Unable to update this quotation."),
  });
  const cancel = useMutation({
    mutationFn: wholesaleApi.cancelInquiry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wholesale-inquiries"] });
      qc.invalidateQueries({ queryKey: ["wholesale-inquiry"] });
      toast.success("Inquiry cancelled.");
    },
    onError: () => toast.error("This inquiry can no longer be cancelled."),
  });

  const inquiries = data?.items ?? [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Quotes & inquiries
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Track your wholesale requests and respond to quotations.
        </p>
      </div>
      {isLoading ? (
        <div className="py-16 text-center text-text-muted">
          Loading inquiries…
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <FileText className="mx-auto h-10 w-10 text-text-muted" />
          <h2 className="mt-3 font-bold">No wholesale inquiries yet</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Add products to your inquiry basket to request pricing.
          </p>
        </div>
      ) : (
        inquiries.map((inquiry) => (
          <InquiryCard
            key={inquiry.id}
            inquiry={
              expanded === inquiry.id && detail.data ? detail.data : inquiry
            }
            expanded={expanded === inquiry.id}
            onToggle={() =>
              setExpanded(expanded === inquiry.id ? null : inquiry.id)
            }
            onRespond={(quote, accept) => respond.mutate({ quote, accept })}
            onCancel={() => cancel.mutate(inquiry.id)}
            busy={respond.isPending || cancel.isPending}
          />
        ))
      )}
    </div>
  );
}

function InquiryCard({
  inquiry,
  expanded,
  onToggle,
  onRespond,
  onCancel,
  busy,
}: {
  inquiry: WholesaleInquiry;
  expanded: boolean;
  onToggle: () => void;
  onRespond: (quote: WholesaleQuotation, accept: boolean) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-text-primary">
              {inquiry.reference}
            </span>
            <Badge className={statusClass[inquiry.status]}>
              {inquiry.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {inquiry.companyName} ·{" "}
            {new Date(inquiry.createdAt).toLocaleDateString()} ·{" "}
            {inquiry.items?.length ?? 0} items
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="border-t border-border p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {inquiry.items?.map((item) => (
              <div key={item.id} className="rounded-xl bg-surface p-3 text-sm">
                <p className="font-semibold">{item.productNameSnapshot}</p>
                <p className="text-text-secondary">
                  SKU {item.skuSnapshot} · Qty {item.requestedQuantity}
                </p>
              </div>
            ))}
          </div>
          {(inquiry.status === "submitted" ||
            inquiry.status === "under_review") && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={onCancel}
              disabled={busy}
            >
              Cancel inquiry
            </Button>
          )}
          {inquiry.quotations?.map((quote) => (
            <QuotationCard
              key={quote.id}
              quote={quote}
              onRespond={onRespond}
              busy={busy}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function QuotationCard({
  quote,
  onRespond,
  busy,
}: {
  quote: WholesaleQuotation;
  onRespond: (quote: WholesaleQuotation, accept: boolean) => void;
  busy: boolean;
}) {
  return (
    <div className="quotation-print-area mt-5 rounded-xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold">Quotation {quote.reference}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
            <CalendarClock className="h-3.5 w-3.5" />
            Valid until {new Date(quote.expiresAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusClass[quote.status]}>{quote.status}</Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="print:hidden"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / PDF
          </Button>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        {quote.items?.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>
              {item.productNameSnapshot} × {item.quantity}
            </span>
            <span>{formatPrice(item.lineTotal, quote.currency)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-primary/15 pt-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(quote.subtotal, quote.currency)}</span>
        </div>
        <div className="mt-2 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(quote.totalAmount, quote.currency)}</span>
        </div>
      </div>
      {quote.terms && (
        <p className="mt-4 whitespace-pre-wrap rounded-lg bg-card p-3 text-sm text-text-secondary">
          {quote.terms}
        </p>
      )}
      {quote.order && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <p className="font-bold">
            Wholesale order {quote.order.orderNumber ?? quote.order.id}
          </p>
          <p className="mt-1 capitalize">
            Fulfilment status: {quote.order.status.replace(/_/g, " ")}
          </p>
        </div>
      )}
      {quote.status === "sent" && (
        <div className="mt-4 flex gap-3">
          <Button onClick={() => onRespond(quote, true)} disabled={busy}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Accept quotation
          </Button>
          <Button
            variant="outline"
            onClick={() => onRespond(quote, false)}
            disabled={busy}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}
