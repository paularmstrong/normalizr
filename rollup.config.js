import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import uglify from 'rollup-plugin-uglify';

const isProduction = process.env.NODE_ENV === 'production';

const destBase = 'dist/normalizr';
const destExtension = `${isProduction ? '.min' : ''}.js`;

export default {
  entry: 'src/index.js',
  moduleName: 'normalizr',
  targets: [
    { dest: `${destBase}${destExtension}`, format: 'cjs' },
    { dest: `${destBase}.umd${destExtension}`, format: 'umd' },
    { dest: `${destBase}.amd${destExtension}`, format: 'amd' },
    { dest: `${destBase}.browser${destExtension}`, format: 'iife' }
  ],
  plugins: [
    babel({ babelrc: false, presets: [ 'es2015-rollup', 'stage-1' ] }),
    isProduction && uglify(),
    filesize()
  ].filter((plugin) => !!plugin)
};

