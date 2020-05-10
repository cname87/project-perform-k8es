module.exports = {
  extends: '../.eslintrc.js',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    /* dummy tsconfig.json to include all files that are to be linted */
    /* required by typescript parser */
    project: __dirname + '/tsconfig.eslint.json',
  },
};
