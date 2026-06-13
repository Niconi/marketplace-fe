"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
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
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-10 text-white sm:px-10">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Belanja gampang, tanpa ribet daftar
        </h1>
        <p className="mt-2 max-w-lg text-indigo-100">
          Pilih produk, masukkan keranjang, checkout sebagai tamu, lalu bayar
          via QR. Selesai!
        </p>
      </div>

      {/* Search + sort */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput);
        }}
        className="mb-4 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari produk..."
            className="pl-9 bg-white"
          />
        </div>
        <Button type="submit">Cari</Button>
        <Select value={sort} onValueChange={(v) => setSort(v ?? "latest")}>
          <SelectTrigger className="w-full bg-white sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Terbaru</SelectItem>
            <SelectItem value="price_asc">Harga Terendah</SelectItem>
            <SelectItem value="price_desc">Harga Tertinggi</SelectItem>
            <SelectItem value="name">Nama (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </form>

      {/* Category chips */}
      <div className="mb-6 flex flex-wrap gap-2">
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
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
      }`}
    >
      {label}
    </button>
  );
}
