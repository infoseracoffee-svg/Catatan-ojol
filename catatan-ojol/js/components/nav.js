import { icon } from './icons.js';

const MENU = [
  { id: 'home', href: '#/', label: 'Beranda', ikon: 'home' },
  { id: 'riwayat', href: '#/riwayat', label: 'Riwayat', ikon: 'list' },
  { id: 'catat', href: '#/catat', label: 'Catat', ikon: 'plus', tengah: true },
  { id: 'laporan', href: '#/laporan', label: 'Laporan', ikon: 'chart' },
  { id: 'pengaturan', href: '#/pengaturan', label: 'Pengaturan', ikon: 'sliders' },
];

export function bottomNav(aktif) {
  const item = MENU.map((m) => {
    if (m.tengah) {
      return `<a href="${m.href}" aria-label="Catat transaksi baru" class="flex h-14 flex-1 flex-col items-center justify-start gap-1 text-xs font-bold text-ink">
        <span class="-mt-6 flex h-14 w-14 items-center justify-center rounded-full border-4 border-bg bg-brand text-on-brand">${icon(m.ikon, 'h-6 w-6', 2.5)}</span>
        ${m.label}
      </a>`;
    }
    const sedangAktif = m.id === aktif;
    return `<a href="${m.href}" ${sedangAktif ? 'aria-current="page"' : ''} class="flex h-14 flex-1 flex-col items-center justify-center gap-1 text-xs font-bold ${sedangAktif ? 'text-brand' : 'text-muted'}">
      ${icon(m.ikon)}
      ${m.label}
    </a>`;
  }).join('');

  return `<nav aria-label="Menu utama" class="pb-safe fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-start border-t border-line bg-surface px-2 pt-2">${item}</nav>`;
}
