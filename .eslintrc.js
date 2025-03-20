const { default: typescript } = require('react-native-reanimated')
const { settings } = require('./.eslintrc')

module.exports = {
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        paths: ['src'],
        moduleDirectory: ['node_modules', 'src/'],
      },
      'babel-module': {
        root: ['.'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
          '@': 'src',
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
          '@constants': './src/shared/constants'
        }
      },
    },
  },
};