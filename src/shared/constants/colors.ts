// src/shared/constants/colors.ts

export const lightColors = {
    background: '#FFFFFF',
    text: '#232324',
    secondary: {
      dark: '#484848',
      light: '#868686'
    },
    surface: {
      paper: '#F3F3F1',
      canvas: '#E3DED8',
      stone: '#C4C2C5'
    },
    error: '#E53E3E',
    success: '#22C55E',
    warning: '#F59E0B',
    tint: '#007CCB',
    inactive: '#71717a',
    border: '#E5E7EB',
    transparent: 'transparent'
  } as const
  
  export const darkColors = {
    background: '#000000',
    text: '#FFFFFF',
    secondary: {
      dark: '#868686',
      light: '#868686'
    },
    surface: {
      paper: '#1F1F1F',
      canvas: '#2A2A2A',
      stone: '#333333'
    },
    error: '#E53E3E',
    success: '#22C55E',
    warning: '#F59E0B',
    tint: '#007CCB',
    inactive: '#71717a',
    border: '#2D3748',
    transparent: 'transparent'
  } as const
  
  export const Colors = {
    light: lightColors,
    dark: darkColors
  } as const