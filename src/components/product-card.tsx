"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";

const categoryColors: Record<string, string> = {
  elektronik: "bg-blue-50 text-blue-600",
  fashion: "bg-pink-50 text-pink-600",
  "makanan-minuman": "bg-orange-50 text-orange-600",
  "makanan": "bg-orange-50 text-orange-600",
  olahraga: "bg-emerald-50 text-emerald-600",
  "rumah-tangga": "bg-teal-50 text-teal-600",
  "rumah": "bg-teal-50 text-teal-600",
  "kesehatan-kecantikan": "bg-violet-50 text-violet-600",
  "kesehatan": "bg-violet-50 text-violet-600",
  "kecantikan": "bg-violet-50 text-violet-600",
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getCategoryColor(slug: string, name?: string): string {
  const bySlug = categoryColors[normalize(slug)];
  if (bySlug) return bySlug;
  if (name) {
    const byName = categoryColors[normalize(name)];
    if (byName) return byName;
    // partial match — e.g. "makanan" in "makanan-minuman"
    const normName = normalize(name);
    const found = Object.keys(categoryColors).find((k) => normName.includes(k) || k.includes(normName));
    if (found) return categoryColors[found];
  }
  return "bg-muted text-muted-foreground";
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/8 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:ring-white/15">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted text-5xl font-bold text-muted-foreground">
              {product.name.charAt(0)}
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
              <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">
                Stok Habis
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        {product.category && (
          <Badge
            variant="secondary"
            className={`mb-2 w-fit text-[0.7rem] ${getCategoryColor(product.category.slug, product.category.name)}`}
          >
            {product.category.name}
          </Badge>
        )}
        {product.avg_rating != null && product.reviews_count > 0 && (
          <div className="mb-1.5 flex items-center gap-1.5">
            <StarRating rating={Number(product.avg_rating)} size={13} />
            <span className="text-xs text-muted-foreground">
              ({product.reviews_count})
            </span>
          </div>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex-1" />
        <p className="text-lg font-bold tracking-tight text-foreground">
          {formatRupiah(product.price)}
        </p>
        <p className="mb-3 text-xs text-muted-foreground">Stok: {product.stock}</p>
        <button
          disabled={outOfStock}
          onClick={() => {
            addItem(product);
            toast.success(`${product.name} ditambahkan ke keranjang`);
          }}
          className="group/btn relative flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition-all duration-200 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
          <ShoppingCart className="relative h-4 w-4 transition-transform duration-300 group-hover/btn:-rotate-12 group-hover/btn:scale-110" />
          <span className="relative tracking-wide">
            {outOfStock ? "Stok Habis" : "Tambah"}
          </span>
        </button>
      </div>
    </div>
  );
}
