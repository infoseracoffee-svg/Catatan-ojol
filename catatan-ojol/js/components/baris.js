/** Satu baris transaksi + sheet detail (dengan tombol hapus dua langkah). */
import { store } from '../store.js';
import { esc, jam, rupiahTanda, tanggalPanjang } from '../utils.js';
import { icon } from './icons.js';
import { bukaSheet, toast, TOMBOL_BAHAYA, TOMBOL_SEKUNDER } from './ui.js';

export function barisTransaksi(t) {
  const masuk = t.tipe === 'masuk';
  const sub = [masuk ? t.aplikasi : null, jam(new Date(t.waktu)), t.catatan].filter(Boolean).join(' · ');
  return `<button type="button" data-id="${esc(t.id)}" class="flex w-full items-center gap-3 px-4 py-3.5 text-left">
    <span class="flex h-10 w-10 flex-none items-center justify-center rounded-[14px] ${masuk ? 'bg-brand-soft text-brand' : 'bg-expense-soft text-expense'}">${icon(masuk ? 'masuk' : 'keluar', 'h-5 w-5', 2.2)}</span>
    <span class="min-w-0 flex-1">
      <span class="block truncate text-[15px] font-bold">${esc(t.kategori)}</span>
      <span class="mt-0.5 block truncate text-[13px] text-muted">${esc(sub)}</span>
    </span>
    <span class="text-[15px] font-extrabold tabular-nums ${masuk ? 'text-brand' : 'text-expense'}">${rupiahTanda(t.nominal, t.tipe)}</span>
  </button>`;
}

const baris = (label, nilai) =>
  `<div class="flex justify-between gap-4 py-2.5"><dt class="text-muted">${label}</dt><dd class="text-right font-bold">${esc(nilai)}</dd></div>`;

function bukaDetail(t) {
  const masuk = t.tipe === 'masuk';
  const waktu = new Date(t.waktu);
  const { el, tutup } = bukaSheet({
    judul: masuk ? 'Detail pemasukan' : 'Detail pengeluaran',
    isi: `<div class="text-3xl font-extrabold tabular-nums ${masuk ? 'text-brand' : 'text-expense'}">${rupiahTanda(t.nominal, t.tipe)}</div>
      <dl class="mt-4 divide-y divide-line text-sm">
        ${baris('Kategori', t.kategori)}
        ${t.aplikasi ? baris('Aplikasi', t.aplikasi) : ''}
        ${baris('Waktu', `${tanggalPanjang(waktu)}, ${jam(waktu)}`)}
        ${t.catatan ? baris('Catatan', t.catatan) : ''}
      </dl>
      <div class="mt-5 flex gap-3">
        <button type="button" data-tutup class="${TOMBOL_SEKUNDER}">Tutup</button>
        <button type="button" data-hapus class="${TOMBOL_BAHAYA}">Hapus</button>
      </div>`,
  });

  el.querySelector('[data-tutup]').addEventListener('click', tutup);
  const tombolHapus = el.querySelector('[data-hapus]');
  tombolHapus.addEventListener('click', () => {
    if (!tombolHapus.dataset.yakin) {
      tombolHapus.dataset.yakin = '1';
      tombolHapus.textContent = 'Yakin hapus?';
      return;
    }
    store.hapus(t.id);
    tutup();
    toast('Transaksi dihapus');
  });
}

/** Pasang pendengar klik pada root halaman; mengembalikan fungsi pembersih. */
export function pasangDetail(root) {
  const klik = (e) => {
    const el = e.target.closest('[data-id]');
    if (!el) return;
    const t = store.semua().find((x) => x.id === el.dataset.id);
    if (t) bukaDetail(t);
  };
  root.addEventListener('click', klik);
  return () => root.removeEventListener('click', klik);
}
