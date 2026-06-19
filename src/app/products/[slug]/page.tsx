"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, ArrowLeft, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Product, Review, Paginated } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { formatDate } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/star-rating";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!slug) return;
    api<{ data: Product }>(`/products/${slug}`)
      .then((res) => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const loadReviews = useCallback(async (productId: number) => {
    try {
      const res = await api<Paginated<Review>>(`/products/${productId}/reviews`);
      setReviews(res.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (product) loadReviews(product.id);
  }, [product, loadReviews]);

  async function deleteReview(reviewId: number) {
    try {
      await api(`/reviews/${reviewId}`, {
        method: "DELETE",
        customerAuth: true,
      });
      toast.success("Ulasan berhasil dihapus");
      if (product) loadReviews(product.id);
    } catch {
      toast.error("Gagal menghapus ulasan");
    }
  }

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
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl border bg-card">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl font-bold text-muted-foreground/30">
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
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.avg_rating != null && product.reviews_count > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={Number(product.avg_rating)} size={18} />
              <span className="text-sm text-muted-foreground">
                {Number(product.avg_rating).toFixed(1)} ({product.reviews_count} ulasan)
              </span>
            </div>
          )}
          <p className="mt-3 text-3xl font-bold text-indigo-600">
            {formatRupiah(product.price)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Stok tersedia: <span className="font-medium">{product.stock}</span>
          </p>

          {product.description && (
            <p className="mt-5 whitespace-pre-line text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Jumlah</span>
              <div className="flex items-center rounded-md border bg-card">
                <button
                  className="px-3 py-2 text-muted-foreground hover:bg-accent disabled:opacity-40"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button
                  className="px-3 py-2 text-muted-foreground hover:bg-accent disabled:opacity-40"
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

      {/* Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="mb-6 text-xl font-bold">Ulasan Produk</h2>

        <div className="mb-6 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          Sudah berbelanja produk ini?{" "}
          <Link href="/orders" className="font-medium text-indigo-600 hover:text-indigo-500">
            Beri ulasan di Pesanan Saya
          </Link>
        </div>

        {/* Review List */}
        {reviews.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Belum ada ulasan untuk produk ini.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{review.user.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating rating={review.rating} size={14} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                  </div>
                  {user && user.id === review.user_id && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {review.comment && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
