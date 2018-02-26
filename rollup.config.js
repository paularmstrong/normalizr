import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import { name } from './package.json';

const isProduction = process.env.NODE_ENV === 'production';

const destBase = 'dist/normalizr';
const destExtension = `${isProduction ? '.min' : ''}.js`;

export default {
  input: 'src/index.js',
  output: [
    { file: `${destBase}${destExtension}`, format: 'cjs' },
    { file: `${destBase}.es${destExtension}`, format: 'es' },
    { file: `${destBase}.umd${destExtension}`, format: 'umd', name },
    { file: `${destBase}.amd${destExtension}`, format: 'amd', name },
    { file: `${destBase}.browser${destExtension}`, format: 'iife', name }
  ],
  plugins: [
    babel({
      plugins: ['external-helpers']
    }),
    isProduction && uglify({}, minify),
    filesize()
  ].filter(Boolean)
};
