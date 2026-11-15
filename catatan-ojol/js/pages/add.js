/** Catat transaksi: keypad angka besar, kategori, dan aplikasi. */
import { store } from '../store.js';
import { angka, esc, jam, tanggalPendek } from '../utils.js';
import { icon } from '../components/icons.js';
import { toast } from '../components/ui.js';

const TOMBOL = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'hapus'];

const WARNA = {
  masuk: { isi: 'border-brand bg-brand text-on-brand', teks: 'text-brand' },
  keluar: { isi: 'border-expense bg-expense text-on-expense', teks: 'text-expense' },
};

const daftarKategori = (tipe) => {
  const p = store.pengaturan();
  return tipe === 'masuk' ? p.kategoriMasuk : p.kategoriKeluar;
};

/** Pastikan kategori dan aplikasi terpilih masih ada di daftar pengaturan. */
function rapikan(s) {
  const kategori = daftarKategori(s.tipe);
  if (!kategori.includes(s.kategori)) s.kategori = kategori[0] ?? 'Lainnya';
  const aplikasi = store.pengaturan().aplikasi;
  if (!aplikasi.includes(s.aplikasi)) s.aplikasi = aplikasi[0] ?? null;
}

function buatState(query) {
  const s = { tipe: query.tipe === 'keluar' ? 'keluar' : 'masuk', nominal: '', kategori: null, aplikasi: null, catatan: '' };
  rapikan(s);
  return s;
}

function tekan(s, k) {
  let n = s.nominal;
  if (k === 'hapus') n = n.slice(0, -1);
  else if (k === '000') n = n === '' ? '' : `${n}000`;
  else n = n === '' ? (k === '0' ? '' : k) : n + k;
  if (n.length > 9) return;
  s.nominal = n;
}

const chip = (aksi, label, aktif, warna) =>
  `<button type="button" data-aksi="${aksi}" data-nilai="${esc(label)}" aria-pressed="${aktif}" class="min-h-11 rounded-full border-[1.5px] px-4 text-sm font-bold ${aktif ? warna.isi : 'border-edge bg-surface text-ink'}">${esc(label)}</button>`;

const tombolJenis = (nilai, label, aktif) =>
  `<button type="button" data-aksi="jenis" data-nilai="${nilai}" aria-pressed="${aktif}" class="h-11 flex-1 rounded-[14px] text-sm font-bold ${aktif ? WARNA[nilai].isi : 'text-ink/75'}">${label}</button>`;

function tampilan(s) {
  const masuk = s.tipe === 'masuk';
  const warna = WARNA[s.tipe];
  const sekarang = new Date();

  const keypad = TOMBOL.map((k) =>
    k === 'hapus'
      ? `<button type="button" data-tombol="hapus" aria-label="Hapus satu angka" class="flex h-[52px] items-center justify-center rounded-2xl bg-bg text-ink active:bg-track">${icon('backspace')}</button>`
      : `<button type="button" data-tombol="${k}" aria-label="${k === '000' ? 'Tiga nol' : k}" class="h-[52px] rounded-2xl bg-bg text-xl font-bold text-ink active:bg-track">${k}</button>`
  ).join('');

  const aplikasi = masuk
    ? `<section>
        <div class="mb-2 text-[13px] font-bold text-muted">Aplikasi</div>
        <div class="flex flex-wrap gap-2">${store.pengaturan().aplikasi.map((a) => chip('aplikasi', a, a === s.aplikasi, warna)).join('')}</div>
      </section>`
    : '';

  return `<div class="flex min-h-dvh flex-col">
    <header class="flex items-center justify-between px-5 pb-2 pt-4">
      <a href="#/" aria-label="Kembali ke beranda" class="flex h-11 w-11 items-center justify-center rounded-full bg-surface">${icon('back', 'h-[22px] w-[22px]', 2.2)}</a>
      <h1 class="text-lg font-extrabold">Catat transaksi</h1>
      <div class="h-11 w-11"></div>
    </header>

    <div class="flex flex-1 flex-col gap-5 px-5 pb-4 pt-2">
      <div role="group" aria-label="Jenis transaksi" class="flex gap-1 rounded-[18px] bg-track p-1">
        ${tombolJenis('masuk', 'Pemasukan', masuk)}
        ${tombolJenis('keluar', 'Pengeluaran', !masuk)}
      </div>

      <section aria-live="polite" class="text-center">
        <div class="text-[13px] font-semibold text-muted">Nominal</div>
        <div class="mt-1 text-[46px] font-extrabold leading-[1.1] tracking-tight tabular-nums ${warna.teks} ${s.nominal === '' ? 'opacity-40' : ''}">Rp ${angka(Number(s.nominal || 0))}</div>
        <div class="mt-1 text-[13px] font-semibold text-muted">Hari ini, ${tanggalPendek(sekarang)} · ${jam(sekarang)}</div>
      </section>

      <section>
        <div class="mb-2 text-[13px] font-bold text-muted">Kategori</div>
        <div class="flex flex-wrap gap-2">${daftarKategori(s.tipe).map((k) => chip('kategori', k, k === s.kategori, warna)).join('')}</div>
      </section>

      ${aplikasi}

      <label class="block">
        <span class="mb-2 block text-[13px] font-bold text-muted">Catatan (opsional)</span>
        <input data-catatan type="text" maxlength="80" value="${esc(s.catatan)}" placeholder="Mis. antar ke stasiun"
          class="h-12 w-full rounded-2xl border border-edge bg-surface px-4 text-sm font-semibold text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/30">
      </label>
    </div>

    <section class="pb-safe rounded-t-[28px] bg-surface px-5 pt-4">
      <div class="grid grid-cols-3 gap-2">${keypad}</div>
      <button type="button" data-aksi="simpan" class="mt-3 flex h-14 w-full items-center justify-center rounded-[18px] text-base font-extrabold ${masuk ? 'bg-brand text-on-brand' : 'bg-expense text-on-expense'}">${masuk ? 'Simpan pemasukan' : 'Simpan pengeluaran'}</button>
    </section>
  </div>`;
}

function simpan(s) {
  const nominal = Number(s.nominal);
  if (!nominal) {
    toast('Isi nominal dulu');
    return false;
  }
  store.tambah({
    tipe: s.tipe,
    nominal,
    kategori: s.kategori,
    aplikasi: s.tipe === 'masuk' ? s.aplikasi : null,
    catatan: s.catatan.trim(),
  });
  toast(s.tipe === 'masuk' ? 'Pemasukan tersimpan' : 'Pengeluaran tersimpan');
  return true;
}

export default {
  judul: 'Catat transaksi',
  nav: false,
  reaktif: false, // state lokal halaman ini tidak boleh di-reset saat data berubah

  render(ctx) {
    ctx.s = buatState(ctx.query); // dipakai ulang oleh mount() lewat objek ctx yang sama
    return tampilan(ctx.s);
  },

  mount(root, ctx) {
    const s = ctx.s;
    const gambar = () => {
      root.innerHTML = tampilan(s);
    };

    const klik = (e) => {
      const angkaEl = e.target.closest('[data-tombol]');
      if (angkaEl) {
        tekan(s, angkaEl.dataset.tombol);
        gambar();
        return;
      }
      const el = e.target.closest('[data-aksi]');
      if (!el) return;
      const { aksi, nilai } = el.dataset;
      if (aksi === 'jenis') {
        s.tipe = nilai;
        s.kategori = null;
        rapikan(s);
        gambar();
      } else if (aksi === 'kategori') {
        s.kategori = nilai;
        gambar();
      } else if (aksi === 'aplikasi') {
        s.aplikasi = nilai;
        gambar();
      } else if (aksi === 'simpan' && simpan(s)) {
        location.hash = '#/';
      }
    };

    const ketik = (e) => {
      if (e.target.matches('[data-catatan]')) s.catatan = e.target.value;
    };

    root.addEventListener('click', klik);
    root.addEventListener('input', ketik);
    return () => {
      root.removeEventListener('click', klik);
      root.removeEventListener('input', ketik);
    };
  },
};
