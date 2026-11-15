/** Laporan: laba per periode (minggu/bulan/tahun), serta rincian per aplikasi dan kategori. */
import { store } from '../store.js';
import { rupiah, esc, awalHari, awalMinggu, tanggalPendek, ringkas, BULAN, BULAN_SINGKAT } from '../utils.js';
import { kepalaHalaman } from '../components/header.js';

const PERIODE = [
  ['minggu', 'Minggu'],
  ['bulan', 'Bulan'],
  ['tahun', 'Tahun'],
];

let periode = 'minggu';

/** Tiap periode dipecah menjadi "bucket" (batang grafik). cocok() mengembalikan indeks bucket atau -1. */
const KONFIG = {
  minggu: {
    judul: 'minggu ini',
    satuan: 'ribu',
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    rentang(now) {
      const a = awalMinggu(now);
      const b = new Date(a);
      b.setDate(a.getDate() + 6);
      return `${tanggalPendek(a)} – ${tanggalPendek(b)} ${b.getFullYear()}`;
    },
    cocok(d, now) {
      const selisih = Math.round((awalHari(d) - awalMinggu(now)) / 86400000);
      return selisih >= 0 && selisih < 7 ? selisih : -1;
    },
    sekarang: (now) => Math.round((awalHari(now) - awalMinggu(now)) / 86400000),
  },
  bulan: {
    judul: 'bulan ini',
    satuan: 'ribu',
    labels: ['1–7', '8–14', '15–21', '22–28', '29+'],
    rentang: (now) => `${BULAN[now.getMonth()]} ${now.getFullYear()}`,
    cocok: (d, now) =>
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() ? Math.min(4, Math.floor((d.getDate() - 1) / 7)) : -1,
    sekarang: (now) => Math.min(4, Math.floor((now.getDate() - 1) / 7)),
  },
  tahun: {
    judul: 'tahun ini',
    satuan: 'juta',
    labels: BULAN_SINGKAT,
    rentang: (now) => String(now.getFullYear()),
    cocok: (d, now) => (d.getFullYear() === now.getFullYear() ? d.getMonth() : -1),
    sekarang: (now) => now.getMonth(),
  },
};

function hitung(now) {
  const k = KONFIG[periode];
  const bucket = k.labels.map(() => ({ masuk: 0, keluar: 0 }));
  const dalam = [];
  for (const t of store.semua()) {
    const i = k.cocok(new Date(t.waktu), now);
    if (i < 0) continue;
    dalam.push(t);
    bucket[i][t.tipe] += t.nominal;
  }
  return { bucket, dalam };
}

function labelBatang(nilai, satuan) {
  const teks = satuan === 'juta' ? (nilai / 1e6).toFixed(1).replace('.', ',') : String(Math.round(nilai / 1000));
  return teks.replace('-', '−');
}

function rincian(daftar, tipe, kunci) {
  const peta = new Map();
  for (const t of daftar) {
    if (t.tipe !== tipe) continue;
    const k = kunci(t);
    peta.set(k, (peta.get(k) ?? 0) + t.nominal);
  }
  const total = [...peta.values()].reduce((a, b) => a + b, 0);
  return [...peta]
    .sort((a, b) => b[1] - a[1])
    .map(([nama, nilai]) => ({ nama, nilai, persen: total ? (nilai / total) * 100 : 0 }));
}

const daftarBatang = (items, warna) =>
  items
    .map(
      (i) => `<div class="flex flex-col gap-1.5">
        <div class="flex justify-between text-sm font-bold"><span>${esc(i.nama)}</span><span class="tabular-nums">${rupiah(i.nilai)}</span></div>
        <div class="h-2 overflow-hidden rounded-full bg-track"><div class="h-full rounded-full ${warna}" style="width:${i.persen.toFixed(1)}%"></div></div>
      </div>`
    )
    .join('');

const kartuRincian = (judul, isi) =>
  `<section class="flex flex-col gap-3.5 rounded-3xl bg-surface p-5">
    <h2 class="text-base font-extrabold">${judul}</h2>
    ${isi || '<p class="text-sm text-muted">Belum ada data di periode ini.</p>'}
  </section>`;

function halaman() {
  const now = new Date();
  const k = KONFIG[periode];
  const { bucket, dalam } = hitung(now);
  const r = ringkas(dalam);

  const nilai = bucket.map((b) => b.masuk - b.keluar);
  const maks = Math.max(1, ...nilai);
  const aktif = k.sekarang(now);

  const batang = nilai
    .map((v, i) => {
      const sekarangIni = i === aktif;
      const tinggi = v > 0 ? Math.max(3, (v / maks) * 100) : 3;
      return `<div class="flex min-w-0 flex-1 flex-col items-center gap-1.5">
        <span class="text-xs font-bold tabular-nums ${sekarangIni ? 'text-brand' : 'text-ink/75'}">${labelBatang(v, k.satuan)}</span>
        <div class="flex h-32 w-full items-end"><div class="w-full rounded-t-lg ${sekarangIni ? 'bg-brand' : 'bg-brand/70'}" style="height:${tinggi}%"></div></div>
        <span class="text-xs ${sekarangIni ? 'font-extrabold text-brand' : 'font-semibold text-ink/75'}">${k.labels[i]}</span>
      </div>`;
    })
    .join('');

  const tab = PERIODE.map(
    ([nilaiTab, label]) =>
      `<button type="button" data-periode="${nilaiTab}" aria-pressed="${periode === nilaiTab}" class="h-11 flex-1 rounded-[14px] text-sm font-bold ${periode === nilaiTab ? 'bg-ink text-bg' : 'text-ink/75'}">${label}</button>`
  ).join('');

  return `${kepalaHalaman('Laporan', k.rentang(now))}
    <div class="flex flex-col gap-3.5 px-5">
      <div role="group" aria-label="Periode laporan" class="flex gap-1 rounded-[18px] bg-track p-1">${tab}</div>

      <section class="flex flex-col gap-4 rounded-3xl bg-hero p-5 text-white">
        <div>
          <div class="text-[13px] font-semibold text-hero-muted">Laba bersih ${k.judul}</div>
          <div class="mt-1 text-4xl font-extrabold leading-[1.05] tracking-tight tabular-nums">${rupiah(r.bersih)}</div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-hero-soft p-3"><div class="text-xs font-semibold text-hero-muted">Pemasukan</div><div class="mt-0.5 text-base font-extrabold tabular-nums">${rupiah(r.masuk)}</div></div>
          <div class="rounded-2xl bg-hero-soft p-3"><div class="text-xs font-semibold text-hero-muted">Pengeluaran</div><div class="mt-0.5 text-base font-extrabold tabular-nums">${rupiah(r.keluar)}</div></div>
        </div>
      </section>

      <section class="flex flex-col gap-4 rounded-3xl bg-surface p-5">
        <div class="flex items-baseline justify-between">
          <h2 class="text-base font-extrabold">Laba bersih per ${periode === 'tahun' ? 'bulan' : periode === 'bulan' ? 'minggu' : 'hari'}</h2>
          <span class="text-xs font-semibold text-muted">dalam ${k.satuan} rupiah</span>
        </div>
        <div class="flex items-end gap-2">${batang}</div>
      </section>

      ${kartuRincian('Pemasukan per aplikasi', daftarBatang(rincian(dalam, 'masuk', (t) => t.aplikasi || 'Tanpa aplikasi'), 'bg-brand'))}
      ${kartuRincian('Pengeluaran per kategori', daftarBatang(rincian(dalam, 'keluar', (t) => t.kategori), 'bg-expense'))}
    </div>`;
}

export default {
  judul: 'Laporan',
  nav: 'laporan',

  render() {
    return halaman();
  },

  mount(root) {
    const klik = (e) => {
      const tab = e.target.closest('[data-periode]');
      if (!tab) return;
      periode = tab.dataset.periode;
      root.innerHTML = halaman();
    };
    root.addEventListener('click', klik);
    return () => root.removeEventListener('click', klik);
  },
};
