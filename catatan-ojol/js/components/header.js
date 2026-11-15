import { esc } from '../utils.js';

/** Judul halaman standar (Riwayat, Laporan, Pengaturan). */
export function kepalaHalaman(judul, sub = '') {
  return `<header class="px-5 pb-3 pt-5">
    <h1 class="text-[26px] font-extrabold tracking-tight">${esc(judul)}</h1>
    ${sub ? `<div class="mt-0.5 text-[13px] font-semibold text-muted">${esc(sub)}</div>` : ''}
  </header>`;
}
