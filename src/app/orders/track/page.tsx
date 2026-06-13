"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border bg-white p-8 text-center">
        <PackageSearch className="mx-auto h-12 w-12 text-indigo-600" />
        <h1 className="mt-4 text-xl font-bold">Lacak Pesanan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Masukkan nomor pesanan yang kamu terima saat checkout.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (orderNumber.trim()) {
              router.push(`/orders/${orderNumber.trim()}`);
            }
          }}
          className="mt-6 space-y-3 text-left"
        >
          <Label>Nomor Pesanan</Label>
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="INV-20260614-XXXXXX"
            className="font-mono"
            required
          />
          <Button type="submit" className="w-full" size="lg">
            Cek Status
          </Button>
        </form>
      </div>
    </div>
  );
}
