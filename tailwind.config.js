/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { ink: '#0f1f3d' }, fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'] } } },
  plugins: [],
};
