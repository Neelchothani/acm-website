/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#060913",
        neon: "#00f0ff",
        magenta: "#ff007f",
        violet: "#9d4edd",
        darkblue: "#0c1328",
        cyanGlow: "rgba(0, 240, 255, 0.4)",
      },
      fontFamily: {
        orbitron: ['Orbitron', 'Oxanium', 'sans-serif'],
        oxanium: ['Oxanium', 'Orbitron', 'sans-serif'],
        shareTech: ['"Share Tech Mono"', 'monospace'],
        momo: ['Orbitron', 'Oxanium', 'sans-serif'],
        display: ['Orbitron', 'Oxanium', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'ui-monospace', 'monospace'],
        sans: ['Oxanium', 'Orbitron', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
