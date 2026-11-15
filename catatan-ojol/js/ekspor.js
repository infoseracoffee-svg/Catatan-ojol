/** Ekspor data: CSV (dibuka Excel / Google Sheets) dan unduh berkas. */
import { jam, kunciHari } from './utils.js';

/** Teks aman untuk CSV: tangkal formula (=,+,-,@) dan kutip bila perlu. */
function teks(nilai) {
  let s = String(nilai ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Pemisah kolom memakai titik koma karena Excel dengan pengaturan regional Indonesia
 * memakai ";" sebagai pemisah daftar. Google Sheets mengenalinya otomatis.
 */
export function buatCsv(daftar) {
  const baris = [['Tanggal', 'Jam', 'Jenis', 'Kategori', 'Aplikasi', 'Catatan', 'Nominal'].join(';')];
  const urut = [...daftar].sort((a, b) => a.waktu.localeCompare(b.waktu));
  for (const t of urut) {
    const d = new Date(t.waktu);
    baris.push(
      [
        kunciHari(d),
        jam(d),
        t.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
        teks(t.kategori),
        teks(t.aplikasi),
        teks(t.catatan),
        t.tipe === 'masuk' ? t.nominal : -t.nominal,
      ].join(';')
    );
  }
  return baris.join('\r\n');
}

export function unduh(namaBerkas, isi, mime) {
  const blob = new Blob([isi], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaBerkas;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
