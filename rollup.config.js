import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import uglify from 'rollup-plugin-uglify';

const isProduction = process.env.NODE_ENV === 'production';
const dest = `dist/normalizr${isProduction ? '.min' : ''}.js`;

export default {
  entry: 'src/index.js',
  dest,
  format: 'cjs',
  plugins: [
    babel({ babelrc: false, presets: [ 'es2015-rollup', 'stage-1' ] }),
    isProduction && uglify(),
    filesize({
      render: (options, size, gzip) => `
  Package:      ${dest}
  Bundle Size:  ${size}
  Compressed:   ${gzip}
`
    })
  ].filter((plugin) => !!plugin)
};
