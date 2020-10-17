module.exports = {
  '*.{md}': ['prettier --write', 'git add'],
  '*.{js,jsx,json}': ['yarn lint', 'prettier --write', 'git add'],
  '*.{js,jsx,ts,tsx}': ['jest --bail --findRelatedTests'],
};
