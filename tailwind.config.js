const { profile, error } = require('console')
const { text } = require('stream/consumers')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Основные цвета
        background: 'hsl(var(--background))',
        text: 'hsl(var(--text))',
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
        profile: 'hsl(var(--profile))',
        tint: 'hsl(var(--tint))',
        inactive: 'hsl(var(--inactive))',
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
        
        // Дополнительные состояния
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        input: 'hsl(var(--input))',
      }
      }
    },
  plugins: [],
}

