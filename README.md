# Tokoku — Frontend (Next.js)

Antarmuka marketplace sederhana: katalog produk, keranjang, guest checkout,
pembayaran QR (simulasi), lacak pesanan, dan admin panel. Terhubung ke API
Laravel di repo `marketplace-be`.

## Teknologi
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- qrcode.react (QR pembayaran)

## Setup

```bash
npm install
```

Buat `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

Jalankan (port 3100, sudah diatur di `package.json`):

```bash
npm run dev
```

Buka http://localhost:3100. Pastikan backend (`marketplace-be`) jalan di port 8080.

## Halaman

### Pembeli (guest)
| Route | Fungsi |
|-------|--------|
| `/` | Katalog: search, filter kategori, sort |
| `/products/[slug]` | Detail produk + tambah ke keranjang |
| `/cart` | Keranjang belanja |
| `/checkout` | Form data penerima (guest) |
| `/payment/[orderNumber]` | QR pembayaran + simulasi auto-lunas |
| `/orders/track` | Cari pesanan via nomor |
| `/orders/[orderNumber]` | Status & detail pesanan |

### Admin
| Route | Fungsi |
|-------|--------|
| `/admin/login` | Login admin |
| `/admin` | Dashboard statistik |
| `/admin/products` | CRUD produk + upload gambar |
| `/admin/categories` | CRUD kategori |
| `/admin/orders` | Lihat & ubah status pesanan |

Login admin demo: `admin@marketplace.test` / `password`.

## Alur Pengguna
1. Buka katalog → cari/filter produk.
2. Tambah produk ke keranjang (disimpan di `localStorage`).
3. Checkout sebagai tamu (isi nama, email, telp, alamat).
4. Sistem buat pesanan & arahkan ke halaman QR.
5. Scan QR / klik "Saya Sudah Bayar" → pembayaran terkonfirmasi (simulasi).
6. Lacak status kapan saja via nomor pesanan.
