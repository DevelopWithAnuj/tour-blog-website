/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./**/*.html",
    "./src/**/*.js",
  ],
  theme: {
        extend: {
          backgroundImage: {
            'hero-pattern': "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('../assests/new-york3.png')"
          },
          animation: {
            'hero-float': 'heroFloat 5s ease-in-out infinite',
          },
          keyframes: {
            heroFloat: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
            }
          }
        }
      },
  plugins: [],
};
