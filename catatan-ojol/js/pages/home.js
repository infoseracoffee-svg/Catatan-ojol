/** Beranda: ringkasan hari ini, progres target, dan transaksi terakhir. */
import { store } from '../store.js';
import { rupiah, ringkas, samaHari, tanggalPanjang } from '../utils.js';
import { icon } from '../components/icons.js';
import { barisTransaksi, pasangDetail } from '../components/baris.js';
import { toast } from '../components/ui.js';
import { siapOffline } from '../pwa.js';

function pilStatus() {
  if (globalThis.navigator?.onLine === false) {
    return `<div class="flex items-center gap-2 rounded-full bg-expense-soft px-3 py-1.5 text-xs font-bold text-expense"><span class="h-2 w-2 rounded-full bg-expense"></span>Offline</div>`;
  }
  return `<div class="flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand"><span class="h-2 w-2 rounded-full bg-brand"></span>${siapOffline() ? 'Siap offline' : 'Online'}</div>`;
}

const kartu = (tipe, label, nilai) => `<div class="flex flex-col gap-2.5 rounded-[20px] bg-surface p-4">
  <div class="flex items-center gap-2 text-[13px] font-semibold text-muted">
    <span class="flex h-7 w-7 items-center justify-center rounded-[10px] ${tipe === 'masuk' ? 'bg-brand-soft text-brand' : 'bg-expense-soft text-expense'}">${icon(tipe, 'h-4 w-4', 2.4)}</span>${label}
  </div>
  <div class="text-xl font-extrabold tracking-tight tabular-nums">${rupiah(nilai)}</div>
</div>`;

const tombolCepat = (tipe, label, kelas) =>
  `<a href="#/catat?tipe=${tipe}" class="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold ${kelas}">${icon('plus', 'h-[18px] w-[18px]', 2.5)}${label}</a>`;

export default {
  judul: 'Beranda',
  nav: 'home',

  render() {
    const sekarang = new Date();
    const semua = store.semua();
    const r = ringkas(semua.filter((t) => samaHari(new Date(t.waktu), sekarang)));
    const target = store.pengaturan().targetHarian;
    const persen = target > 0 ? Math.max(0, Math.min(100, Math.round((r.bersih / target) * 100))) : 0;
    const sisa = Math.max(0, target - r.bersih);

    const progres =
      target > 0
        ? `<div class="flex flex-col gap-2">
            <div class="h-2.5 overflow-hidden rounded-full bg-hero-soft" role="progressbar" aria-label="Progres target harian" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${persen}">
              <div class="h-full rounded-full bg-sun" style="width:${persen}%"></div>
            </div>
            <div class="flex justify-between text-xs font-semibold text-hero-muted">
              <span>${sisa > 0 ? `Tinggal ${rupiah(sisa)} lagi ke target` : 'Target hari ini tercapai'}</span>
              <span>${rupiah(target)}</span>
            </div>
          </div>`
        : '';

    const daftar = semua.length
      ? `<div class="overflow-hidden rounded-3xl bg-surface divide-y divide-line">${semua.slice(0, 4).map(barisTransaksi).join('')}</div>`
      : `<div class="rounded-3xl bg-surface p-5 text-center">
          <p class="text-[15px] font-bold">Belum ada catatan</p>
          <p class="mt-1 text-sm text-muted">Mulai dengan tombol Catat, atau lihat dulu tampilannya dengan data contoh.</p>
          <button type="button" data-aksi="contoh" class="mt-4 h-11 rounded-2xl bg-brand-soft px-5 text-sm font-bold text-brand">Isi data contoh</button>
        </div>`;

    return `
    <header class="flex items-center justify-between px-5 pb-3 pt-5">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-on-brand">${icon('motor', 'h-[22px] w-[22px]')}</div>
        <span class="text-[17px] font-extrabold tracking-tight">Catatan Ojol</span>
      </div>
      ${pilStatus()}
    </header>

    <div class="flex flex-col gap-3.5 px-5">
      <div>
        <div class="text-[13px] font-semibold text-muted">${tanggalPanjang(sekarang)}</div>
        <h1 class="mt-0.5 text-[26px] font-extrabold tracking-tight">Ringkasan hari ini</h1>
      </div>

      <section class="flex flex-col gap-3.5 rounded-3xl bg-hero p-5 text-white">
        <div class="flex items-center justify-between">
          <span class="text-[13px] font-semibold text-hero-muted">Laba bersih hari ini</span>
          <span class="rounded-full bg-sun px-2.5 py-1 text-xs font-extrabold text-night">${r.order} order</span>
        </div>
        <div class="text-[40px] font-extrabold leading-[1.05] tracking-tight tabular-nums">${rupiah(r.bersih)}</div>
        ${progres}
      </section>

      <div class="grid grid-cols-2 gap-3">
        ${kartu('masuk', 'Pemasukan', r.masuk)}
        ${kartu('keluar', 'Pengeluaran', r.keluar)}
      </div>

      <div class="flex gap-3">
        ${tombolCepat('masuk', 'Pemasukan', 'bg-brand text-on-brand')}
        ${tombolCepat('keluar', 'Pengeluaran', 'border-[1.5px] border-expense bg-surface text-expense')}
      </div>

      <div class="mt-1 flex items-center justify-between">
        <h2 class="text-[17px] font-extrabold">Terakhir dicatat</h2>
        <a href="#/riwayat" class="flex min-h-11 items-center px-1 text-sm font-bold text-brand">Lihat semua</a>
      </div>
      <div class="-mt-2">${daftar}</div>
    </div>`;
  },

  mount(root) {
    const bersihkanDetail = pasangDetail(root);
    const klik = (e) => {
      if (!e.target.closest('[data-aksi="contoh"]')) return;
      store.isiContoh();
      toast('Data contoh dimuat');
    };
    root.addEventListener('click', klik);
    return () => {
      bersihkanDetail();
      root.removeEventListener('click', klik);
    };
  },
};
