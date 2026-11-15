/**
 * Lapisan data. Semua halaman hanya bicara ke `store`, tidak ke localStorage langsung.
 * Untuk pindah ke IndexedDB atau backend, cukup ganti isi file ini.
 *
 * Bentuk transaksi:
 * { id, tipe: 'masuk' | 'keluar', nominal (Rupiah bulat), kategori, aplikasi | null, catatan, waktu (ISO UTC) }
 */
import { uid } from './utils.js';

const KUNCI = 'catatan-ojol:v1';

const bawaan = () => ({
  transaksi: [],
  pengaturan: {
    targetHarian: 300000,
    aplikasi: ['Gojek', 'Grab', 'Maxim', 'inDrive'],
    kategoriMasuk: ['Antar penumpang', 'Antar makanan', 'Antar barang', 'Tip', 'Bonus'],
    kategoriKeluar: ['Bensin', 'Servis', 'Parkir', 'Makan', 'Pulsa & data'],
    tema: 'terang', // 'terang' | 'gelap' | 'otomatis'
  },
});

const pendengar = new Set();
let data = muat();

function muat() {
  try {
    const mentah = globalThis.localStorage?.getItem(KUNCI);
    return mentah ? rapikanData(JSON.parse(mentah)) : bawaan();
  } catch {
    return bawaan();
  }
}

function rapikanData(obj) {
  const dasar = bawaan();
  const transaksi = Array.isArray(obj?.transaksi) ? obj.transaksi.map(rapikanTransaksi).filter(Boolean) : [];
  return { transaksi, pengaturan: { ...dasar.pengaturan, ...(obj?.pengaturan ?? {}) } };
}

function rapikanTransaksi(t) {
  if (!t || (t.tipe !== 'masuk' && t.tipe !== 'keluar')) return null;
  const nominal = Math.round(Number(t.nominal));
  const waktu = new Date(t.waktu);
  if (!Number.isFinite(nominal) || nominal <= 0 || Number.isNaN(waktu.getTime())) return null;
  return {
    id: typeof t.id === 'string' && t.id ? t.id : uid(),
    tipe: t.tipe,
    nominal,
    kategori: String(t.kategori ?? '').slice(0, 40) || 'Lainnya',
    aplikasi: t.aplikasi ? String(t.aplikasi).slice(0, 40) : null,
    catatan: t.catatan ? String(t.catatan).slice(0, 80) : '',
    waktu: waktu.toISOString(),
  };
}

function simpan() {
  try {
    globalThis.localStorage.setItem(KUNCI, JSON.stringify(data));
  } catch (galat) {
    console.error('Gagal menyimpan ke penyimpanan lokal', galat);
    globalThis.dispatchEvent?.(new CustomEvent('ojol:gagal-simpan'));
  }
  pendengar.forEach((fn) => fn());
}

export const store = {
  /** Semua transaksi, terbaru di atas. */
  semua() {
    return [...data.transaksi].sort((a, b) => b.waktu.localeCompare(a.waktu));
  },

  tambah({ tipe, nominal, kategori, aplikasi = null, catatan = '', waktu = new Date() }) {
    const t = rapikanTransaksi({ id: uid(), tipe, nominal, kategori, aplikasi, catatan, waktu });
    if (!t) throw new Error('Data transaksi tidak valid');
    data.transaksi.push(t);
    simpan();
    return t;
  },

  hapus(id) {
    const sebelum = data.transaksi.length;
    data.transaksi = data.transaksi.filter((t) => t.id !== id);
    if (data.transaksi.length !== sebelum) simpan();
  },

  hapusSemua() {
    data.transaksi = [];
    simpan();
  },

  pengaturan() {
    return data.pengaturan;
  },

  ubahPengaturan(patch) {
    data.pengaturan = { ...data.pengaturan, ...patch };
    simpan();
  },

  /** Cadangan lengkap sebagai teks JSON. */
  ekspor() {
    return JSON.stringify({ aplikasi: 'catatan-ojol', versi: 1, diekspor: new Date().toISOString(), ...data }, null, 2);
  },

  /** Periksa isi cadangan tanpa mengubah data. Mengembalikan jumlah transaksi valid; melempar Error bila formatnya salah. */
  periksaCadangan(teks) {
    const obj = JSON.parse(teks);
    if (!Array.isArray(obj?.transaksi)) throw new Error('Berkas bukan cadangan Catatan Ojol');
    return rapikanData(obj).transaksi.length;
  },

  /** Ganti seluruh data dengan isi cadangan. Melempar Error bila formatnya salah. */
  impor(teks) {
    const obj = JSON.parse(teks);
    if (!Array.isArray(obj?.transaksi)) throw new Error('Berkas bukan cadangan Catatan Ojol');
    data = rapikanData(obj);
    simpan();
    return data.transaksi.length;
  },

  /** Data contoh 14 hari terakhir supaya grafik dan laporan langsung terisi. */
  isiContoh() {
    const sekarang = new Date();
    let benih = 11;
    const acak = () => {
      benih = (benih * 9301 + 49297) % 233280;
      return benih / 233280;
    };
    const { aplikasi, kategoriMasuk, kategoriKeluar } = data.pengaturan;
    const baru = [];

    const catat = (tipe, nominal, kategori, app, hari, jamKe, menit) => {
      const waktu = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate() - hari, jamKe, menit);
      if (waktu > sekarang) return;
      const t = rapikanTransaksi({ id: uid(), tipe, nominal, kategori, aplikasi: app, catatan: '', waktu });
      if (t) baru.push(t);
    };

    for (let hari = 13; hari >= 0; hari--) {
      const jumlah = 9 + Math.floor(acak() * 8);
      for (let i = 0; i < jumlah; i++) {
        const nominal = Math.round((14000 + acak() * 24000) / 500) * 500;
        const app = aplikasi[Math.floor(acak() * aplikasi.length)] ?? null;
        const kategori = kategoriMasuk[Math.floor(acak() * Math.min(3, kategoriMasuk.length))] ?? 'Lainnya';
        catat('masuk', nominal, kategori, app, hari, 7 + Math.floor((i / jumlah) * 13), Math.floor(acak() * 60));
      }
      catat('keluar', acak() < 0.5 ? 30000 : 35000, kategoriKeluar[0] ?? 'Lainnya', null, hari, 13, 10);
      catat('keluar', 20000 + Math.floor(acak() * 6) * 1000, kategoriKeluar[3] ?? 'Lainnya', null, hari, 12, 20);
      if (acak() < 0.5) catat('keluar', 3000 + Math.floor(acak() * 3) * 1000, kategoriKeluar[2] ?? 'Lainnya', null, hari, 16, 5);
      if (hari === 6) catat('keluar', 65000, kategoriKeluar[1] ?? 'Lainnya', null, hari, 15, 30);
    }

    data.transaksi.push(...baru);
    simpan();
    return baru.length;
  },

  /** Berlangganan perubahan data. Mengembalikan fungsi untuk berhenti. */
  berlangganan(fn) {
    pendengar.add(fn);
    return () => pendengar.delete(fn);
  },
};
