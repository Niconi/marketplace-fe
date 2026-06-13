"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-white transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-slate-100">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300 text-4xl font-bold">
              {product.name.charAt(0)}
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        {product.category && (
          <Badge variant="secondary" className="mb-2 w-fit text-xs">
            {product.category.name}
          </Badge>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex-1" />
        <p className="text-lg font-bold text-slate-900">
          {formatRupiah(product.price)}
        </p>
        <p className="mb-3 text-xs text-slate-400">Stok: {product.stock}</p>
        <Button
          size="sm"
          className="w-full"
          disabled={outOfStock}
          onClick={() => {
            addItem(product);
            toast.success(`${product.name} ditambahkan ke keranjang`);
          }}
        >
          <ShoppingCart className="h-4 w-4" />
          {outOfStock ? "Stok Habis" : "Tambah"}
        </Button>
      </div>
    </div>
  );
}
