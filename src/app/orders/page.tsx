"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Order, OrderItem, Paginated } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";

const statusLabel: Record<string, string> = {
  pending: "Menunggu",
  processing: "Diproses",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const paymentColor: Record<string, string> = {
  unpaid: "bg-orange-100 text-orange-700",
  paid: "bg-emerald-100 text-emerald-700",
};

interface ReviewFormState {
  rating: number;
  comment: string;
  submitting: boolean;
}

function ReviewForm({
  item,
  onSubmitted,
}: {
  item: OrderItem;
  onSubmitted: (productId: number) => void;
}) {
  const [form, setForm] = useState<ReviewFormState>({
    rating: 0,
    comment: "",
    submitting: false,
  });

  async function submit() {
    if (!item.product_id || form.rating === 0) return;
    setForm((f) => ({ ...f, submitting: true }));
    try {
      await api(`/products/${item.product_id}/reviews`, {
        method: "POST",
        customerAuth: true,
        body: { rating: form.rating, comment: form.comment || null },
      });
      toast.success(`Ulasan untuk "${item.product_name}" berhasil dikirim`);
      onSubmitted(item.product_id!);
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || "Gagal mengirim ulasan");
      setForm((f) => ({ ...f, submitting: false }));
    }
  }

  return (
    <div className="mt-3 rounded-lg border bg-muted/40 p-4">
      <p className="mb-2 text-sm font-medium">Beri Ulasan</p>
      <StarRating
        rating={form.rating}
        size={22}
        interactive
        onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
      />
      <Textarea
        value={form.comment}
        onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
        placeholder="Ceritakan pengalamanmu dengan produk ini (opsional)"
        className="mt-2 text-sm"
        rows={2}
      />
      <Button
        size="sm"
        className="mt-2"
        disabled={form.rating === 0 || form.submitting}
        onClick={submit}
      >
        {form.submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        Kirim Ulasan
      </Button>
    </div>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const load = useCallback(() => {
    api<Paginated<Order>>("/customer/orders", { customerAuth: true })
      .then((res) => {
        setOrders(res.data);
        setReviewedIds(new Set(res.reviewed_product_ids ?? []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    load();
  }, [user, authLoading, router, load]);

  function onReviewSubmitted(productId: number) {
    setReviewedIds((prev) => new Set([...prev, productId]));
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="mb-4 h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Pesanan Saya</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Belum ada pesanan</p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const isCompleted = order.status === "completed";
            const hasReviewable = isCompleted &&
              order.items.some(
                (item) => item.product_id && !reviewedIds.has(item.product_id)
              );

            return (
              <div key={order.id} className="rounded-xl border bg-card overflow-hidden">
                {/* Order header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-indigo-600">
                        {order.order_number}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.items.length} produk
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatRupiah(order.total)}</p>
                      <div className="mt-2 flex flex-wrap justify-end gap-2">
                        <Badge
                          variant="secondary"
                          className={statusColor[order.status] || ""}
                        >
                          {statusLabel[order.status] || order.status}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={paymentColor[order.payment_status] || ""}
                        >
                          {order.payment_status === "paid" ? "Dibayar" : "Belum Bayar"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="mt-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? (
                      <><ChevronUp className="h-4 w-4" /> Sembunyikan detail</>
                    ) : (
                      <><ChevronDown className="h-4 w-4" /> Lihat detail{hasReviewable ? " · Ada produk yang bisa diulas" : ""}</>
                    )}
                  </button>
                </div>

                {/* Expanded items */}
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                  <div className="border-t px-5 pb-5 pt-4 space-y-4">
                    {order.items.map((item) => {
                      const alreadyReviewed = item.product_id ? reviewedIds.has(item.product_id) : true;
                      return (
                        <div key={item.id}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border bg-muted">
                                {item.product?.image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.product.image_url}
                                    alt={item.product_name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground/40">
                                    {item.product_name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} × {formatRupiah(item.price)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-semibold">{formatRupiah(item.subtotal)}</p>
                          </div>

                          {/* Review area — only for completed orders */}
                          {isCompleted && item.product_id && (
                            alreadyReviewed ? (
                              <p className="mt-2 text-xs text-muted-foreground italic">
                                Sudah diulas
                              </p>
                            ) : (
                              <ReviewForm
                                item={item}
                                onSubmitted={onReviewSubmitted}
                              />
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
