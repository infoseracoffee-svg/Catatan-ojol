/*
 * Satu konfigurasi untuk dua mode:
 * - Play CDN (browser): file ini dimuat lewat <script> dan mengisi window.tailwind.config
 * - Tailwind CLI (Node): dibaca lewat module.exports
 *
 * Warna memakai CSS variable (lihat css/app.css) sehingga tema terang/gelap
 * cukup mengganti variabel, tanpa menulis varian dark: di setiap class.
 */
const warna = (nama) => `rgb(var(--${nama}) / <alpha-value>)`;

const config = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        bg: warna('bg'),
        surface: warna('surface'),
        ink: warna('ink'),
        muted: warna('muted'),
        line: warna('line'),
        edge: warna('edge'),
        track: warna('track'),
        brand: warna('brand'),
        'brand-soft': warna('brand-soft'),
        'on-brand': warna('on-brand'),
        expense: warna('expense'),
        'expense-soft': warna('expense-soft'),
        'on-expense': warna('on-expense'),
        hero: warna('hero'),
        'hero-soft': warna('hero-soft'),
        'hero-muted': '#A9B8AF',
        sun: '#F4B81F',
        night: '#16231D',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
} else {
  window.tailwind.config = config;
}
