/** Router hash sederhana: "#/riwayat" atau "#/catat?tipe=keluar". */

export function ruteSaatIni() {
  const mentah = location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = mentah.split('?');
  return { path: path || '/', query: Object.fromEntries(new URLSearchParams(qs)) };
}

/** Jalankan `saatBerubah` sekali sekarang dan setiap hash berubah. */
export function mulaiRouter(saatBerubah) {
  window.addEventListener('hashchange', () => saatBerubah());
  saatBerubah();
}
