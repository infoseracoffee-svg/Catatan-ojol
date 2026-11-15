/** Helper murni (tanpa akses DOM): format Rupiah, tanggal, dan ringkasan transaksi. */

export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
export const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** 292000 -> "292.000" */
export const angka = (n) => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** 292000 -> "Rp 292.000", -5000 -> "−Rp 5.000" */
export const rupiah = (n) => `${n < 0 ? '−' : ''}Rp ${angka(n)}`;

/** Untuk daftar transaksi: "+Rp 24.000" / "−Rp 30.000" */
export const rupiahTanda = (n, tipe) => `${tipe === 'masuk' ? '+' : '−'}Rp ${angka(n)}`;

const pad = (n) => String(n).padStart(2, '0');

export const jam = (d) => `${pad(d.getHours())}.${pad(d.getMinutes())}`;
export const kunciHari = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const awalHari = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const samaHari = (a, b) => kunciHari(a) === kunciHari(b);
export const tanggalPanjang = (d) => `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
export const tanggalPendek = (d) => `${d.getDate()} ${BULAN_SINGKAT[d.getMonth()]}`;

/** "Hari ini · 15 Nov", "Kemarin · 14 Nov", atau "Sabtu, 7 Nov" */
export function labelHari(d, sekarang = new Date()) {
  const kemarin = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate() - 1);
  if (samaHari(d, sekarang)) return `Hari ini · ${tanggalPendek(d)}`;
  if (samaHari(d, kemarin)) return `Kemarin · ${tanggalPendek(d)}`;
  return `${HARI[d.getDay()]}, ${tanggalPendek(d)}`;
}

/** Awal minggu (Senin 00.00) dari tanggal d */
export function awalMinggu(d) {
  const x = awalHari(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

/** Wajib dipakai untuk semua teks dari pengguna yang masuk ke innerHTML. */
export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const BUKAN_ORDER = new Set(['Tip', 'Bonus']);

/** Ringkasan sekumpulan transaksi: total masuk, keluar, laba bersih, jumlah order. */
export function ringkas(daftar) {
  let masuk = 0;
  let keluar = 0;
  let order = 0;
  for (const t of daftar) {
    if (t.tipe === 'masuk') {
      masuk += t.nominal;
      if (!BUKAN_ORDER.has(t.kategori)) order += 1;
    } else {
      keluar += t.nominal;
    }
  }
  return { masuk, keluar, bersih: masuk - keluar, order };
}
