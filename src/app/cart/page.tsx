"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Package } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/format";

const SHIPPING_COST = 15000;

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-50">
          <ShoppingCart className="h-9 w-9 text-violet-400" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-800">Keranjang masih kosong</h1>
        <p className="mt-2 text-slate-500">
          Yuk pilih produk yang kamu suka dulu.
        </p>
        <Link href="/">
          <button className="group/btn relative mt-7 flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition-all duration-200 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/25 mx-auto">
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            <span className="relative">Mulai Belanja</span>
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-7 text-2xl font-bold text-slate-900">Keranjang Belanja</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="group/item flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/8"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-bold text-slate-300">
                    {item.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col min-w-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:text-violet-600"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-sm font-semibold text-violet-600">
                  {formatRupiah(item.price)}
                </p>

                <div className="mt-auto pt-2">
                  {/* Quantity controls */}
                  <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-0.5 w-fit transition-colors duration-200 hover:border-violet-200">
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-all duration-150 hover:bg-white hover:text-violet-600 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-all duration-150 hover:bg-white hover:text-violet-600 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-30"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex w-28 shrink-0 flex-col items-end justify-between">
                <span className="font-bold text-slate-900">
                  {formatRupiah(item.price * item.quantity)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="group/del rounded-lg p-1.5 text-slate-300 transition-all duration-200 hover:bg-red-50 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover/del:scale-110" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-violet-500" />
            <h2 className="font-bold text-slate-900">Ringkasan</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-700">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Ongkos kirim</span>
              <span className="font-medium text-slate-700">{formatRupiah(SHIPPING_COST)}</span>
            </div>
            <div className="my-1 border-t border-dashed border-slate-200" />
            <div className="flex justify-between">
              <span className="font-bold text-slate-900">Total</span>
              <span className="text-lg font-bold text-slate-900">
                {formatRupiah(subtotal + SHIPPING_COST)}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="group/btn relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition-all duration-200 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/25 active:scale-[0.99]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
            <span className="relative">Lanjut ke Checkout</span>
            <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </button>

          <Link
            href="/"
            className="mt-3 block text-center text-sm text-slate-400 transition-colors duration-200 hover:text-violet-600"
          >
            ← Lanjut belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
