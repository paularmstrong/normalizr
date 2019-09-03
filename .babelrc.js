const { NODE_ENV, BABEL_ENV } = process.env;

const cjs = BABEL_ENV === 'cjs' || NODE_ENV === 'test';

module.exports = {
  presets: [['@babel/preset-env', { loose: true }]],
  plugins: [
    [
      require('@babel/plugin-transform-runtime').default,
      {
        corejs: false,
        helpers: true,
        regenerator: true,
        useESModules: !cjs,
        version: '7.5.5'
      }
    ],
    // cjs && 'transform-es2015-modules-commonjs',
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ].filter(Boolean)
};
