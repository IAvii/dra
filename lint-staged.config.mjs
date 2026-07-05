export default {
  '*.{js,cjs,mjs,ts,tsx,jsx}': ['prettier --write', 'eslint --fix'],
  '*.{json,yml,yaml,md}': ['prettier --write'],
};
