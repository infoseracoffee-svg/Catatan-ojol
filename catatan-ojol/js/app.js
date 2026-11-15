/**
 * Titik masuk aplikasi: router, render halaman, tema, dan PWA.
 *
 * Kontrak halaman (js/pages/*.js):
 *   judul    string   judul untuk document.title
 *   nav      string|false   id menu aktif di bottom nav, atau false untuk menyembunyikannya
 *   reaktif  boolean  (opsional) false = jangan render ulang saat data berubah
 *   render(ctx) -> string HTML      ctx = { path, query }
 *   mount(root, ctx) -> fungsi pembersih (opsional)
 */
import { store } from './store.js';
import { ruteSaatIni, mulaiRouter } from './router.js';
import { bottomNav } from './components/nav.js';
import { toast } from './components/ui.js';
import { mulaiPwa, padaPerubahanPwa } from './pwa.js';
import beranda from './pages/home.js';
import catat from './pages/add.js';
import riwayat from './pages/history.js';
import laporan from './pages/report.js';
import pengaturan from './pages/settings.js';

const HALAMAN = {
  '/': beranda,
  '/catat': catat,
  '/riwayat': riwayat,
  '/laporan': laporan,
  '/pengaturan': pengaturan,
};

const akar = document.getElementById('app');
let halamanAktif = null;
let bersihkan = null;

function terapkanTema() {
  const tema = store.pengaturan().tema;
  const gelap = tema === 'gelap' || (tema === 'otomatis' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = gelap ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', gelap ? '#0E1512' : '#F5F3EC');
}

function tampil({ pertahankanScroll = false } = {}) {
  bersihkan?.();
  bersihkan = null;

  const { path, query } = ruteSaatIni();
  halamanAktif = HALAMAN[path] ?? beranda;
  const ctx = { path, query };
  const y = pertahankanScroll ? window.scrollY : 0;

  akar.innerHTML = `<main id="halaman" tabindex="-1" class="flex-1 outline-none ${halamanAktif.nav ? 'pb-28' : ''}">${halamanAktif.render(ctx)}</main>${halamanAktif.nav ? bottomNav(halamanAktif.nav) : ''}`;

  const main = document.getElementById('halaman');
  bersihkan = halamanAktif.mount?.(main, ctx) ?? null;
  document.title = `${halamanAktif.judul} · Catatan Ojol`;
  window.scrollTo(0, y);
  if (!pertahankanScroll) main.focus({ preventScroll: true });
}

const segarkan = () => {
  if (halamanAktif && halamanAktif.reaktif !== false) tampil({ pertahankanScroll: true });
};

store.berlangganan(() => {
  terapkanTema();
  segarkan();
});
padaPerubahanPwa(segarkan);
window.addEventListener('online', segarkan);
window.addEventListener('offline', segarkan);
window.addEventListener('ojol:gagal-simpan', () => toast('Penyimpanan penuh atau diblokir browser. Data belum tersimpan.'));
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', terapkanTema);

mulaiPwa();
terapkanTema();
mulaiRouter(() => tampil());
