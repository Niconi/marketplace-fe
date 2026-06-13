"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";

const SHIPPING_COST = 15000;

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <ShoppingCart className="mx-auto h-14 w-14 text-slate-300" />
        <h1 className="mt-4 text-xl font-semibold">Keranjang masih kosong</h1>
        <p className="mt-1 text-slate-500">
          Yuk pilih produk yang kamu suka dulu.
        </p>
        <Link href="/">
          <Button className="mt-6">Mulai Belanja</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Keranjang Belanja</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border bg-white p-3"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-300">
                    {item.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-medium text-slate-800 hover:text-indigo-600 line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-indigo-600 font-semibold">
                  {formatRupiah(item.price)}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border">
                    <button
                      className="px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="px-2 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" /> Hapus
                  </button>
                </div>
              </div>

              <div className="hidden w-28 shrink-0 text-right font-semibold sm:block">
                {formatRupiah(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border bg-white p-5">
          <h2 className="mb-4 font-semibold">Ringkasan</h2>
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatRupiah(subtotal)} />
            <Row label="Ongkos kirim" value={formatRupiah(SHIPPING_COST)} />
            <div className="my-3 border-t" />
            <Row
              label="Total"
              value={formatRupiah(subtotal + SHIPPING_COST)}
              bold
            />
          </div>
          <Button
            className="mt-5 w-full"
            size="lg"
            onClick={() => router.push("/checkout")}
          >
            Lanjut ke Checkout <ArrowRight className="h-4 w-4" />
          </Button>
          <Link
            href="/"
            className="mt-3 block text-center text-sm text-slate-500 hover:text-slate-800"
          >
            Lanjut belanja
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-semibold" : "text-slate-500"}>{label}</span>
      <span className={bold ? "text-lg font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
