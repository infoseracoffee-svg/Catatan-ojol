/** Pengaturan: pasang PWA, target, daftar kategori, ekspor/cadangan, dan tema. */
import { store } from '../store.js';
import { angka, rupiah } from '../utils.js';
import { icon } from '../components/icons.js';
import { kepalaHalaman } from '../components/header.js';
import { konfirmasi, tanya, toast } from '../components/ui.js';
import { buatCsv, unduh } from '../ekspor.js';
import { bisaPasang, pasang, siapOffline, sudahTerpasang } from '../pwa.js';

const label = (teks) => `<div class="mt-2 text-[13px] font-bold text-muted">${teks}</div>`;

const kotak = (isi) => `<div class="overflow-hidden rounded-[20px] bg-surface divide-y divide-line">${isi}</div>`;

const baris = (aksi, teks, nilai = '') =>
  `<button type="button" data-aksi="${aksi}" class="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left text-[15px] font-semibold">
    <span>${teks}</span>
    <span class="flex items-center gap-1.5 text-sm text-muted">${nilai}${icon('next', 'h-[18px] w-[18px]', 2.2)}</span>
  </button>`;

function kartuPasang() {
  if (sudahTerpasang()) {
    return `<section class="rounded-3xl bg-brand-soft p-5 text-brand"><p class="text-[15px] font-extrabold">Aplikasi sudah terpasang</p><p class="mt-1 text-sm">Kamu membukanya dari layar utama.</p></section>`;
  }
  const tombol = bisaPasang()
    ? `<button type="button" data-aksi="pasang" class="h-12 rounded-2xl bg-sun text-[15px] font-extrabold text-night">Pasang aplikasi</button>`
    : `<p class="text-sm text-hero-muted">Di Chrome: buka menu lalu pilih Pasang aplikasi. Di Safari iPhone: tombol Bagikan, lalu Tambah ke Layar Utama.</p>`;
  return `<section class="flex flex-col gap-3.5 rounded-3xl bg-hero p-5 text-white">
    <div class="flex items-center gap-3">
      <span class="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-sun text-night">${icon('unduh', 'h-[22px] w-[22px]', 2.2)}</span>
      <div>
        <div class="text-base font-extrabold">Pasang di layar utama</div>
        <div class="mt-0.5 text-[13px] text-hero-muted">Buka lebih cepat, tetap bisa mencatat tanpa sinyal.</div>
      </div>
    </div>
    ${tombol}
  </section>`;
}

function halaman() {
  const p = store.pengaturan();
  const jumlah = store.semua().length;
  const tombolTema = [
    ['terang', 'Terang'],
    ['gelap', 'Gelap'],
    ['otomatis', 'Otomatis'],
  ]
    .map(
      ([nilai, teks]) =>
        `<button type="button" data-tema="${nilai}" aria-pressed="${p.tema === nilai}" class="h-11 flex-1 rounded-[14px] text-sm font-bold ${p.tema === nilai ? 'bg-ink text-bg' : 'text-ink/75'}">${teks}</button>`
    )
    .join('');

  return `${kepalaHalaman('Pengaturan')}
    <div class="flex flex-col gap-3 px-5">
      ${kartuPasang()}

      ${label('Data di perangkat')}
      ${kotak(`<div class="flex min-h-16 items-center gap-3 px-4 py-2.5">
        <span class="h-2.5 w-2.5 flex-none rounded-full ${siapOffline() ? 'bg-brand' : 'bg-edge'}"></span>
        <div class="min-w-0 flex-1">
          <div class="text-[15px] font-bold">${siapOffline() ? 'Mode offline aktif' : 'Mode offline belum aktif'}</div>
          <div class="mt-0.5 text-[13px] text-muted">${angka(jumlah)} transaksi tersimpan di HP ini</div>
        </div>
      </div>`)}

      ${label('Target dan kategori')}
      ${kotak(
        baris('target', 'Target laba harian', p.targetHarian > 0 ? rupiah(p.targetHarian) : 'Nonaktif') +
          baris('aplikasi', 'Aplikasi yang dipakai', `${p.aplikasi.length} aplikasi`) +
          baris('kategoriMasuk', 'Kategori pemasukan', `${p.kategoriMasuk.length} kategori`) +
          baris('kategoriKeluar', 'Kategori pengeluaran', `${p.kategoriKeluar.length} kategori`)
      )}

      ${label('Ekspor dan cadangan')}
      ${kotak(
        baris('csv', 'Ekspor ke Excel (CSV)') +
          baris('cadangan', 'Cadangkan data (JSON)') +
          baris('pulihkan', 'Pulihkan dari cadangan') +
          `<button type="button" data-aksi="hapusSemua" class="flex min-h-14 w-full items-center px-4 text-left text-[15px] font-bold text-expense">Hapus semua catatan</button>`
      )}
      <input type="file" data-file accept="application/json,.json" class="hidden" tabindex="-1" aria-hidden="true">

      ${label('Tampilan')}
      <div role="group" aria-label="Tema" class="flex gap-1 rounded-[18px] bg-track p-1">${tombolTema}</div>

      <div class="mt-2 text-center text-xs font-semibold text-muted">Catatan Ojol · versi 1.0</div>
    </div>`;
}

async function editDaftar(kunci, judul) {
  const hasil = await tanya({
    judul,
    deskripsi: 'Pisahkan dengan koma. Maksimal 12 item.',
    nilai: store.pengaturan()[kunci].join(', '),
  });
  if (hasil === null) return;
  const daftar = [...new Set(hasil.split(',').map((x) => x.trim().slice(0, 24)).filter(Boolean))].slice(0, 12);
  if (!daftar.length) {
    toast('Isi minimal satu item');
    return;
  }
  store.ubahPengaturan({ [kunci]: daftar });
  toast('Daftar disimpan');
}

const tanggalBerkas = () => new Date().toISOString().slice(0, 10);

async function tangani(aksi, root) {
  switch (aksi) {
    case 'pasang':
      await pasang();
      break;
    case 'target': {
      const hasil = await tanya({
        judul: 'Target laba harian',
        deskripsi: 'Dalam Rupiah. Isi 0 untuk menonaktifkan target.',
        nilai: String(store.pengaturan().targetHarian),
        mode: 'numeric',
      });
      if (hasil === null) break;
      store.ubahPengaturan({ targetHarian: Math.round(Number(hasil.replace(/\D/g, ''))) || 0 });
      toast('Target disimpan');
      break;
    }
    case 'aplikasi':
      await editDaftar('aplikasi', 'Aplikasi yang dipakai');
      break;
    case 'kategoriMasuk':
      await editDaftar('kategoriMasuk', 'Kategori pemasukan');
      break;
    case 'kategoriKeluar':
      await editDaftar('kategoriKeluar', 'Kategori pengeluaran');
      break;
    case 'csv':
      if (!store.semua().length) toast('Belum ada data untuk diekspor');
      else unduh(`catatan-ojol-${tanggalBerkas()}.csv`, `﻿${buatCsv(store.semua())}`, 'text/csv;charset=utf-8');
      break;
    case 'cadangan':
      unduh(`cadangan-catatan-ojol-${tanggalBerkas()}.json`, store.ekspor(), 'application/json');
      break;
    case 'pulihkan':
      root.querySelector('[data-file]').click();
      break;
    case 'hapusSemua':
      if (
        await konfirmasi({
          judul: 'Hapus semua catatan?',
          teks: 'Semua transaksi di HP ini akan dihapus dan tidak bisa dikembalikan, kecuali dari berkas cadangan.',
          labelOk: 'Hapus semua',
          bahaya: true,
        })
      ) {
        store.hapusSemua();
        toast('Semua catatan dihapus');
      }
      break;
    default:
  }
}

export default {
  judul: 'Pengaturan',
  nav: 'pengaturan',

  render() {
    return halaman();
  },

  mount(root) {
    const klik = (e) => {
      const tema = e.target.closest('[data-tema]');
      if (tema) {
        store.ubahPengaturan({ tema: tema.dataset.tema });
        return;
      }
      const el = e.target.closest('[data-aksi]');
      if (el) tangani(el.dataset.aksi, root);
    };

    const ubah = async (e) => {
      const input = e.target.closest('[data-file]');
      const berkas = input?.files?.[0];
      if (!berkas) return;
      input.value = '';
      try {
        const teks = await berkas.text();
        const jumlah = store.periksaCadangan(teks); // gagal lebih dulu bila berkasnya salah
        const ya = await konfirmasi({
          judul: 'Pulihkan dari cadangan?',
          teks: `Semua catatan saat ini akan diganti dengan ${angka(jumlah)} transaksi dari berkas cadangan.`,
          labelOk: 'Pulihkan',
          bahaya: true,
        });
        if (!ya) return;
        toast(`${angka(store.impor(teks))} transaksi dipulihkan`);
      } catch {
        toast('Berkas cadangan tidak valid');
      }
    };

    root.addEventListener('click', klik);
    root.addEventListener('change', ubah);
    return () => {
      root.removeEventListener('click', klik);
      root.removeEventListener('change', ubah);
    };
  },
};
