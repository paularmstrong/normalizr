import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import uglify from 'rollup-plugin-uglify';

const destBase = 'dist/normalizr'
const isProduction = process.env.NODE_ENV === 'production';
const destExtension = `${isProduction ? '.min' : ''}.js`;

export default {
  entry: 'src/index.js',
  moduleName: 'normalizr',
  targets: [
    { dest: `${destBase}${destExtension}`, format: 'cjs' },
    { dest: `${destBase}.umd${destExtension}`, format: 'umd' }
  ],
  plugins: [
    babel({ babelrc: false, presets: [ 'es2015-rollup', 'stage-1' ] }),
    isProduction && uglify(),
    filesize(),
  ].filter((plugin) => !!plugin)
};

