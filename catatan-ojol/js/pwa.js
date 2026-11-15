/** Hal-hal PWA: registrasi service worker, tombol "Pasang aplikasi", dan status offline. */

let promptTertunda = null;
const pendengar = new Set();
const kabari = () => pendengar.forEach((fn) => fn());

export function mulaiPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptTertunda = e;
    kabari();
  });

  window.addEventListener('appinstalled', () => {
    promptTertunda = null;
    kabari();
  });

  if ('serviceWorker' in navigator) {
    const daftar = () =>
      navigator.serviceWorker
        .register('./sw.js')
        .then(() => navigator.serviceWorker.ready)
        .then(kabari)
        .catch((galat) => console.error('Service worker gagal didaftarkan', galat));
    if (document.readyState === 'complete') daftar();
    else window.addEventListener('load', daftar);
  }
}

export const padaPerubahanPwa = (fn) => {
  pendengar.add(fn);
  return () => pendengar.delete(fn);
};

export const bisaPasang = () => promptTertunda !== null;

export const sudahTerpasang = () =>
  globalThis.matchMedia?.('(display-mode: standalone)').matches === true || globalThis.navigator?.standalone === true;

export const siapOffline = () => Boolean(globalThis.navigator?.serviceWorker?.controller);

export async function pasang() {
  if (!promptTertunda) return;
  promptTertunda.prompt();
  await promptTertunda.userChoice;
  promptTertunda = null;
  kabari();
}
