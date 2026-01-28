import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Retro Game Show Palette
        void: '#0a0a0f',
        deep: '#0f1729',
        elevated: '#1a2744',
        'neon-gold': '#ffd700',
        'neon-cyan': '#00ffff',
        'neon-pink': '#ff1493',
        'neon-green': '#00ff66',
        'neon-purple': '#bf00ff',
        silver: '#c0c0c0',
        // Legacy
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        question: ['Oswald', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.5)',
        'glow-pink': '0 0 20px rgba(255, 20, 147, 0.5)',
        'glow-green': '0 0 20px rgba(0, 255, 102, 0.5)',
        'glow-purple': '0 0 20px rgba(191, 0, 255, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'reveal-slide': 'reveal-slide 600ms ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(255, 20, 147, 0.5), 0 0 40px rgba(255, 20, 147, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(255, 20, 147, 0.7), 0 0 60px rgba(255, 20, 147, 0.5)',
          },
        },
        'reveal-slide': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
