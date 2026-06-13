"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Category, Product, Paginated } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FormState {
  name: string;
  category_id: string;
  price: string;
  stock: string;
  description: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  name: "",
  category_id: "",
  price: "",
  stock: "",
  description: "",
  is_active: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function load() {
    setLoading(true);
    try {
      const res = await api<Paginated<Product>>("/admin/products?per_page=50", {
        auth: true,
      });
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    api<{ data: Category[] }>("/admin/categories", { auth: true })
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setImageFile(null);
    setPreview(null);
    setErrors({});
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      category_id: p.category_id ? String(p.category_id) : "",
      price: String(p.price),
      stock: String(p.stock),
      description: p.description ?? "",
      is_active: p.is_active,
    });
    setImageFile(null);
    setPreview(p.image_url);
    setErrors({});
    setOpen(true);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setPreview(file ? URL.createObjectURL(file) : preview);
  }

  async function save() {
    setSaving(true);
    setErrors({});

    const fd = new FormData();
    fd.append("name", form.name);
    if (form.category_id) fd.append("category_id", form.category_id);
    fd.append("price", form.price || "0");
    fd.append("stock", form.stock || "0");
    fd.append("description", form.description);
    fd.append("is_active", form.is_active ? "1" : "0");
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editing) {
        // Method spoofing — PHP can't parse multipart on PUT
        fd.append("_method", "PUT");
        await api(`/admin/products/${editing.id}`, {
          method: "POST",
          auth: true,
          isFormData: true,
          body: fd,
        });
        toast.success("Produk diperbarui");
      } else {
        await api("/admin/products", {
          method: "POST",
          auth: true,
          isFormData: true,
          body: fd,
        });
        toast.success("Produk ditambahkan");
      }
      setOpen(false);
      load();
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors) setErrors(apiErr.errors);
      toast.error(apiErr.message || "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Product) {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    try {
      await api(`/admin/products/${p.id}`, { method: "DELETE", auth: true });
      toast.success("Produk dihapus");
      load();
    } catch {
      toast.error("Gagal menghapus");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produk</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tambah Produk
        </Button>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Harga</th>
                <th className="px-4 py-3 text-center">Stok</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100">
                        {p.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-300">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {p.category?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatRupiah(p.price)}
                  </td>
                  <td className="px-4 py-3 text-center">{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        p.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {p.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => remove(p)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Belum ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Produk" : "Tambah Produk"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <FormField label="Nama Produk" error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </FormField>

            <FormField label="Kategori" error={errors.category_id}>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm({ ...form, category_id: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Harga (Rp)" error={errors.price}>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </FormField>
              <FormField label="Stok" error={errors.stock}>
                <Input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Deskripsi" error={errors.description}>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </FormField>

            <FormField label="Gambar" error={errors.image}>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded border bg-slate-100">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={onFileChange} />
              </div>
            </FormField>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="h-4 w-4"
              />
              Produk aktif (tampil di katalog)
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save} disabled={saving || !form.name.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error[0]}</p>}
    </div>
  );
}
