const { NODE_ENV, BABEL_ENV } = process.env;

const cjs = BABEL_ENV === 'cjs' || NODE_ENV === 'test';

module.exports = {
  presets: [['env', { modules: false, loose: true }]],
  plugins: [
    cjs && 'transform-es2015-modules-commonjs',
    'transform-object-rest-spread',
    // TODO: use 'loose' mode for this after upgrading to babel@7
    'transform-class-properties'
  ].filter(Boolean)
};
