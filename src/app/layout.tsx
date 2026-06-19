import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  title: "Tokoku",
  description: "Belanja mudah, checkout cepat tanpa perlu daftar akun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col selection:bg-indigo-600/15 selection:text-indigo-700"
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t bg-card">
              <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
                <span>
                  © {new Date().getFullYear()} Tokoku. All rights reserved.
                </span>
              </div>
            </footer>
            <Toaster richColors position="top-center" />
          </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
