const { default: React } = require('react')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    colors: {
      // Main background and text colors
      background: {
        DEFAULT: '#FFFFFF',
        dark: '#000000'
      },
      text: {
        DEFAULT: '#1A202C',
        dark: '#FFFFFF'
      },
      secondary: {
        DEFAULT: '#A3A3A3',
        dark: '#A3A3A3'
      },

      // Accent and interactive colors
      accent: {
        DEFAULT: '#E53E3E',
        dark: '#E53E3E'
      },
      tint: {
        DEFAULT: '#007CCB',
        dark: '#007CCB'
      },
      inactive: {
        DEFAULT: '#71717a',
        dark: '#71717a'
      },

      // Feedback and status colors
      success: {
        DEFAULT: '#22C55E',
        dark: '#22C55E'
      },
      error: {
        DEFAULT: '#EF4444',
        dark: '#EF4444'
      },
      warning: {
        DEFAULT: '#F59E0B',
        dark: '#F59E0B'
      },

      // UI-specific colors
      profile: {
        DEFAULT: '#F7F7F7',
        dark: '#2D3748'
      },
      surface: {
        DEFAULT: '#F8F9FA',
        dark: '#1A1A1A'
      },
      border: {
        DEFAULT: '#E5E7EB',
        dark: '#2D3748'
      },

      // Utility color
      transparent: 'transparent'
    },
  },
  darkMode: 'class', 
  plugins: [],
}
