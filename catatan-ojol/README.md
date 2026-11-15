# Catatan Ojol

PWA pembukuan harian untuk driver ojek online. Mencatat pemasukan dan pengeluaran, menghitung laba bersih,
dan tetap jalan tanpa sinyal. Data disimpan di HP (localStorage), tanpa server dan tanpa akun.

Teknologi: HTML + JavaScript ES modules (tanpa framework) + Tailwind CSS.

## Menjalankan

PWA dan ES modules harus dibuka lewat server (bukan klik dua kali berkas `index.html`).

```bash
npm run dev          # = npx serve . -l 5173  ->  http://localhost:5173
```

Atau server statis apa saja, misalnya `python3 -m http.server 5173`.

Service worker hanya aktif di `localhost` atau HTTPS. Untuk mencoba di HP, hosting statis gratis
(Netlify, Vercel, Cloudflare Pages, GitHub Pages) sudah cukup.

## Struktur

```
index.html               cangkang halaman, memuat Tailwind dan js/app.js
manifest.webmanifest     nama, ikon, dan shortcut saat dipasang
sw.js                    service worker (precache + offline)
tailwind.config.js       warna dan font; dipakai CDN maupun CLI
css/app.css              token tema terang/gelap + beberapa gaya kecil
src/input.css            sumber untuk build Tailwind produksi
icons/                   ikon PWA (svg + png)
js/
  app.js                 titik masuk: router, render, tema, PWA
  router.js              router berbasis hash (#/riwayat)
  store.js               satu-satunya pintu ke data (localStorage)
  utils.js               format Rupiah dan tanggal, ringkasan transaksi
  pwa.js                 service worker, tombol "Pasang aplikasi"
  ekspor.js              ekspor CSV dan unduh berkas
  components/            nav, header, bottom sheet, toast, baris transaksi, ikon
  pages/                 home, add, history, report, settings
```

## Kontrak sebuah halaman

Setiap berkas di `js/pages/` mengekspor objek:

```js
export default {
  judul: 'Riwayat',          // untuk document.title
  nav: 'riwayat',            // id menu aktif; false = sembunyikan bottom nav
  reaktif: true,             // opsional; false = jangan render ulang saat data berubah
  render(ctx) { return '<html string>'; },
  mount(root, ctx) { /* pasang event */ return () => { /* bersihkan */ }; },
};
```

Menambah halaman: buat berkas di `js/pages/`, daftarkan rutenya di `HALAMAN` pada `js/app.js`,
tambahkan item di `js/components/nav.js` bila perlu muncul di menu, dan tambahkan berkasnya ke
`PRECACHE` di `sw.js`.

## Tailwind: dua mode

**Development (default).** `index.html` memakai Play CDN, jadi tidak perlu build. Cukup untuk mencoba.

**Produksi (disarankan untuk dipakai sungguhan).** CDN butuh internet saat pertama kali dibuka dan
tidak ditujukan untuk produksi. Bangun CSS statis supaya ringan dan bisa dipakai offline sepenuhnya:

```bash
npm install
npm run css:build
```

Lalu di `index.html` hapus dua baris `<script>` Tailwind CDN dan `tailwind.config.js`, dan aktifkan
`<link rel="stylesheet" href="css/tailwind.css">`. Tambahkan `./css/tailwind.css` ke `PRECACHE`
di `sw.js` dan naikkan `VERSI`.

## Tema

Warna didefinisikan sebagai CSS variable di `css/app.css` (`:root` dan `[data-theme='dark']`) lalu
dipetakan ke Tailwind di `tailwind.config.js` (`bg-brand`, `text-expense`, `bg-surface`, dan seterusnya).
Mengganti warna merek cukup mengubah variabel `--brand`. Mode gelap tidak butuh class `dark:`.

## Data

Bentuk transaksi:

```js
{ id, tipe: 'masuk' | 'keluar', nominal, kategori, aplikasi, catatan, waktu /* ISO UTC */ }
```

Semua akses lewat `js/store.js`. Untuk pindah ke IndexedDB atau backend (Supabase, Firebase),
ganti isi berkas itu saja; halaman tidak perlu diubah.

Cadangan: Pengaturan > Cadangkan data (JSON) dan Pulihkan. Ekspor Excel: Pengaturan > Ekspor ke Excel (CSV).

## Catatan

- localStorage bisa terhapus bila pengguna membersihkan data browser. Ingatkan driver untuk rutin mencadangkan.
- Setiap mengubah berkas aplikasi, naikkan `VERSI` di `sw.js` agar pengguna mendapat versi baru.
- Aplikasi ojol yang dipakai dan kategori bisa diubah dari Pengaturan.
