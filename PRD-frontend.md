# PRD Setup — Frontend (`/frontend`)

> Technical Test Azatech — Medior Fullstack Developer · Track A
> Dokumen ini fokus pada **instalasi, scaffolding, dan konfigurasi fondasi** service frontend, ditulis agar bisa **dipelajari untuk sesi review interview** (setiap folder/file dijelaskan fungsi dan alasannya).
> Stack: **Node.js 24 · Next.js (App Router) · React 19 · TypeScript strict · Tailwind CSS · shadcn/ui · TanStack Query · React Hook Form + Zod · Docker**

---

## 0. Analisis Soal Technical Test (ringkasan untuk interview)

### 0.1 Apa yang sebenarnya dinilai
| Aspek | Bobot | Relevansi ke Frontend |
|---|---|---|
| Fungsionalitas & logika | 30% | Total order & stok **dihitung server**; FE hanya pratinjau. Error server (409/422) harus tampil di baris item yang bermasalah |
| Kualitas kode | 20% | Separation of concerns: `components` (UI) ↔ `hooks` (data) ↔ `lib/api` (HTTP) ↔ `schemas` (validasi) |
| Desain API & DB | 15% | FE mengikuti envelope `{success,message,data,meta,errors}` |
| Testing | 15% | Backend utama; FE test = bonus |
| **Frontend & UX** | **10%** | Alur pengguna, validasi, **loading / empty / error state**, responsive |
| Dokumentasi & Git | 10% | README bisa diikuti, **commit bertahap** (Conventional Commits) |

### 0.2 Requirement frontend (§4.2 soal) → di mana dikerjakan
| # | Requirement soal | Lokasi implementasi |
|---|---|---|
| 1 | Login + proteksi route (redirect jika belum login/token expired) | `app/(auth)/login`, `components/layout/auth-guard.tsx`, `lib/api/client.ts` |
| 2 | Produk & Pelanggan: tabel + pagination + search, form + validasi, konfirmasi hapus | `app/(app)/products`, `customers`, `components/shared/*`, `lib/schemas/*` |
| 3 | Buat Order: baris produk dinamis, subtotal/total otomatis, error server per item | `app/(app)/orders/new`, `components/orders/order-form.tsx` (`useFieldArray`) |
| 4 | Riwayat order + filter tanggal + detail | `app/(app)/orders`, `orders/[id]` |
| 5 | Dashboard: kartu ringkasan, produk terlaris, stok menipis | `app/(app)/dashboard`, `components/dashboard/*` |
| 6 | Responsive + state loading/empty/error | `components/shared/{table-skeleton,empty-state,error-state}`, sidebar→`Sheet` |
| 7 | Format Rupiah (`Rp 12.000`) & tanggal Indonesia | `lib/format.ts` |

### 0.3 Aturan keras dari soal (jangan dilanggar)
- Backend & frontend **dua service terpisah**. Next.js API Routes / Server Actions **dilarang** jadi backend → **tidak ada folder `src/app/api/`**.
- Harga/total **tidak dikirim client** (`POST /orders` hanya `customer_id` + `items[{product_id, quantity}]`).
- `.env` tidak boleh ter-commit; sediakan `.env.example`.
- AI boleh dipakai, tapi **semua kode harus bisa dijelaskan** di sesi review → bagian §12 berisi bahan belajar.
- README wajib jujur soal fitur yang belum selesai + bagian "AI Usage".

---

## 1. Analisis: Implikasi Dua Folder Terpisah untuk Frontend

| Aspek | Implikasi |
|---|---|
| Backend terpisah | Next.js **hanya** sebagai UI. **Dilarang** memakai API Routes (`app/api/*`) dan Server Actions untuk logika bisnis/data. Semua data lewat HTTP ke `backend`. |
| Dependency | `frontend/package.json` & lockfile sendiri; tidak ada workspace. |
| Type | Tidak mengimpor type dari backend. Type dibuat manual di `src/types/` (opsional: generate dari `docs/openapi.json` dengan `openapi-typescript`). |
| Base URL | `NEXT_PUBLIC_API_URL` **dibaca browser**, jadi harus `http://localhost:4000/api` (bukan hostname internal Docker `backend`). Variabel `NEXT_PUBLIC_*` **di-inline saat build** → di Docker harus dikirim sebagai **build arg**. |
| Auth | Karena beda origin, token dikirim lewat header `Authorization: Bearer`. Route guard dilakukan di **client** (bukan `middleware.ts`) karena token tidak berada di cookie. |
| CORS | Diatur di backend (`FRONTEND_URL`); FE cukup memakai `fetch` biasa dengan header. |
| Rendering | Semua halaman terproteksi memakai **Client Components** + TanStack Query. Halaman login boleh Server Component yang membungkus form client. |

---

## 2. Prasyarat

| Tool | Versi | Cek |
|---|---|---|
| Node.js | 24 LTS | `node -v` |
| pnpm | terbaru (Corepack) | `corepack enable && pnpm -v` |
| Backend berjalan | `http://localhost:4000/api` | `curl localhost:4000/api/health` |

---

## 3. Langkah Instalasi (urut, bisa di-copy)

> Struktur repo: `azatech/backend` dan `azatech/frontend` bersisian. Karena folder `frontend/` sudah ada (berisi dokumen ini), scaffold dilakukan **di dalam folder tersebut** (`.`), bukan membuat folder baru.

### 3.1 Scaffold Next.js
```bash
cd frontend
pnpm create next-app@latest . \
  --ts --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-pnpm --yes
```
Pastikan hasil: App Router, `src/` directory, TypeScript, Tailwind. Hapus konten contoh di `src/app/page.tsx` dan `globals.css` yang tidak dipakai.

### 3.2 Dependency runtime
```bash
pnpm add @tanstack/react-query react-hook-form zod @hookform/resolvers \
         date-fns lucide-react clsx tailwind-merge sonner
```
| Paket | Kegunaan | Pertanyaan interview yang mungkin |
|---|---|---|
| `@tanstack/react-query` | Data fetching, cache, loading/error state, invalidasi setelah mutasi | Kenapa tidak `useEffect+fetch`? (cache, dedupe, retry, invalidation) |
| `react-hook-form` + `zod` + `@hookform/resolvers` | Form & validasi sisi client | Kenapa RHF? (uncontrolled → sedikit re-render; `useFieldArray` untuk baris dinamis) |
| `date-fns` | Format tanggal Indonesia (`locale/id`) | — |
| `sonner` | Toast sukses/gagal | — |
| `lucide-react` | Ikon | — |
| `clsx` + `tailwind-merge` | Helper `cn()` untuk merge class Tailwind | Kenapa perlu `tailwind-merge`? (konflik `p-2` vs `p-4`) |

### 3.3 Dependency opsional / bonus
```bash
pnpm add recharts                                  # grafik penjualan harian (bonus)
pnpm add -D vitest @vitejs/plugin-react jsdom \
            @testing-library/react @testing-library/jest-dom \
            @testing-library/user-event            # test FE (bonus)
pnpm add -D @playwright/test                       # E2E (bonus)
```

### 3.4 shadcn/ui
```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label card table dialog alert-dialog \
  dropdown-menu select popover command calendar badge skeleton sheet form \
  separator sonner pagination
```
Komponen berada di `src/components/ui/` (milik repo, bukan node_modules → dapat diedit). shadcn **bukan library**, melainkan generator yang menyalin source komponen (berbasis Radix UI + Tailwind) ke repo kita.

---

## 4. Struktur Folder `frontend/` + Penjelasan

### 4.1 Pohon folder
```
frontend/
├── src/
│   ├── app/                            # ROUTING (App Router: folder = URL)
│   │   ├── layout.tsx                  # root layout: <html lang="id">, font, <Providers>, <Toaster>
│   │   ├── page.tsx                    # "/" → redirect ke /dashboard
│   │   ├── globals.css                 # Tailwind + CSS variable tema shadcn
│   │   ├── (auth)/                     # route group (tidak muncul di URL)
│   │   │   └── login/page.tsx          # /login
│   │   └── (app)/                      # route group halaman terproteksi
│   │       ├── layout.tsx              # <AuthGuard> + Sidebar/Topbar
│   │       ├── dashboard/page.tsx      # /dashboard
│   │       ├── products/page.tsx       # /products
│   │       ├── customers/page.tsx      # /customers
│   │       └── orders/
│   │           ├── page.tsx            # /orders (riwayat)
│   │           ├── new/page.tsx        # /orders/new (buat order)
│   │           └── [id]/page.tsx       # /orders/:id (detail)
│   ├── components/
│   │   ├── ui/                         # primitif shadcn (button, input, dialog, ...)
│   │   ├── layout/                     # sidebar, topbar, mobile-nav, auth-guard
│   │   ├── shared/                     # data-table, pagination, search-input, confirm-dialog,
│   │   │                               # empty-state, error-state, table-skeleton, page-header
│   │   ├── products/                   # product-form, product-table
│   │   ├── customers/                  # customer-form, customer-table
│   │   ├── orders/                     # order-form, order-item-row, order-table, order-filters
│   │   └── dashboard/                  # stat-card, top-products, low-stock-alert, sales-chart
│   ├── hooks/                          # use-products, use-customers, use-orders, use-dashboard, use-debounce
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts               # fetch wrapper + refresh interceptor
│   │   │   ├── errors.ts               # ApiError (status, message, errors)
│   │   │   └── endpoints.ts            # fungsi per resource
│   │   ├── auth/
│   │   │   ├── token-store.ts          # get/set/clear token
│   │   │   └── auth-context.tsx
│   │   ├── format.ts                   # formatRupiah, formatTanggal
│   │   ├── query-client.ts
│   │   ├── schemas/                    # zod: product, customer, order, login
│   │   └── utils.ts                    # cn()
│   └── types/                          # api.ts (envelope, meta), product.ts, customer.ts, order.ts
├── public/                             # aset statis
├── .env.example
├── .dockerignore
├── Dockerfile
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── components.json                     # konfigurasi shadcn
└── package.json
```

### 4.2 Peran tiap folder (untuk dipelajari)
| Folder | Peran | Aturan / alasan desain |
|---|---|---|
| `app/` | Hanya **routing & komposisi halaman**. `page.tsx` tipis: merakit komponen + hook | Logika tidak ditaruh di sini agar halaman mudah dibaca |
| `app/(auth)` & `app/(app)` | **Route group**: mengelompokkan route dengan layout berbeda tanpa mengubah URL | `(app)/layout.tsx` memasang `AuthGuard` sekali untuk semua halaman terproteksi |
| `components/ui` | Primitif generik dari shadcn | Jangan isi logika bisnis |
| `components/layout` | Kerangka aplikasi (sidebar, topbar, guard) | `auth-guard` = pengganti middleware |
| `components/shared` | Komponen lintas-fitur (tabel, pagination, state kosong/error) | Kunci kriteria "loading/empty/error state" |
| `components/<fitur>` | Komponen spesifik domain (products, customers, orders, dashboard) | Fitur dikelompokkan per domain, bukan per jenis file |
| `hooks/` | Pembungkus TanStack Query (`useProducts`, `useCreateOrder`, ...) | Komponen tidak memanggil `fetch` langsung → mudah di-test & diganti |
| `lib/api/` | **Satu-satunya** tempat HTTP terjadi | `client.ts` (auth+refresh+envelope), `errors.ts`, `endpoints.ts` |
| `lib/auth/` | Penyimpanan token & konteks user | Dipisah dari api client agar tidak circular |
| `lib/schemas/` | Skema Zod untuk form | Cermin validasi backend; tipe form diturunkan via `z.infer` |
| `lib/format.ts` | Format Rupiah & tanggal ID | Satu sumber kebenaran format |
| `types/` | Tipe TypeScript response API | Dibuat manual (tidak impor dari backend) |

### 4.3 Alur data (satu arah)
```
page.tsx → component → hook (TanStack Query) → lib/api/endpoints → lib/api/client → Backend REST
                ↑                                                       │
                └──── ApiError / data (envelope sudah di-parse) ◄───────┘
```

### 4.4 File konfigurasi
| File | Fungsi |
|---|---|
| `next.config.ts` | `output: "standalone"` → image Docker kecil |
| `tsconfig.json` | `strict`, alias `@/* → src/*` |
| `eslint.config.mjs` | Aturan lint (flat config) |
| `components.json` | Pengaturan shadcn (alias, style, lokasi `ui`) |
| `.env.example` | Template env (tanpa secret) |
| `Dockerfile`, `.dockerignore` | Build image produksi multi-stage |

---

## 5. Konfigurasi Inti

### 5.1 `next.config.ts`
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",   // image Docker kecil
  reactStrictMode: true,
};
export default nextConfig;
```

### 5.2 `.env.example`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
Tidak ada secret di frontend — semua variabel `NEXT_PUBLIC_*` terlihat oleh browser.

### 5.3 `tsconfig.json`
Pastikan `"strict": true` dan `"paths": { "@/*": ["./src/*"] }`. Tambahkan `"noUncheckedIndexedAccess": true` bila memungkinkan.

### 5.4 Providers (`src/app/layout.tsx` → `components/providers.tsx`)
`QueryClientProvider` (default `staleTime: 30_000`, `retry: 1`, tidak retry pada 401/422) + `AuthProvider` + `<Toaster />`. Atur `<html lang="id">`.

### 5.5 API client (`lib/api/client.ts`)
Perilaku yang wajib:
1. Base URL dari `process.env.NEXT_PUBLIC_API_URL`.
2. Menyisipkan `Authorization: Bearer <access_token>` bila ada.
3. Mem-parse envelope backend; jika `success: false` → lempar `ApiError { status, message, errors }`.
4. **Refresh otomatis**: saat `401` (selain endpoint login/refresh), panggil `POST /auth/refresh` **sekali** (gunakan satu promise bersama agar request paralel tidak memicu refresh berkali-kali), ulangi request asli; jika refresh gagal → `clearTokens()` dan arahkan ke `/login`.
5. Mendukung respons `204` tanpa body.

### 5.6 Penyimpanan token (`lib/auth/token-store.ts`)
- Access token: variabel modul (memori) + cadangan `localStorage` agar bertahan saat reload.
- Refresh token: `localStorage`.
- Keterbatasan (rentan XSS) **dicatat di README**; alternatif perbaikan: cookie httpOnly dari backend.

### 5.7 `AuthGuard` (`components/layout/auth-guard.tsx`)
Client component di `(app)/layout.tsx`: saat mount cek token → panggil `GET /auth/me` (via TanStack Query). Selama loading tampilkan skeleton layar penuh; jika 401 tanpa token valid → `router.replace('/login')`. Halaman login mengarahkan balik ke `/dashboard` bila sudah login.

### 5.8 Format (`lib/format.ts`)
```ts
export const formatRupiah = (v: number | string) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
    .format(Number(v)).replace(/ /g, " ");           // "Rp 12.000"

import { format } from "date-fns";
import { id } from "date-fns/locale";
export const formatTanggal = (d: string | Date) => format(new Date(d), "d MMM yyyy", { locale: id });
export const formatTanggalWaktu = (d: string | Date) => format(new Date(d), "d MMMM yyyy, HH.mm", { locale: id });
```
> Nilai uang dari backend berupa string desimal → konversi dengan `Number()` hanya untuk tampilan; jangan dipakai untuk perhitungan final.

### 5.9 Pemetaan error server → form
Helper `applyServerErrors(error, setError)`: untuk `errors` berkey `"field"` memanggil `setError("field", ...)`; untuk key `"items.1.quantity"` memetakan ke `items.1.quantity` pada React Hook Form (`useFieldArray`) sehingga pesan tampil di baris item yang bermasalah.

---

## 6. Halaman & Komponen yang Dibangun Setelah Setup

| Rute | Komponen kunci | Catatan |
|---|---|---|
| `/login` | `LoginForm` | Error 401 → pesan "Email atau password salah" |
| `/dashboard` | `StatCard`, `TopProducts`, `LowStockAlert`, `SalesChart` (bonus) | 4 state: loading/empty/error/data |
| `/products` | `DataTable`, `ProductForm` (dialog), `ConfirmDialog` | Search ber-debounce 400 ms, sort via header kolom, pagination sinkron dengan query string URL |
| `/customers` | `DataTable`, `CustomerForm`, `ConfirmDialog` | Select gender Pria/Wanita, date picker tanggal lahir |
| `/orders/new` | `OrderForm`, `OrderItemRow` | `useFieldArray` untuk baris dinamis; harga diambil dari data produk hanya untuk pratinjau; total = Σ qty×harga; tombol submit disabled saat pending; 409/422 → error per baris |
| `/orders` | `OrderFilters`, `DataTable` | Filter `from`/`to`/`customer_id` tersimpan di query string; export CSV (bonus) |
| `/orders/[id]` | `OrderDetail` | Menampilkan harga snapshot, produk soft-deleted tetap tampil |

**Pola UI umum**: `PageHeader`, `TableSkeleton`, `EmptyState` (dengan CTA), `ErrorState` (dengan tombol "Coba lagi"), sidebar → drawer (`Sheet`) di layar < `md`, tabel dapat di-scroll horizontal di mobile.

---

## 7. Scripts `package.json`

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```
> Next.js versi baru menghapus `next lint`, jadi gunakan `eslint .`.

---

## 8. Docker

### 8.1 `frontend/Dockerfile`
```dockerfile
FROM node:24-slim AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:24-slim AS runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 8.2 `frontend/.dockerignore`
```
node_modules
.next
.env
.env.*
!.env.example
Dockerfile
.git
```

### 8.3 Compose
Service `frontend` didefinisikan di `docker-compose.yml` **root** (lihat `PRD-backend.md` §9.3) dengan `build.args.NEXT_PUBLIC_API_URL: http://localhost:4000/api`. Mengubah URL API berarti **rebuild** image frontend (`docker compose up -d --build frontend`).

---

## 9. Urutan Setup Lokal (tanpa Docker untuk FE)

```bash
docker compose up -d db backend      # backend + db via Docker
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev                             # http://localhost:3000
```
Login: `admin@azatech.id` / `Admin123!` (dari seeder backend).

---

## 10. Rencana Commit Setup Frontend

1. `chore(frontend): scaffold next.js app router, typescript, tailwind`
2. `chore(frontend): add shadcn/ui, tanstack query, rhf + zod, date-fns`
3. `feat(frontend): api client, token store, refresh interceptor`
4. `feat(frontend): auth context, login page, auth guard, app layout`
5. `feat(frontend): shared components (data-table, states, confirm dialog)`
6. `chore(docker): frontend dockerfile (standalone) + compose service`

(Lanjut per halaman: `feat(products)`, `feat(customers)`, `feat(orders)`, `feat(dashboard)`.)

---

## 11. Verifikasi Setup (Definition of Done — fondasi)

- [ ] `pnpm dev` berjalan di `:3000` tanpa error/warning TypeScript.
- [ ] Tidak ada folder `src/app/api/` dan tidak ada Server Action yang mengakses data.
- [ ] Halaman `/login` berhasil login ke backend, token tersimpan, redirect ke `/dashboard`.
- [ ] Akses `/dashboard` tanpa token → redirect `/login`; token expired → refresh otomatis, bila gagal → redirect `/login`.
- [ ] Dua request paralel yang sama-sama 401 hanya memicu **satu** panggilan `/auth/refresh`.
- [ ] `formatRupiah(12000)` → `Rp 12.000`; tanggal tampil dalam bahasa Indonesia.
- [ ] Layout responsive: sidebar menjadi drawer di lebar < 768 px, tidak ada scroll horizontal pada halaman.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm build` bersih.
- [ ] `docker compose up -d --build` menaikkan frontend dan dapat diakses di `http://localhost:3000`, memanggil API `localhost:4000` tanpa error CORS.
- [ ] `.env` / `.env.local` tidak ter-commit; hanya `.env.example`.

---

## 12. Bahan Belajar Interview (konsep & jawaban singkat)

### 12.1 Konsep Next.js / React
| Konsep | Penjelasan singkat |
|---|---|
| App Router | Routing berbasis folder di `app/`; `page.tsx` = halaman, `layout.tsx` = pembungkus yang persisten antar navigasi |
| Route group `(nama)` | Folder dengan tanda kurung tidak masuk URL; dipakai untuk membagi layout (auth vs app) |
| Server vs Client Component | Default server. `"use client"` diperlukan untuk hook/state/event. Di proyek ini hampir semua halaman terproteksi = client karena token ada di browser |
| `NEXT_PUBLIC_*` | Di-inline ke bundle JS saat **build**; ubah nilai ⇒ rebuild |
| `output: "standalone"` | Next menyalin hanya file yang dibutuhkan ke `.next/standalone` → image Docker kecil, jalan dengan `node server.js` |
| Dynamic route `[id]` | Segmen URL dinamis, dibaca via `useParams()` |

### 12.2 Pertanyaan yang kemungkinan muncul & arah jawaban
1. **Kenapa auth guard di client, bukan `middleware.ts`?** Token ada di `localStorage`/header (beda origin), middleware berjalan di server dan tidak bisa membacanya. Alternatif: cookie httpOnly dari backend → middleware bisa dipakai, dan lebih aman dari XSS.
2. **Risiko menyimpan token di localStorage?** Rentan XSS. Mitigasi: CSP, sanitasi, access token berumur pendek; perbaikan: refresh token di cookie httpOnly.
3. **Bagaimana mencegah refresh token dipanggil berkali-kali saat request paralel 401?** Simpan satu `refreshPromise` bersama; request lain `await` promise yang sama, lalu retry.
4. **Kenapa harga/total tidak dikirim dari client?** Client bisa dimanipulasi; server menghitung dari data produk + snapshot `unit_price`. FE hanya pratinjau.
5. **Bagaimana error stok per item ditampilkan?** Backend mengembalikan `errors: {"items.1.quantity": [...]}`; `applyServerErrors` memanggil `setError` pada path yang sama di `useFieldArray`.
6. **Kenapa TanStack Query?** Cache, dedupe request, loading/error state, retry, `invalidateQueries` setelah mutasi (daftar produk otomatis segar setelah order mengurangi stok).
7. **Kenapa shadcn/ui?** Source komponen ada di repo (bisa diubah), berbasis Radix (aksesibel), styling Tailwind; tanpa lock-in library.
8. **Kenapa uang string, bukan number?** Menghindari error floating point; backend memakai `decimal`. `Number()` hanya untuk tampil.
9. **Bagaimana sinkron filter/pagination dengan URL?** Simpan di query string (`useSearchParams`) agar bisa di-refresh/di-share dan tombol back berfungsi.
10. **Apa yang akan diperbaiki jika ada waktu lebih?** Cookie httpOnly, test FE/E2E, grafik penjualan, export CSV, CI GitHub Actions.

### 12.3 Checklist README (frontend) yang harus ada
Tech stack + alasan · setup ≤ 6 perintah + akun seeder · penjelasan alur order & stok · cara menjalankan test · asumsi & keterbatasan (token di localStorage) · **AI Usage**.
