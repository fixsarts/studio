# Fixs.Arts Studio — Website

Website studio desain kreatif: katalog layanan, portfolio, keranjang, checkout via WhatsApp, dan panel admin — dibangun murni dengan **HTML5, CSS3, dan Vanilla JavaScript** (tanpa framework, tanpa backend).

## 1. Struktur Proyek

```
/
├── index.html            Homepage
├── services.html         Katalog layanan (search + filter + sort)
├── service-detail.html   Detail layanan (?id=...)
├── portfolio.html        Katalog portfolio (search + filter)
├── project-detail.html   Detail proyek portfolio (?id=...)
├── cart.html             Keranjang belanja
├── checkout.html         Checkout + generator pesan WhatsApp
├── about.html            Halaman tentang studio
├── admin.html            Panel admin (content manager lokal)
│
├── css/
│   ├── style.css         Design system inti (warna, tipografi, komponen)
│   ├── responsive.css    Breakpoint tablet/desktop/large desktop
│   └── admin.css         Layout dashboard admin
│
├── js/
│   ├── data.js           Seed data default (services, portfolio, settings)
│   ├── storage.js        StorageManager — satu-satunya modul yang sentuh localStorage
│   ├── utils.js          Helper: format Rupiah, toast, modal konfirmasi, dll
│   ├── search.js         Logic filter & sort (murni, tanpa DOM)
│   ├── cart.js           Core API keranjang + render cart.html
│   ├── app.js            Navbar, drawer mobile, badge keranjang, footer (semua halaman)
│   ├── catalog.js        Logic services.html
│   ├── service-detail.js Logic service-detail.html
│   ├── portfolio.js      Logic portfolio.html
│   ├── project-detail.js Logic project-detail.html
│   ├── checkout.js       Logic checkout.html + generator WhatsApp
│   └── admin.js          Seluruh logic admin.html (CRUD, settings, export/import)
│
└── assets/
    ├── images/           Gambar layanan (placeholder bergradasi biru-ungu, ganti dengan gambar asli)
    ├── portfolio/        Gambar proyek portfolio
    └── icons/            (kosong, siapkan ikon custom di sini bila perlu)
```

## 2. Cara Menjalankan

Karena situs ini murni statis (tanpa server), cukup buka `index.html` langsung di browser, **atau** — lebih disarankan — jalankan local server sederhana agar semua fitur (termasuk fetch relative path) berjalan mulus:

```bash
# Python 3
python3 -m http.server 8000

# lalu buka http://localhost:8000
```

## 3. Bagaimana Data Bekerja (Penting)

Semua konten (layanan, portfolio, pengaturan brand) disimpan di **localStorage browser**, bukan di database/server. Artinya:

- Data hanya tersimpan di browser tempat kamu membuka & mengedit lewat `admin.html`.
- Kalau kamu buka website ini di device/browser lain, datanya akan kembali ke data contoh bawaan (`js/data.js`), karena localStorage tidak dibagikan antar-device.
- Ini **bukan** sistem multi-user. Cocok untuk kebutuhan: satu admin, satu browser, portofolio pribadi/kecil.

Alur datanya:

```
js/data.js (seed default)
        ↓
js/storage.js — StorageManager (baca/tulis localStorage)
        ↓
Halaman publik membaca lewat StorageManager.loadServices() / loadPortfolio() / loadSettings()
        ↓
admin.html menulis lewat StorageManager.saveServices() / savePortfolio() / saveSettings()
```

## 4. Cara Menambah / Mengedit Layanan

1. Buka `admin.html`.
2. Klik **Services** di sidebar.
3. Klik **+ Tambah Layanan** (atau **Edit** pada layanan yang sudah ada).
4. Isi judul, kategori, deskripsi, harga dasar, gambar, tags.
5. Di bagian **Paket Harga**, klik **+ Tambah Paket** untuk membuat tier (misalnya Basic / Professional). Tulis fitur satu baris = satu fitur.
6. Klik **Simpan Layanan**.

Layanan langsung muncul di `services.html` karena halaman publik selalu membaca ulang dari localStorage — tidak perlu edit HTML sama sekali.

## 5. Cara Menambah Portfolio

Sama seperti Services: **Admin → Portfolio → + Tambah Proyek**. Isi klien, tahun, kategori, dan layanan yang digunakan (dipisah koma).

## 6. Cara Kerja Panel Admin (`admin.html`)

Panel admin adalah **single-page app sederhana**: satu file HTML, beberapa "panel" yang disembunyikan/ditampilkan lewat sidebar (Dashboard, Services, Portfolio, Homepage, Settings, Data Management). Tidak ada reload halaman saat berpindah menu.

> ⚠️ **Catatan keamanan**: `admin.html` **tidak punya sistem login/autentikasi yang aman**. Siapa pun yang membuka file ini di browser yang sama bisa mengubah data. Untuk penggunaan publik/produksi, tambahkan autentikasi sungguhan di sisi backend (lihat bagian 9).

## 7. Cara Kerja localStorage & Kunci yang Dipakai

| Key                  | Isi                                   |
|----------------------|----------------------------------------|
| `fixsarts_services`  | Array semua layanan                    |
| `fixsarts_portfolio` | Array semua proyek portfolio           |
| `fixsarts_settings`  | Objek pengaturan brand & homepage      |
| `fixsarts_cart`      | Array item keranjang milik pengunjung  |

Semua akses ke key-key ini **hanya** lewat `js/storage.js` (`StorageManager`) — tidak ada `localStorage.setItem` yang tersebar di file lain.

## 8. Export & Import Data

- **Export**: Admin → Data Management → **Export ke JSON** → file `fixsarts-data.json` terunduh, berisi seluruh services, portfolio, dan settings. Gunakan ini untuk backup atau memindahkan data ke browser/device lain.
- **Import**: Admin → Data Management → pilih file JSON hasil export. Data divalidasi dulu (field wajib `id`, `title`, dll) — file yang rusak/tidak sesuai format akan ditolak dengan pesan error, tidak akan membuat website crash.
- **Reset**: Mengembalikan semua data ke contoh bawaan di `js/data.js`. Akan meminta konfirmasi dulu.

## 9. Mengganti Gambar

Gambar yang ada sekarang adalah **placeholder bergradasi biru-ungu** bertuliskan nama layanan/proyek, dibuat otomatis sebagai pengganti sementara. Untuk mengganti dengan gambar asli:

**Cara 1 — lewat Admin (disarankan):**
Buka Admin → Services/Portfolio → Edit item → gunakan input **file gambar** untuk memilih gambar dari komputer kamu. Gambar akan disimpan sebagai data URL (base64) langsung di localStorage sebagai preview lokal.

⚠️ Ini adalah **preview lokal**, bukan upload permanen ke server — karena proyek ini murni HTML/CSS/JS tanpa backend. Data URL yang besar juga akan mempercepat localStorage penuh (biasanya batas ~5–10MB per origin). Untuk produksi sungguhan, sambungkan ke layanan penyimpanan gambar (lihat bagian berikutnya).

**Cara 2 — manual:**
Taruh file gambar di `assets/images/` atau `assets/portfolio/`, lalu isi field **Gambar Utama** di form admin dengan path relatifnya, misalnya `assets/images/logo-baru.jpg`.

## 10. Cara Kerja Checkout via WhatsApp

1. Pengunjung menambahkan layanan (dengan paket & qty) ke keranjang.
2. Di `checkout.html`, pengunjung mengisi nama, nomor WhatsApp, brief, dan catatan.
3. Saat submit, `js/checkout.js` menyusun pesan terstruktur (daftar item, harga, total, data pengunjung) lalu membuka:
   ```
   https://wa.me/{nomor_whatsapp}?text={pesan_terenkode}
   ```
4. Nomor WhatsApp diambil dari **Admin → Settings → Nomor WhatsApp** — hanya ada satu sumber, tidak di-hardcode di file JS manapun.

## 11. Menambah Kategori

Kategori bersifat **turunan otomatis** dari field `category` pada setiap layanan/portfolio — jadi kategori baru otomatis muncul di filter begitu kamu mengisi kategori baru saat menambah/mengedit layanan lewat Admin. Tidak perlu halaman "Categories" terpisah untuk mendaftarkan nama kategori terlebih dahulu.

## 12. Keterbatasan Versi Statis Saat Ini

Karena proyek ini sengaja dibuat **HTML + CSS + Vanilla JS murni** tanpa backend:

- Tidak ada database sungguhan — semua data ada di browser (localStorage).
- Tidak ada login/autentikasi aman di `admin.html`.
- Upload gambar bersifat lokal (data URL), bukan upload permanen ke server/CDN.
- Tidak ada pemrosesan pembayaran — checkout berakhir di WhatsApp, bukan transaksi online.

Semua ini **disengaja** sebagai fondasi awal. Arsitekturnya (data → storage → rendering → UI dipisah rapi) dirancang supaya mudah disambungkan ke backend sungguhan nanti.

## 13. Menyiapkan untuk Backend di Masa Depan

Karena semua baca/tulis data hanya lewat `StorageManager` (di `js/storage.js`), migrasi ke backend nyata cukup dilakukan dengan **mengganti isi fungsi-fungsi di file itu saja** — tanpa perlu menyentuh halaman publik atau admin:

```js
// Sekarang:
function loadServices(){
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.services));
}

// Nanti, misalnya dengan REST API:
async function loadServices(){
  const res = await fetch("/api/services");
  return res.json();
}
```

Backend yang cocok untuk langkah selanjutnya: REST API custom, Supabase, Firebase, atau GitHub API (untuk katalog kecil yang datanya disimpan sebagai file JSON di repo).

## 14. Ringkasan Konvensi Kode

- ID untuk service/portfolio/paket **selalu berupa string unik yang stabil** (contoh: `logo-design`), bukan judul — supaya tidak rusak kalau judul diganti.
- Setiap file JS halaman (`catalog.js`, `cart.js`, dst.) memeriksa dulu apakah elemen root halamannya ada di DOM sebelum menjalankan logic, jadi aman kalau suatu saat digabung.
- Semua teks yang tampil ke pengguna melewati `Utils.escapeHtml()` sebelum disisipkan ke HTML untuk mencegah HTML/script asing ikut ter-render.
