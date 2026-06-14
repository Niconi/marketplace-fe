"use client";

import { useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Order, OrderStatus, Paginated } from "@/lib/types";
import { formatRupiah, formatDate } from "@/lib/format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/order-status-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "completed",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ per_page: "50" });
    if (search) params.set("search", search);
    try {
      const res = await api<Paginated<Order>>(`/admin/orders?${params}`, {
        auth: true,
      });
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function updateStatus(order: Order, status: OrderStatus) {
    try {
      const res = await api<{ data: Order }>(
        `/admin/orders/${order.id}/status`,
        { method: "PATCH", auth: true, body: { status } }
      );
      toast.success("Status diperbarui");
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? res.data : o))
      );
      if (selected?.id === order.id) setSelected(res.data);
    } catch {
      toast.error("Gagal memperbarui status");
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Pesanan</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
        }}
        className="mb-4 flex gap-2"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari no. pesanan / nama / email"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline">
          Cari
        </Button>
      </form>

      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">No. Pesanan</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Bayar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs">{o.order_number}</span>
                    <div className="text-xs text-slate-400">
                      {formatDate(o.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-slate-400">
                      {o.customer_phone}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatRupiah(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={o.payment_status} />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={o.status}
                      onValueChange={(v) =>
                        updateStatus(o, v as OrderStatus)
                      }
                    >
                      <SelectTrigger className="h-8 w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(o)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Belum ada pesanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono text-base">
                  {selected.order_number}
                </DialogTitle>
              </DialogHeader>

              <div className="flex gap-2">
                <OrderStatusBadge status={selected.status} />
                <PaymentStatusBadge status={selected.payment_status} />
              </div>

              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <p className="font-medium">{selected.customer_name}</p>
                <p className="text-slate-500">{selected.customer_phone}</p>
                <p className="text-slate-500">{selected.customer_email}</p>
                <p className="mt-1 text-slate-600">
                  {selected.shipping_address}
                </p>
                {selected.notes && (
                  <p className="mt-1 text-slate-500">
                    Catatan: {selected.notes}
                  </p>
                )}
              </div>

              <div className="divide-y rounded-lg border text-sm">
                {selected.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-2 p-3"
                  >
                    <span>
                      {item.product_name}{" "}
                      <span className="text-slate-400">×{item.quantity}</span>
                    </span>
                    <span className="font-medium">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatRupiah(selected.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Ongkir</span>
                  <span>{formatRupiah(selected.shipping_cost)}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-bold">
                  <span>Total</span>
                  <span>{formatRupiah(selected.total)}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
