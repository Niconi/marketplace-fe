"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/admin/stats", { auth: true })
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    {
      label: "Total Pesanan",
      value: stats?.total_orders,
      icon: ShoppingBag,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Sudah Dibayar",
      value: stats?.paid_orders,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Menunggu",
      value: stats?.pending_orders,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Pendapatan",
      value: stats ? formatRupiah(stats.revenue) : undefined,
      icon: Wallet,
      color: "text-violet-600 bg-violet-50",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border bg-white p-5">
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-sm text-slate-500">{c.label}</p>
              {c.value === undefined ? (
                <Skeleton className="mt-1 h-8 w-20" />
              ) : (
                <p className="mt-1 text-2xl font-bold">{c.value}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/products"
          className="rounded-xl border bg-white p-5 hover:border-indigo-300 hover:shadow-sm"
        >
          <h3 className="font-semibold">Kelola Produk</h3>
          <p className="mt-1 text-sm text-slate-500">
            Tambah, edit, dan hapus produk beserta gambarnya.
          </p>
        </Link>
        <Link
          href="/admin/categories"
          className="rounded-xl border bg-white p-5 hover:border-indigo-300 hover:shadow-sm"
        >
          <h3 className="font-semibold">Kelola Kategori</h3>
          <p className="mt-1 text-sm text-slate-500">
            Atur kategori produk toko kamu.
          </p>
        </Link>
        <Link
          href="/admin/orders"
          className="rounded-xl border bg-white p-5 hover:border-indigo-300 hover:shadow-sm"
        >
          <h3 className="font-semibold">Kelola Pesanan</h3>
          <p className="mt-1 text-sm text-slate-500">
            Lihat pesanan masuk dan perbarui statusnya.
          </p>
        </Link>
      </div>
    </div>
  );
}
