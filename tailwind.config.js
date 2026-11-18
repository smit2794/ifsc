/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPage: '#F6F8FB',
        bgSurface: '#FFFFFF',
        borderColor: '#E3E8EF',
        textPrimary: '#101828',
        textSecondary: '#475467',
        brandNavy: '#1D3A8A',
        brandTeal: '#0F9D8A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
        modal: '0 8px 24px 0 rgb(0 0 0 / 0.10)',
      },
    },
  },
  plugins: [],
};
