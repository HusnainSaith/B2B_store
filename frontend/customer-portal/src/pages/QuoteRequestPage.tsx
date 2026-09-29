import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, PackageCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SEOHead } from "@/components/common/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes";
import { cartApi, wholesaleApi } from "@/services/api";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import type { CartItem } from "@/types";

export default function QuoteRequestPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearLocalCart = useCartStore((state) => state.clearCart);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState(
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(),
  );
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [deliveryCountry, setDeliveryCountry] = useState("PK");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    cartApi
      .getItems()
      .then((data) => {
        if (!data.length) navigate(ROUTES.CART, { replace: true });
        setItems(data);
      })
      .catch(() => navigate(ROUTES.CART, { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  const totalPieces = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedCountry = deliveryCountry.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(normalizedCountry)) {
      toast.error("Use a two-letter country code, for example PK or AE.");
      return;
    }
    setSubmitting(true);
    try {
      await wholesaleApi.createInquiry({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || undefined,
        deliveryCountry: normalizedCountry,
        deliveryCity: deliveryCity.trim() || undefined,
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          variantId: item.variantId,
          requestedQuantity: item.quantity,
        })),
      });
      await cartApi.clear().catch(() => undefined);
      clearLocalCart();
      toast.success("Your wholesale inquiry has been sent.");
      navigate(ROUTES.ACCOUNT_WHOLESALE, { replace: true });
    } catch (error) {
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const detail = Array.isArray(response?.details)
        ? response.details[0]
        : response?.message;
      toast.error(
        detail ||
          "We could not send your inquiry. Please review the form and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner />
      </div>
    );

  return (
    <>
      <SEOHead title="Request a Wholesale Quote" />
      <div className="container-main py-8 sm:py-10">
        <Breadcrumb
          items={[
            { label: "Inquiry Basket", to: ROUTES.CART },
            { label: "Request Quote" },
          ]}
        />
        <div className="mx-auto mt-6 grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <form
            onSubmit={submit}
            className="relative space-y-7 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-primary before:via-primary before:to-secondary sm:p-8"
          >
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary shadow-lg shadow-secondary/15">
                <FileText className="h-5 w-5" />
              </div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">Wholesale inquiry</p>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Request wholesale pricing
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                Tell us where the goods are needed. Our team will review
                availability and send a formal quotation—no payment is collected
                here.
              </p>
            </div>

            <div className="grid gap-x-5 gap-y-6 border-t border-border pt-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company name</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  minLength={2}
                  maxLength={200}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact person</Label>
                <Input
                  id="contact"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  minLength={2}
                  maxLength={200}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Business email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone / WhatsApp</Label>
                <Input
                  id="phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+92..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Delivery country code</Label>
                <Input
                  id="country"
                  value={deliveryCountry}
                  onChange={(e) => setDeliveryCountry(e.target.value)}
                  minLength={2}
                  maxLength={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Delivery city</Label>
                <Input
                  id="city"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  maxLength={120}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">
                Requirements or special instructions
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                maxLength={3000}
                placeholder="Packaging, delivery deadline, customization, or other requirements..."
              />
            </div>
            <Button
              type="submit"
              className="h-13 w-full gap-2 font-bold"
              disabled={submitting || !items.length}
            >
              {submitting ? "Sending inquiry…" : "Send wholesale inquiry"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
            <div className="flex items-center justify-center gap-2 text-center text-xs text-text-muted">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              No payment is collected when submitting this request.
            </div>
          </form>

          <aside className="h-fit overflow-hidden rounded-3xl border border-border bg-card shadow-card lg:sticky lg:top-24">
            <div className="flex items-center gap-3 bg-secondary px-6 py-5 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-black"><PackageCheck className="h-5 w-5" /></div>
              <div>
                <p className="font-bold text-white">
                  Requested products
                </p>
                <p className="text-xs text-white/60">
                  {totalPieces} total pieces
                </p>
              </div>
            </div>
            <div className="divide-y divide-border px-6">
              {items.map((item) => (
                <div key={item.id} className="py-5 text-sm">
                  <p className="font-medium text-text-primary">
                    {item.variant?.product?.name ??
                      item.variant?.sku ??
                      "Product variant"}
                  </p>
                  <div className="mt-1 flex justify-between text-text-secondary">
                    <span>SKU {item.variant?.sku ?? "—"}</span>
                    <span className="font-semibold">Qty {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mx-6 mb-6 mt-2 rounded-xl border border-primary/20 bg-primary/10 p-4 text-xs leading-5 text-text-secondary">
              Final unit prices, delivery charges, taxes, and validity will
              appear in the admin-issued quotation.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
