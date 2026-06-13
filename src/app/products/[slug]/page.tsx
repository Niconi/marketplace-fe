"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!slug) return;
    api<{ data: Product }>(`/products/${slug}`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 grid gap-8 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-slate-500">Produk tidak ditemukan.</p>
        <Link href="/" className="mt-4 inline-block text-indigo-600 underline">
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl border bg-white">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl font-bold text-slate-200">
              {product.name.charAt(0)}
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <Badge variant="secondary" className="mb-3">
              {product.category.name}
            </Badge>
          )}
          <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
          <p className="mt-3 text-3xl font-bold text-indigo-600">
            {formatRupiah(product.price)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Stok tersedia: <span className="font-medium">{product.stock}</span>
          </p>

          {product.description && (
            <p className="mt-5 whitespace-pre-line text-slate-600 leading-relaxed">
              {product.description}
            </p>
          )}

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm text-slate-600">Jumlah</span>
              <div className="flex items-center rounded-md border bg-white">
                <button
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              disabled={outOfStock}
              onClick={() => {
                addItem(product, qty);
                toast.success("Ditambahkan ke keranjang");
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {outOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
            </Button>
            <Button
              size="lg"
              className="flex-1"
              disabled={outOfStock}
              onClick={() => {
                addItem(product, qty);
                router.push("/cart");
              }}
            >
              <Check className="h-4 w-4" />
              Beli Sekarang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
