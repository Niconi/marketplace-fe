"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  LogOut,
  Loader2,
  Store,
} from "lucide-react";
import { api, clearToken, getToken } from "@/lib/api";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/categories", label: "Kategori", icon: Tags },
  { href: "/admin/orders", label: "Pesanan", icon: ShoppingBag },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [checking, setChecking] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    api("/admin/me", { auth: true })
      .then(() => setChecking(false))
      .catch(() => {
        clearToken();
        router.replace("/admin/login");
      });
  }, [isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <div className="py-10">{children}</div>;
  }

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  async function logout() {
    try {
      await api("/admin/logout", { method: "POST", auth: true });
    } catch {
      // ignore
    }
    clearToken();
    router.replace("/admin/login");
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-20 rounded-xl border bg-white p-3">
          <div className="mb-3 flex items-center gap-2 px-2 py-1 font-bold">
            <Store className="h-5 w-5 text-indigo-600" />
            Admin Panel
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 border-t pt-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" /> Keluar
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="flex-1">
        <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 border"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="whitespace-nowrap rounded-md border bg-white px-3 py-1.5 text-sm font-medium text-red-600"
          >
            Keluar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
