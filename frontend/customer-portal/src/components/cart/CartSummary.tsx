import { Button } from "@/components/ui/button";
import { FileText, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  discount?: number;
  shipping?: number;
  couponCode?: string;
  couponId?: string;
}

export function CartSummary({ itemCount }: CartSummaryProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 sticky top-24">
      <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <FileText className="mb-3 h-6 w-6 text-primary" />
        <h2 className="font-bold text-text-primary">
          Request wholesale pricing
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Send {itemCount} selected {itemCount === 1 ? "product" : "products"}{" "}
          and your required quantities to our team. No payment is required.
        </p>
      </div>

      <Link to={ROUTES.REQUEST_QUOTE}>
        <Button
          className="w-full font-bold h-12 rounded-xl text-sm uppercase tracking-wide shadow-lg shadow-primary/20"
          size="lg"
          disabled={itemCount === 0}
        >
          Request a Quote
        </Button>
      </Link>

      <div className="flex items-center gap-1.5 justify-center mt-4 text-xs text-text-muted">
        <MessageSquareText className="h-3.5 w-3.5 text-primary" /> Our team will
        respond with a tailored quotation
      </div>
    </div>
  );
}
