"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Store, PackageSearch } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { count } = useCart();
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <Store className="h-5 w-5" />
          </span>
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Tokoku
          </span>
        </Link>

        {!isAdmin && (
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/orders/track"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            >
              <PackageSearch className="h-4 w-4" />
              {/* <span className="hidden sm:inline">Lacak Pesanan</span> */}
            </Link>

            <Link
              href="/cart"
              className="relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            >
              <ShoppingCart className="h-4 w-4" />
              {/* <span className="hidden sm:inline">Keranjang</span> */}
              {count > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full px-1 bg-indigo-600 ring-2 ring-white">
                  {count}
                </Badge>
              )}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
