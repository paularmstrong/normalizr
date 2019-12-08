const { NODE_ENV, BABEL_ENV } = process.env;

module.exports = {
  presets: [['@babel/preset-env', { loose: true }]],
  plugins: [
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-proposal-class-properties', { loose: true }]
  ].filter(Boolean)
};
