module.exports = function (api) {
    api.cache(true);
    return {
        presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
        plugins: [
            '@babel/plugin-proposal-export-namespace-from',
            [
                'module-resolver',
                {
                    root: ['.'],
                    extensions: [
                        '.ios.ts',
                        '.android.ts',
                        '.ts',
                        '.ios.tsx',
                        '.android.tsx',
                        '.tsx',
                        '.jsx',
                        '.js',
                        '.json',
                        '.lottie',
                    ],
                    alias: {
                        '@app': './app',
                        '@assets': './assets',
                        '@pages': './src/pages',
                        '@widgets': './src/widgets',
                        '@features': './src/features',
                        '@entities': './src/entities',
                        '@shared': './src/shared',
                        '@processes': './src/processes',
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
            ],
        ],
    };
};
