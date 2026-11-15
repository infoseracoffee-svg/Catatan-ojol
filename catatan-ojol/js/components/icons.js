/** Ikon stroke inline (24x24). Warna mengikuti `currentColor`. */

const BENTUK = {
  home: '<path d="M3 11.5L12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chart: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  next: '<path d="M9 6l6 6-6 6"/>',
  masuk: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  keluar: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  backspace: '<path d="M9 6h11v12H9l-6-6z"/><path d="M13 10l4 4M17 10l-4 4"/>',
  unduh: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  motor:
    '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l3-7h5l4 7"/><path d="M9 10H7M14 10l1.5-3H18"/>',
};

export function icon(nama, kelas = 'h-6 w-6', tebal = 2) {
  return `<svg aria-hidden="true" class="${kelas}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${tebal}" stroke-linecap="round" stroke-linejoin="round">${BENTUK[nama] ?? ''}</svg>`;
}
