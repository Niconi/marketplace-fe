"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Order } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SHIPPING_COST = 15000;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    notes: "",
  });

  // Redirect away if cart is empty (e.g. after refresh)
  useEffect(() => {
    if (items.length === 0) {
      const t = setTimeout(() => router.replace("/cart"), 50);
      return () => clearTimeout(t);
    }
  }, [items.length, router]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const res = await api<{ data: Order }>("/orders", {
        method: "POST",
        body: {
          ...form,
          items: items.map((i) => ({
            product_id: i.id,
            quantity: i.quantity,
          })),
        },
      });
      clearCart();
      toast.success("Pesanan dibuat! Lanjut ke pembayaran.");
      router.push(`/payment/${res.data.order_number}`);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors) setErrors(apiErr.errors);
      toast.error(apiErr.message || "Gagal membuat pesanan");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-slate-500">
        Keranjang kosong, mengalihkan...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Shipping details */}
        <div className="space-y-4 rounded-xl border bg-white p-5 lg:col-span-2">
          <h2 className="font-semibold">Data Penerima</h2>

          <Field label="Nama Lengkap" error={errors.customer_name}>
            <Input
              value={form.customer_name}
              onChange={(e) => update("customer_name", e.target.value)}
              placeholder="Nama kamu"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" error={errors.customer_email}>
              <Input
                type="email"
                value={form.customer_email}
                onChange={(e) => update("customer_email", e.target.value)}
                placeholder="email@contoh.com"
                required
              />
            </Field>
            <Field label="No. Telepon" error={errors.customer_phone}>
              <Input
                value={form.customer_phone}
                onChange={(e) => update("customer_phone", e.target.value)}
                placeholder="08xxxxxxxxxx"
                required
              />
            </Field>
          </div>

          <Field label="Alamat Pengiriman" error={errors.shipping_address}>
            <Textarea
              value={form.shipping_address}
              onChange={(e) => update("shipping_address", e.target.value)}
              placeholder="Jalan, no rumah, kelurahan, kota, kode pos"
              rows={3}
              required
            />
          </Field>

          <Field label="Catatan (opsional)" error={errors.notes}>
            <Textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Catatan untuk penjual"
              rows={2}
            />
          </Field>
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-xl border bg-white p-5">
          <h2 className="mb-4 font-semibold">Pesananmu</h2>
          <div className="space-y-3 text-sm">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between gap-2">
                <span className="text-slate-600">
                  {i.name}{" "}
                  <span className="text-slate-400">×{i.quantity}</span>
                </span>
                <span className="font-medium whitespace-nowrap">
                  {formatRupiah(i.price * i.quantity)}
                </span>
              </div>
            ))}
            <div className="my-3 border-t" />
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Ongkir</span>
              <span>{formatRupiah(SHIPPING_COST)}</span>
            </div>
            <div className="my-3 border-t" />
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">
                {formatRupiah(subtotal + SHIPPING_COST)}
              </span>
            </div>
          </div>

          <Button type="submit" className="mt-5 w-full" size="lg" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Buat Pesanan & Bayar
          </Button>
          <Link
            href="/cart"
            className="mt-3 block text-center text-sm text-slate-500 hover:text-slate-800"
          >
            Kembali ke keranjang
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error[0]}</p>}
    </div>
  );
}
