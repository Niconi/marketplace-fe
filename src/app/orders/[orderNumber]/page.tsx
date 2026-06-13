"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import { formatRupiah, formatDate } from "@/lib/format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/order-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api<{ data: Order }>(`/orders/${orderNumber}`);
      setOrder(res.data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-slate-500">
        Pesanan tidak ditemukan.
        <Link href="/orders/track" className="mt-4 block text-indigo-600 underline">
          Coba lacak lagi
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Nomor Pesanan</p>
            <p className="font-mono text-lg font-bold">{order.order_number}</p>
            <p className="mt-1 text-xs text-slate-400">
              {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.payment_status} />
          </div>
        </div>

        {order.payment_status === "unpaid" && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-amber-50 p-3">
            <span className="text-sm text-amber-700">
              Pesanan ini belum dibayar.
            </span>
            <Link href={`/payment/${order.order_number}`}>
              <Button size="sm">
                <CreditCard className="h-4 w-4" /> Bayar
              </Button>
            </Link>
          </div>
        )}

        {/* Items */}
        <div className="mt-6">
          <h2 className="mb-3 font-semibold">Item Pesanan</h2>
          <div className="divide-y rounded-lg border">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2 p-3 text-sm">
                <span className="text-slate-700">
                  {item.product_name}{" "}
                  <span className="text-slate-400">×{item.quantity}</span>
                </span>
                <span className="font-medium whitespace-nowrap">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Ongkir</span>
            <span>{formatRupiah(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold">{formatRupiah(order.total)}</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm">
          <h3 className="mb-2 font-semibold">Alamat Pengiriman</h3>
          <p className="text-slate-700">{order.customer_name}</p>
          <p className="text-slate-500">{order.customer_phone}</p>
          <p className="text-slate-500">{order.customer_email}</p>
          <p className="mt-1 text-slate-600">{order.shipping_address}</p>
          {order.notes && (
            <p className="mt-2 text-slate-500">Catatan: {order.notes}</p>
          )}
        </div>

        <Link href="/" className="mt-6 block text-center text-sm text-indigo-600 hover:underline">
          Kembali belanja
        </Link>
      </div>
    </div>
  );
}
