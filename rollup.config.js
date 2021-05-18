import babel from 'rollup-plugin-babel';
import dts from 'rollup-plugin-dts';
import filesize from 'rollup-plugin-filesize';
import { name } from './package.json';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

const destBase = 'dist/normalizr';
const destExtension = `${isProduction ? '.min' : ''}.js`;

export default [
  {
    input: 'src/index.js',
    output: [
      { file: `${destBase}${destExtension}`, format: 'cjs' },
      { file: `${destBase}.es${destExtension}`, format: 'es' },
      { file: `${destBase}.umd${destExtension}`, format: 'umd', name },
      { file: `${destBase}.amd${destExtension}`, format: 'amd', name },
      { file: `${destBase}.browser${destExtension}`, format: 'iife', name },
    ],
    plugins: [babel({}), isProduction && terser(), filesize()].filter(Boolean),
  },
  {
    input: 'src/index.d.ts',
    output: [{ file: 'dist/normalizr.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
