import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';

export default [
    {
        // Применяем конфигурацию ко всем файлам проекта
        files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],

        // Базовые настройки для парсера TypeScript и JSX
        languageOptions: {
            parser: (await import('@typescript-eslint/parser')).default,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },

        // Импортируем плагины
        plugins: {
            'react-hooks': reactHooksPlugin,
            'react-native': reactNativePlugin,
            react: reactPlugin,
        },

        // Правила
        rules: {
            ...reactHooksPlugin.configs.recommended.rules,
            ...reactPlugin.configs.recommended.rules,
            // Специфичные правила для React Native
            'react-native/no-unused-styles': 'warn',
            'react-native/no-inline-styles': 'warn',
            'react-native/no-color-literals': 'warn',
            'react-native/no-single-element-style-arrays': 'warn',
            // Отключаем правила, которые конфликтуют с Expo и React Native
            'react/react-in-jsx-scope': 'off',
            'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
        },

        // Настройки для импортов
        settings: {
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                },
                node: {
                    extensions: [
                        '.js',
                        '.jsx',
                        '.ts',
                        '.tsx',
                        '.ios.js',
                        '.ios.jsx',
                        '.ios.ts',
                        '.ios.tsx',
                        '.android.js',
                        '.android.jsx',
                        '.android.ts',
                        '.android.tsx',
                    ],
                },
                'babel-module': {
                    root: ['.'],
                    extensions: [
                        '.js',
                        '.jsx',
                        '.ts',
                        '.tsx',
                        '.ios.js',
                        '.ios.jsx',
                        '.ios.ts',
                        '.ios.tsx',
                        '.android.js',
                        '.android.jsx',
                        '.android.ts',
                        '.android.tsx',
                    ],
                    alias: {
                        '@app': './app',
                        '@pages': './src/pages',
                        '@widgets': './src/widgets',
                        '@features': './src/features',
                        '@entities': './src/entities',
                        '@shared': './src/shared',
                        '@processes': './src/processes',
                        '@assets': './assets',
                        '@config': './src/shared/config',
                        '@context': './src/shared/context',
                        '@lib': './src/shared/lib',
                        '@ui': './src/shared/ui',
                        '@hooks': './src/shared/hooks',
                        '@types': './src/shared/types',
                        '@api': './src/shared/api',
                        '@constants': './src/shared/constants',
                    },
                },
            },
            // Специфичные настройки для React Native
            'react-native': {
                version: 'detect',
            },
            // Настройка версии React
            react: {
                version: 'detect',
            },
        },
    },

    // Игнорирование файлов
    {
        ignores: ['node_modules/**', 'dist/**', 'build/**', '.expo/**', 'android/**', 'ios/**'],
    },
];
