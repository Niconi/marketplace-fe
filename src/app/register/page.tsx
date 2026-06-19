"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await register(form);
      toast.success("Registrasi berhasil!");
      router.push("/");
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.errors) setErrors(apiErr.errors);
      toast.error(apiErr.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border bg-card p-8">
        <h1 className="mb-2 text-2xl font-bold">Buat Akun</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Daftar untuk pengalaman belanja yang lebih baik
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Lengkap</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Nama kamu"
              className="h-12 px-4"
              required
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@contoh.com"
              className="h-12 px-4"
              required
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>No. Telepon</Label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="h-12 px-4"
              required
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Minimal 8 karakter"
              className="h-12 px-4"
              required
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Konfirmasi Password</Label>
            <Input
              type="password"
              value={form.password_confirmation}
              onChange={(e) => update("password_confirmation", e.target.value)}
              placeholder="Ulangi password"
              className="h-12 px-4"
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Daftar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
