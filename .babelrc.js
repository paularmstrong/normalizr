const { NODE_ENV, BABEL_ENV } = process.env;

const cjs = BABEL_ENV === 'cjs' || NODE_ENV === 'test';

module.exports = {
  presets: [['@babel/preset-env', { loose: true }]],
  plugins: [
    // cjs && 'transform-es2015-modules-commonjs',
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ].filter(Boolean)
};
