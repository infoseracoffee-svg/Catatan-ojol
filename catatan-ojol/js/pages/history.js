/** Riwayat: transaksi dikelompokkan per hari dengan filter jenis. */
import { store } from '../store.js';
import { rupiah, labelHari, kunciHari, ringkas } from '../utils.js';
import { barisTransaksi, pasangDetail } from '../components/baris.js';
import { kepalaHalaman } from '../components/header.js';

const FILTER = [
  ['semua', 'Semua'],
  ['masuk', 'Pemasukan'],
  ['keluar', 'Pengeluaran'],
];
const LANGKAH = 100;

// State halaman: bertahan selama sesi, supaya filter tidak reset saat data berubah.
let filter = 'semua';
let batas = LANGKAH;

function kelompokkan(daftar) {
  const peta = new Map();
  for (const t of daftar) {
    const d = new Date(t.waktu);
    const kunci = kunciHari(d);
    if (!peta.has(kunci)) peta.set(kunci, { tanggal: d, items: [] });
    peta.get(kunci).items.push(t);
  }
  return [...peta.values()];
}

function totalGrup(items) {
  const r = ringkas(items);
  if (filter === 'masuk') return { label: 'Masuk', nilai: r.masuk, positif: true };
  if (filter === 'keluar') return { label: 'Keluar', nilai: r.keluar, positif: false };
  return { label: 'Bersih', nilai: r.bersih, positif: r.bersih >= 0 };
}

function halaman() {
  const semua = store.semua();
  const terfilter = filter === 'semua' ? semua : semua.filter((t) => t.tipe === filter);
  const grup = kelompokkan(terfilter);
  let sisaBaris = batas;
  const sekarang = new Date();

  const chip = FILTER.map(
    ([nilai, label]) =>
      `<button type="button" data-filter="${nilai}" aria-pressed="${filter === nilai}" class="min-h-11 rounded-full border-[1.5px] px-[18px] text-sm font-bold ${filter === nilai ? 'border-ink bg-ink text-bg' : 'border-edge bg-surface text-ink'}">${label}</button>`
  ).join('');

  const isi = grup
    .map((g) => {
      if (sisaBaris <= 0) return '';
      const baris = g.items.slice(0, sisaBaris);
      sisaBaris -= baris.length;
      const total = totalGrup(g.items);
      return `<section class="flex flex-col gap-2.5">
        <div class="flex items-baseline justify-between">
          <h2 class="text-[15px] font-extrabold">${labelHari(g.tanggal, sekarang)}</h2>
          <span class="text-[13px] font-bold tabular-nums ${total.positif ? 'text-brand' : 'text-expense'}">${total.label} ${rupiah(total.nilai)}</span>
        </div>
        <div class="overflow-hidden rounded-3xl bg-surface divide-y divide-line">${baris.map(barisTransaksi).join('')}</div>
      </section>`;
    })
    .join('');

  const kosong = `<div class="rounded-3xl bg-surface p-6 text-center text-sm text-muted">${
    semua.length ? 'Tidak ada transaksi untuk filter ini.' : 'Belum ada catatan. Tekan tombol Catat untuk mulai.'
  }</div>`;

  const lagi =
    terfilter.length > batas
      ? `<button type="button" data-aksi="lebih" class="h-12 rounded-2xl bg-track text-sm font-bold text-ink">Tampilkan lebih banyak</button>`
      : '';

  return `${kepalaHalaman('Riwayat')}
    <div role="group" aria-label="Filter transaksi" class="flex gap-2 px-5 pb-3">${chip}</div>
    <div class="flex flex-col gap-4 px-5">${terfilter.length ? isi + lagi : kosong}</div>`;
}

export default {
  judul: 'Riwayat',
  nav: 'riwayat',

  render() {
    return halaman();
  },

  mount(root) {
    const bersihkanDetail = pasangDetail(root);
    const klik = (e) => {
      const f = e.target.closest('[data-filter]');
      if (f) {
        filter = f.dataset.filter;
        batas = LANGKAH;
        root.innerHTML = halaman();
        return;
      }
      if (e.target.closest('[data-aksi="lebih"]')) {
        batas += LANGKAH;
        root.innerHTML = halaman();
      }
    };
    root.addEventListener('click', klik);
    return () => {
      bersihkanDetail();
      root.removeEventListener('click', klik);
    };
  },
};
