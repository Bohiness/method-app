const { error } = require('console');
const { Colors } = require('./src/shared/constants/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        colors: {
            // Main background and text colors
            background: {
                DEFAULT: Colors.light.background,
                dark: Colors.dark.background,
            },
            text: {
                DEFAULT: Colors.light.text,
                dark: Colors.dark.text,
            },
            secondary: {
                dark: {
                    DEFAULT: Colors.light.secondary.dark,
                    dark: Colors.dark.secondary.dark,
                },
                light: {
                    DEFAULT: Colors.light.secondary.light,
                    dark: Colors.dark.secondary.light,
                },
            },

            // UI-specific colors
            surface: {
                paper: {
                    DEFAULT: Colors.light.surface.paper,
                    dark: Colors.dark.surface.paper,
                },
                canvas: {
                    DEFAULT: Colors.light.surface.canvas,
                    dark: Colors.dark.surface.canvas,
                },
                stone: {
                    DEFAULT: Colors.light.surface.stone,
                    dark: Colors.dark.surface.stone,
                },
            },

            // Accent and interactive colors
            error: {
                DEFAULT: Colors.light.error,
                dark: Colors.dark.error,
            },
            success: {
                DEFAULT: Colors.light.success,
                dark: Colors.dark.success,
            },
            warning: {
                DEFAULT: Colors.light.warning,
                dark: Colors.dark.warning,
            },
            tint: {
                DEFAULT: Colors.light.tint,
                dark: Colors.dark.tint,
            },
            inactive: {
                DEFAULT: Colors.light.inactive,
                dark: Colors.dark.inactive,
            },
            border: {
                DEFAULT: Colors.light.border,
                dark: Colors.dark.border,
            },

            // Additional colors
            transparent: Colors.light.transparent,
        },
    },
    darkMode: 'class',
    plugins: ['nativewind'],
};
