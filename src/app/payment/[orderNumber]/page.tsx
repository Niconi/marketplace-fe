"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Order } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const AUTO_PAY_SECONDS = 10;

export default function PaymentPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_PAY_SECONDS);
  const [autoTried, setAutoTried] = useState(false);

  const isPaid = order?.payment_status === "paid";

  const loadOrder = useCallback(async () => {
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
    loadOrder();
  }, [loadOrder]);

  const pay = useCallback(async () => {
    if (paying) return;
    setPaying(true);
    try {
      const res = await api<{ data: Order }>(`/orders/${orderNumber}/pay`, {
        method: "POST",
      });
      setOrder(res.data);
      toast.success("Pembayaran berhasil!");
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || "Gagal memproses pembayaran");
    } finally {
      setPaying(false);
    }
  }, [orderNumber, paying]);

  // Auto-simulate payment countdown (fires the auto-pay attempt only once)
  useEffect(() => {
    if (loading || isPaid) return;
    if (countdown <= 0) {
      if (!autoTried) {
        setAutoTried(true);
        pay();
      }
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, loading, isPaid, pay, autoTried]);

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-slate-500">
        Pesanan tidak ditemukan.
        <Link href="/" className="mt-4 block text-indigo-600 underline">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  // QR payload (would normally be a QRIS string from a payment gateway)
  const qrPayload = JSON.stringify({
    order: order.order_number,
    amount: order.total,
    merchant: "Tokoku",
  });

  if (isPaid) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-2xl border bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-xl font-bold">Pembayaran Berhasil</h1>
          <p className="mt-1 text-slate-500">
            Terima kasih! Pesananmu sedang diproses.
          </p>

          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-left text-sm">
            <Row label="No. Pesanan" value={order.order_number} mono />
            <Row label="Total Dibayar" value={formatRupiah(order.total)} />
            <Row label="Status" value="Diproses" />
          </div>

          <Link href={`/orders/${order.order_number}`}>
            <Button className="mt-6 w-full" size="lg">
              Lihat Status Pesanan
            </Button>
          </Link>
          <Link
            href="/"
            className="mt-3 block text-sm text-slate-500 hover:text-slate-800"
          >
            Kembali belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="rounded-2xl border bg-white p-6 text-center">
        <h1 className="text-xl font-bold">Scan untuk Membayar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pakai aplikasi e-wallet / m-banking apa pun (QRIS)
        </p>

        <div className="mx-auto mt-6 w-fit rounded-xl border-2 border-dashed border-indigo-200 bg-white p-4">
          <QRCodeSVG value={qrPayload} size={200} level="M" />
        </div>

        <p className="mt-5 text-sm text-slate-500">Total Pembayaran</p>
        <p className="text-3xl font-bold text-indigo-600">
          {formatRupiah(order.total)}
        </p>
        <p className="mt-1 font-mono text-xs text-slate-400">
          {order.order_number}
        </p>

        <div className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          {paying ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Memproses
              pembayaran...
            </span>
          ) : (
            <>Pembayaran akan otomatis terkonfirmasi dalam {countdown} detik (simulasi)</>
          )}
        </div>

        <Button
          className="mt-4 w-full"
          size="lg"
          onClick={pay}
          disabled={paying}
        >
          {paying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Saya Sudah Bayar
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
