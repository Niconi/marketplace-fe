"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { api, setToken, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@marketplace.test");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api<{ token: string }>("/admin/login", {
        method: "POST",
        body: { email, password },
      });
      setToken(res.token);
      toast.success("Login berhasil");
      router.push("/admin");
    } catch (err) {
      toast.error((err as ApiError).message || "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8">
        <div className="mb-6 text-center">
          <Store className="mx-auto h-10 w-10 text-indigo-600" />
          <h1 className="mt-3 text-xl font-bold">Admin Tokoku</h1>
          <p className="text-sm text-slate-500">Masuk untuk kelola toko</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Masuk
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Demo: admin@marketplace.test / password
        </p>
      </div>
    </div>
  );
}
