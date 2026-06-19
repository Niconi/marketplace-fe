"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ShoppingCart,
  Store,
  PackageSearch,
  Sun,
  Moon,
  User,
  LogOut,
  Package,
  LogIn,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { count } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith("/admin");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { logout } = useAuth();

  const navLinkClass =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400";

  function toggleTheme(e: React.MouseEvent<HTMLButtonElement>) {
    const button = e.currentTarget;
    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        { clipPath },
        {
          duration: 400,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-xl">
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

        <nav className="flex items-center gap-1 sm:gap-2">
          {mounted && (
            <button
              onClick={toggleTheme}
              className={navLinkClass}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}

          {!isAdmin && (
            <>
              <Link href="/orders/track" className={navLinkClass}>
                <PackageSearch className="h-4 w-4" />
              </Link>

              <Link
                href="/cart"
                className={`relative ${navLinkClass}`}
              >
                <ShoppingCart className="h-4 w-4" />
                {count > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full px-1 bg-indigo-600 ring-2 ring-background">
                    {count}
                  </Badge>
                )}
              </Link>

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className={navLinkClass}
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border bg-card p-1 shadow-lg">
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        Pesanan Saya
                      </Link>
                      <button
                        onClick={async () => {
                          setMenuOpen(false);
                          await logout();
                          router.push("/");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4" />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className={navLinkClass}>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Masuk</span>
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
