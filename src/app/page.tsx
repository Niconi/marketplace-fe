"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ArrowRight, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { Category, Product, Paginated } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sort, setSort] = useState<string>("latest");

  const sortItems = {
    latest: "Terbaru",
    price_asc: "Harga Terendah",
    price_desc: "Harga Tertinggi",
    name: "Nama (A-Z)",
  };

  useEffect(() => {
    api<{ data: Category[] }>("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ per_page: "24", sort });
    if (search) params.set("search", search);
    if (activeCategory !== "all") params.set("category", activeCategory);
    try {
      const res = await api<Paginated<Product>>(`/products?${params}`);
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory, sort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_left,#6366f1,transparent_55%),radial-gradient(circle_at_bottom_right,#8b5cf6,transparent_50%),linear-gradient(135deg,#4f46e5,#7c3aed)] px-6 py-12 text-white shadow-xl shadow-indigo-500/25 sm:px-10 sm:py-16">
        {/* decorative glows */}
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative flex items-center justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Belanja gampang,
              <br />
              <span className="text-indigo-200">tanpa ribet daftar</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-indigo-100/90">
              Pilih produk, masukkan keranjang, checkout sebagai tamu, lalu
              bayar via QR. Selesai!
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-11 bg-white px-6 text-indigo-700 shadow-lg shadow-black/10 hover:bg-indigo-50"
                onClick={() =>
                  document
                    .getElementById("produk")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Mulai Belanja
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm text-indigo-100">
                <ShieldCheck className="h-4 w-4" />
                Pembayaran aman via QRIS
              </div>
            </div>
          </div>

          {/* floating product tiles */}
          <div className="relative hidden h-52 w-72 shrink-0 lg:block">
            <div className="absolute right-4 top-0 flex h-28 w-44 rotate-[-6deg] flex-col justify-between rounded-2xl bg-white/95 p-4 shadow-2xl shadow-black/20">
              <span className="text-3xl">🎧</span>
              <div>
                <div className="h-2 w-20 rounded bg-slate-200" />
                <div className="mt-1.5 text-sm font-bold text-indigo-600">
                  Rp 320.000
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 right-24 flex h-28 w-40 rotate-[5deg] flex-col justify-between rounded-2xl bg-white/95 p-4 shadow-2xl shadow-black/20">
              <span className="text-3xl">👟</span>
              <div>
                <div className="h-2 w-16 rounded bg-slate-200" />
                <div className="mt-1.5 text-sm font-bold text-indigo-600">
                  Rp 75.000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + sort */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
        }}
        className="mb-5 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari produk..."
            className="h-11 rounded-xl bg-white pl-10 shadow-sm"
          />
        </div>
        <Button type="submit" size="lg" className="h-11 px-6">
          <Search className="h-4 w-4" />
          Cari
        </Button>
        <Select
          items={sortItems}
          value={sort}
          onValueChange={(v) => setSort(v ?? "latest")}
        >
          <SelectTrigger className="h-11 w-full rounded-xl sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortItems).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>

      {/* Category chips */}
      <div id="produk" className="mb-6 flex scroll-mt-20 flex-wrap gap-2">
        <CategoryChip
          label="Semua"
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.name}
            active={activeCategory === c.slug}
            onClick={() => setActiveCategory(c.slug)}
          />
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          Tidak ada produk ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all active:scale-95 ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-500/30"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
      }`}
    >
      {label}
    </button>
  );
}
