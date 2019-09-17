import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import { name } from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

const destBase = 'dist/normalizr';
const destExtension = `${isProduction ? '.min' : ''}.js`;
const extensions = ['.js', '.ts', '.tsx', '.mjs', '.json', '.node'];

function snakeCase(id) {
  return id.replace(/(-|\/)/g, '_').replace(/@/g, '');
}

export default [
  {
    input: 'src/index.js',
    output: [
      { file: `${destBase}${destExtension}`, format: 'cjs' },
      { file: `${destBase}.umd${destExtension}`, format: 'umd', name: snakeCase(name) },
      { file: `${destBase}.amd${destExtension}`, format: 'amd', name: snakeCase(name) },
      { file: `${destBase}.browser${destExtension}`, format: 'iife', name: snakeCase(name) }
    ],
    plugins: [
      babel({ runtimeHelpers: true }),
      resolve({ extensions }),
      commonjs({ extensions }),
      isProduction && terser(),
      filesize()
    ].filter(Boolean)
  },
  {
    input: 'src/index.js',
    output: [{ file: `${destBase}.es${destExtension}`, format: 'es' }],
    plugins: [babel({ runtimeHelpers: true }), isProduction && terser(), filesize()].filter(Boolean)
  }
];
