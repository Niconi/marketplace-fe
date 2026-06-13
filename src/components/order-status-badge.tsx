import { Badge } from "@/components/ui/badge";
import { OrderStatus, PaymentStatus } from "@/lib/types";

const STATUS_MAP: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Menunggu Pembayaran", className: "bg-amber-100 text-amber-700" },
  processing: { label: "Diproses", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Selesai", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },
};

const PAYMENT_MAP: Record<PaymentStatus, { label: string; className: string }> = {
  unpaid: { label: "Belum Dibayar", className: "bg-slate-100 text-slate-600" },
  paid: { label: "Lunas", className: "bg-green-100 text-green-700" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS_MAP[status];
  return <Badge className={`${s.className} border-0`}>{s.label}</Badge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const s = PAYMENT_MAP[status];
  return <Badge className={`${s.className} border-0`}>{s.label}</Badge>;
}
