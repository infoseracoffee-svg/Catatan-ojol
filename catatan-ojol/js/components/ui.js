/** Komponen UI kecil: toast, bottom sheet, dialog tanya dan konfirmasi. */
import { esc } from '../utils.js';

export const TOMBOL_UTAMA = 'h-12 flex-1 rounded-2xl bg-brand text-[15px] font-extrabold text-on-brand';
export const TOMBOL_SEKUNDER = 'h-12 flex-1 rounded-2xl bg-track text-[15px] font-bold text-ink';
export const TOMBOL_BAHAYA = 'h-12 flex-1 rounded-2xl bg-expense text-[15px] font-extrabold text-on-expense';

export function toast(pesan) {
  const akar = document.getElementById('toast-root');
  if (!akar) return;
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.className = 'animate-toast rounded-full bg-hero px-4 py-3 text-sm font-semibold text-white shadow-lg';
  el.textContent = pesan;
  akar.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

/**
 * Bottom sheet. `isi` adalah HTML (escape teks pengguna dengan esc()).
 * Mengembalikan { el, tutup }. `onTutup` selalu dipanggil sekali saat sheet ditutup.
 */
export function bukaSheet({ judul, isi, onTutup }) {
  const akar = document.getElementById('sheet-root');
  const fokusSebelumnya = document.activeElement;

  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-50 flex items-end justify-center bg-black/50';
  overlay.innerHTML = `<div role="dialog" aria-modal="true" aria-label="${esc(judul)}" class="animate-sheet w-full max-w-md rounded-t-4xl bg-surface p-5 pb-8 text-ink shadow-2xl">
    <h2 class="text-lg font-extrabold">${esc(judul)}</h2>
    <div class="mt-3">${isi}</div>
  </div>`;
  akar.appendChild(overlay);
  const panel = overlay.firstElementChild;

  let tertutup = false;
  const tekanKey = (e) => {
    if (e.key === 'Escape') tutup();
  };
  function tutup() {
    if (tertutup) return;
    tertutup = true;
    document.removeEventListener('keydown', tekanKey);
    overlay.remove();
    fokusSebelumnya?.focus?.();
    onTutup?.();
  }

  document.addEventListener('keydown', tekanKey);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) tutup();
  });
  panel.querySelector('input, textarea, button')?.focus();

  return { el: panel, tutup };
}

/** Dialog isian satu baris. Resolve ke teks yang diisi, atau null bila dibatalkan. */
export function tanya({ judul, deskripsi = '', nilai = '', placeholder = '', mode = 'text' }) {
  return new Promise((selesai) => {
    let hasil = null;
    const { el, tutup } = bukaSheet({
      judul,
      onTutup: () => selesai(hasil),
      isi: `<form data-form class="flex flex-col gap-4">
        ${deskripsi ? `<p class="text-sm text-muted">${esc(deskripsi)}</p>` : ''}
        <input name="nilai" inputmode="${esc(mode)}" autocomplete="off" value="${esc(nilai)}" placeholder="${esc(placeholder)}" aria-label="${esc(judul)}"
          class="h-14 w-full rounded-2xl border border-edge bg-bg px-4 text-lg font-bold text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30">
        <div class="flex gap-3">
          <button type="button" data-batal class="${TOMBOL_SEKUNDER}">Batal</button>
          <button type="submit" class="${TOMBOL_UTAMA}">Simpan</button>
        </div>
      </form>`,
    });
    const form = el.querySelector('[data-form]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      hasil = String(new FormData(form).get('nilai') ?? '');
      tutup();
    });
    el.querySelector('[data-batal]').addEventListener('click', tutup);
  });
}

/** Dialog konfirmasi. Resolve true bila pengguna memilih tombol utama. */
export function konfirmasi({ judul, teks, labelOk = 'Ya', bahaya = false }) {
  return new Promise((selesai) => {
    let hasil = false;
    const { el, tutup } = bukaSheet({
      judul,
      onTutup: () => selesai(hasil),
      isi: `<p class="text-sm text-muted">${esc(teks)}</p>
        <div class="mt-5 flex gap-3">
          <button type="button" data-batal class="${TOMBOL_SEKUNDER}">Batal</button>
          <button type="button" data-ok class="${bahaya ? TOMBOL_BAHAYA : TOMBOL_UTAMA}">${esc(labelOk)}</button>
        </div>`,
    });
    el.querySelector('[data-batal]').addEventListener('click', tutup);
    el.querySelector('[data-ok]').addEventListener('click', () => {
      hasil = true;
      tutup();
    });
  });
}
