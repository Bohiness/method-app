
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
        DEFAULT: '#232324',
        dark: '#FFFFFF'
      },
      secondary: {
        dark: {
          DEFAULT: '#484848',
          dark: '#484848'
        },
        light: {
          DEFAULT: '#868686',
          dark: '#868686'
        }
      },

      // UI-specific colors
      surface: {
        paper: {
          DEFAULT: '#F3F3F1',
          dark: '#1F1F1F'  
        },
        canvas: {
          DEFAULT: '#E3DED8',
          dark: '#2A2A2A'  
        },
        stone: {
          DEFAULT: '#C4C2C5',
          dark: '#333333' 
        },
      },

      // Accent and interactive colors
      error: {
        DEFAULT: '#E53E3E',
        dark: '#E53E3E'
      },
      success: {
        DEFAULT: '#22C55E',
        dark: '#22C55E'
      },
      warning: {
        DEFAULT: '#F59E0B',
        dark: '#F59E0B'
      },
      tint: {
        DEFAULT: '#007CCB',
        dark: '#007CCB'
      },
      inactive: {
        DEFAULT: '#71717a',
        dark: '#71717a'
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
  plugins: ['nativewind'],
}
