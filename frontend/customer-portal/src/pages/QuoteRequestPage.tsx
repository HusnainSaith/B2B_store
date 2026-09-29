import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FileText, PackageCheck } from "lucide-react";
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
      <div className="container-main py-8">
        <Breadcrumb
          items={[
            { label: "Inquiry Basket", to: ROUTES.CART },
            { label: "Request Quote" },
          ]}
        />
        <div className="mx-auto mt-6 grid max-w-5xl gap-6 lg:grid-cols-[1fr_340px]">
          <form
            onSubmit={submit}
            className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">
                Request wholesale pricing
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Tell us where the goods are needed. Our team will review
                availability and send a formal quotation—no payment is collected
                here.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
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
              className="h-12 w-full font-bold"
              disabled={submitting || !items.length}
            >
              {submitting ? "Sending inquiry…" : "Send wholesale inquiry"}
            </Button>
          </form>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <PackageCheck className="text-primary" />
              <div>
                <p className="font-bold text-text-primary">
                  Requested products
                </p>
                <p className="text-xs text-text-muted">
                  {totalPieces} total pieces
                </p>
              </div>
            </div>
            <div className="mt-5 divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="py-4 text-sm">
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
            <p className="mt-4 rounded-lg bg-surface p-3 text-xs text-text-secondary">
              Final unit prices, delivery charges, taxes, and validity will
              appear in the admin-issued quotation.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
