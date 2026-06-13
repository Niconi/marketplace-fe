"use client";

import Link from "next/link";
import { ShoppingCart, Store, PackageSearch } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Store className="h-6 w-6 text-indigo-600" />
          <span>Tokoku</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/orders/track"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <PackageSearch className="h-4 w-4" />
            <span className="hidden sm:inline">Lacak Pesanan</span>
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Keranjang</span>
            {count > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full px-1 bg-indigo-600">
                {count}
              </Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
