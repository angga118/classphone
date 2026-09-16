# GadgetHub (ClassPhone)

Aplikasi web marketplace jual-beli HP bekas, dibangun dengan **Next.js (App Router)**, **Prisma** (SQLite), dan **NextAuth**. Pengguna bisa mengajukan HP untuk dijual, admin melakukan review & penilaian harga, lalu listing yang disetujui dikonversi menjadi produk yang dijual di katalog publik.

## ✨ Fitur Utama

### Untuk Pengguna (User)
- Registrasi & login (NextAuth, credentials)
- Jual HP: ajukan listing (merek, model, storage, kondisi, kelengkapan, foto, deskripsi, harga yang diinginkan)
- Dashboard untuk memantau status listing: `PENDING_REVIEW` → `APPROVED` / `REJECTED` → `DEAL` → `COMPLETED`
- Chat WhatsApp otomatis (template pesan) ke admin untuk tindak lanjut jual/beli
- Notifikasi in-app (listing disetujui, ditolak, deal, dll.)
- Pengaturan profil, ubah password, dan preferensi notifikasi

### Untuk Publik (tanpa login)
- Melihat katalog produk (HP yang tersedia untuk dibeli)
- Detail produk (kondisi, harga, foto, storage)

### Untuk Admin
- Dashboard statistik
- Kelola "Listing Masuk": review, setujui/tolak, catat harga deal, beri catatan admin
- Konversi listing yang sudah deal menjadi produk di katalog
- Kelola produk (tambah manual, ubah status stok: `AVAILABLE`, `BOOKED`, `SOLD`, `DRAFT`)
- Kelola pengguna (blokir/aktifkan akun)
- Pengaturan sistem: nomor WhatsApp admin & template pesan jual/beli

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Bahasa | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Autentikasi | NextAuth v5 (beta) + Prisma Adapter |
| Database | SQLite (via Prisma 7 + `better-sqlite3`) |
| ORM | Prisma |
| Validasi | Zod |
| Ikon | lucide-react |
| Hashing password | bcryptjs |
| Linting | ESLint |

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── (public)/         # Beranda & katalog produk (dapat diakses publik)
│   ├── (auth)/            # Halaman login & register
│   ├── (user)/            # Dashboard user, jual HP, pengaturan
│   ├── admin/             # Login & dashboard admin (listing masuk, produk, users, pengaturan)
│   └── api/               # Route handlers (auth, listings, products, transactions, notifications, dll.)
├── components/            # Komponen UI
├── lib/                   # Auth config, koneksi DB, guards, notifikasi, WhatsApp helper, validator
└── generated/prisma/      # Prisma Client hasil generate (auto-generated)
prisma/
├── schema.prisma          # Skema database
├── migrations/            # Riwayat migrasi
└── seed.ts                # Data awal (seed)
```

## 🗄️ Model Data (ringkas)

- **User** — akun pengguna/admin (role `USER`/`ADMIN`)
- **Listing** — pengajuan jual HP dari user, berstatus `PENDING_REVIEW` → `APPROVED`/`REJECTED` → `DEAL` → `COMPLETED`
- **Product** — HP yang dijual di katalog (bisa berasal dari listing yang dikonversi, atau input admin)
- **Transaction** — catatan transaksi jual/beli
- **Notification** — notifikasi in-app untuk user
- **Settings** — nomor WhatsApp admin & template pesan

## 🚀 Menjalankan Secara Lokal

### 1. Clone repository
```bash
git clone https://github.com/angga118/classphone.git
cd classphone
```

### 2. Install dependencies
```bash
npm install
```

### 3. Konfigurasi environment
Salin `.env.example` menjadi `.env`, lalu sesuaikan:
```bash
cp .env.example .env
```
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<generate string acak minimal 32 karakter>"
AUTH_TRUST_HOST=true
```
Generate `AUTH_SECRET` dengan cepat via:
```bash
npx auth secret
```

### 4. Setup database (migrasi + seed)
```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Jalankan development server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🔑 Akun Default (hasil seed)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gadgethub.test` | `admin123` |
| User | `user@gadgethub.test` | `user123` |

> ⚠️ Ganti kredensial ini sebelum digunakan di lingkungan produksi.

## 📜 Script yang Tersedia

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan server development |
| `npm run build` | Build aplikasi untuk production |
| `npm run start` | Menjalankan aplikasi hasil build |
| `npm run lint` | Menjalankan ESLint |

## 📄 Lisensi

Belum ditentukan. Tambahkan file `LICENSE` jika ingin menetapkan lisensi tertentu untuk proyek ini.
